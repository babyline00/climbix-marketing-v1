import { NextRequest, NextResponse } from "next/server";
import { handleLogin } from "@/lib/login";

export const runtime = "nodejs";

// Legacy endpoint — kept for backward compatibility.
// Accepts { password } (legacy single-password clients) or { email, password }.
export async function POST(req: NextRequest) {
  return handleLogin(req);
}
