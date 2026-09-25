import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DEFAULT_HEADER_LINKS, HEADER_LINK_KINDS } from "@/lib/header";
import { isResponse, requirePermission } from "@/lib/auth";

const VALID_KINDS: string[] = [...HEADER_LINK_KINDS];

// GET /api/header/links — all links (admin view: include inactive)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    let links = await db.headerLink.findMany({
      orderBy: { position: "asc" },
    });

    // Auto-seed if empty so the manager is never blank on fresh installs
    if (links.length === 0) {
      await db.headerLink.createMany({
        data: DEFAULT_HEADER_LINKS.map((l, i) => ({
          label: l.label,
          href: l.href,
          kind: l.kind,
          isSystem: true,
          position: (i + 1) * 10,
          isActive: true,
        })),
      });
      links = await db.headerLink.findMany({
        orderBy: { position: "asc" },
      });
    }

    return NextResponse.json({ links });
  } catch (e) {
    console.error("GET /api/header/links error", e);
    return NextResponse.json(
      { error: "Failed to fetch header links" },
      { status: 500 }
    );
  }
}

// POST /api/header/links — create a custom link { label, href, kind? }
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const label = typeof body?.label === "string" ? body.label.trim() : "";
    const href = typeof body?.href === "string" ? body.href.trim() : "";
    const kind =
      typeof body?.kind === "string" && VALID_KINDS.includes(body.kind)
        ? body.kind
        : "link";

    if (!label) {
      return NextResponse.json(
        { error: "label is required" },
        { status: 400 }
      );
    }
    if (kind === "link" && !href) {
      return NextResponse.json(
        { error: "href is required for custom links" },
        { status: 400 }
      );
    }

    const max = await db.headerLink.aggregate({ _max: { position: true } });
    const link = await db.headerLink.create({
      data: {
        label,
        href: href || "#",
        kind,
        isSystem: false,
        position: (max._max.position ?? 0) + 10,
        isActive: true,
      },
    });

    revalidatePath("/");
    const links = await db.headerLink.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ link, links }, { status: 201 });
  } catch (e) {
    console.error("POST /api/header/links error", e);
    return NextResponse.json(
      { error: "Failed to create header link" },
      { status: 500 }
    );
  }
}

// PATCH /api/header/links — bulk update { updates: [{ id, label?, href?, isActive?, position? }] }
export async function PATCH(req: NextRequest) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const updates: {
      id: string;
      label?: string;
      href?: string;
      isActive?: boolean;
      position?: number;
    }[] = body?.updates || [];

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates array is required" },
        { status: 400 }
      );
    }

    await Promise.all(
      updates.map((u) =>
        db.headerLink.update({
          where: { id: u.id },
          data: {
            ...(typeof u.label === "string" && u.label.trim()
              ? { label: u.label.trim() }
              : {}),
            ...(typeof u.href === "string" && u.href.trim()
              ? { href: u.href.trim() }
              : {}),
            ...(typeof u.isActive === "boolean" ? { isActive: u.isActive } : {}),
            ...(typeof u.position === "number" ? { position: u.position } : {}),
          },
        })
      )
    );

    revalidatePath("/");
    const links = await db.headerLink.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ links });
  } catch (e) {
    console.error("PATCH /api/header/links error", e);
    return NextResponse.json(
      { error: "Failed to update header links" },
      { status: 500 }
    );
  }
}
