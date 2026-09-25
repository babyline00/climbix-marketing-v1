import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db-alias";
import { can, parsePermissions, SYSTEM_ROLES } from "@/lib/rbac";

// ─────────────────────────────────────────────────────────────
// Password hashing — Node scrypt (no external dependency)
// Hash format: scrypt$<saltHex>$<hashHex>
// ─────────────────────────────────────────────────────────────

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN)
    .toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(hash, "hex");
    return (
      candidate.length === expected.length &&
      crypto.timingSafeEqual(candidate, expected)
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Session tokens — HMAC-SHA256 signed, 7 day expiry
// Format: base64url(payloadJson).base64url(signature)
// ─────────────────────────────────────────────────────────────

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = "climbix_session";

function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be configured and at least 32 characters long");
  }
  return secret;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
  sessionVersion: number;
  iat: number;
  exp: number;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

export function createSessionToken(
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    sessionVersion?: number;
  },
  ttlDays = 7
): string {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionVersion: user.sessionVersion ?? 0,
    iat: Date.now(),
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", sessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Session resolution — Authorization header OR session cookie
// ─────────────────────────────────────────────────────────────

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export interface SessionInfo {
  user: { id: string; name: string; email: string; role: string };
  roleLabel: string;
  permissions: string[];
}

/** Resolve the signed-in user; returns null when unauthenticated / deactivated */
export async function getSession(req: NextRequest): Promise<SessionInfo | null> {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) return null;
  if ((payload.sessionVersion ?? 0) !== user.sessionVersion) return null;

  const role = await prisma.role.findUnique({ where: { name: user.role } });
  const fallback = SYSTEM_ROLES.find((r) => r.name === user.role);
  const roleLabel = role?.label ?? fallback?.label ?? user.role;
  const permissions = role
    ? parsePermissions(role.permissions)
    : (fallback?.permissions ?? []);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    roleLabel,
    permissions,
  };
}

// ─────────────────────────────────────────────────────────────
// API guards — return a NextResponse when the check fails
// ─────────────────────────────────────────────────────────────

export async function requireAuth(
  req: NextRequest
): Promise<SessionInfo | NextResponse> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return session;
}

export async function requirePermission(
  req: NextRequest,
  perm: string
): Promise<SessionInfo | NextResponse> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  if (!can(session.permissions, perm)) {
    return NextResponse.json(
      { error: "You do not have permission to perform this action" },
      { status: 403 }
    );
  }
  return session;
}

export function isResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}

// ─────────────────────────────────────────────────────────────
// Activity log — fire-and-forget audit trail
// ─────────────────────────────────────────────────────────────

export async function logActivity(entry: {
  userId?: string | null;
  userName?: string;
  action: string;
  module?: string;
  details?: string;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: entry.userId ?? null,
        userName: entry.userName ?? "system",
        action: entry.action,
        module: entry.module ?? "system",
        details: entry.details ?? "",
      },
    });
  } catch (e) {
    console.error("logActivity failed", e);
  }
}

// ─────────────────────────────────────────────────────────────
// Login rate limiting — 8 attempts / minute / IP (in-memory)
// ─────────────────────────────────────────────────────────────

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitLogin(ip: string, maxAttempts = 8): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  rec.count += 1;
  return rec.count <= maxAttempts;
}
