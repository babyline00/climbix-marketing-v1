import { NextRequest, NextResponse } from "next/server";
import { handleLogin } from "@/lib/login";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handleLogin(req);
}
