import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// File types that must never be uploaded (executables / scripts / server code)
const BLOCKED_EXTENSIONS = [
  ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".sh", ".bash",
  ".ps1", ".jar", ".apk", ".app", ".deb", ".rpm", ".php", ".jsp",
  ".asp", ".aspx", ".dll", ".so", ".bin", ".wsf", ".vbs",
];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const DOCUMENT_CATEGORIES = ["general", "contract", "proposal", "invoice", "report", "design", "other"];
const RELATED_TYPES = ["project", "client", "lead", "staff"] as const;

// GET /api/documents — search + filter + pagination (server-side)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "documents.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") ?? 20) || 20));
    const q = (searchParams.get("q") ?? "").trim();
    const category = searchParams.get("category") ?? "all";
    const relatedType = searchParams.get("relatedType") ?? "all";

    const where = {
      ...(category !== "all" ? { category } : {}),
      ...(relatedType !== "all" ? { relatedType } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { relatedName: { contains: q } },
              { uploadedBy: { contains: q } },
              { notes: { contains: q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e) {
    console.error("GET /api/documents error", e);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

// POST /api/documents — multipart upload with secure validation
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "documents.manage");
  if (isResponse(session)) return session;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = ((formData.get("name") as string) || "").trim();
    const category = ((formData.get("category") as string) || "general").toLowerCase();
    const notes = (formData.get("notes") as string) || null;
    const relatedTypeRaw = (formData.get("relatedType") as string) || "";
    const relatedId = ((formData.get("relatedId") as string) || "").trim();
    const relatedName = ((formData.get("relatedName") as string) || "").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ error: "Document name too long (max 200 chars)" }, { status: 400 });
    }
    if (!DOCUMENT_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Secure file validation — reject executables and server-side scripts
    const ext = path.extname(file.name).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type "${ext}" is not allowed` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Resolve optional relation
    let relatedType: string | null = null;
    if (relatedTypeRaw && relatedTypeRaw !== "none") {
      if (!(RELATED_TYPES as readonly string[]).includes(relatedTypeRaw)) {
        return NextResponse.json({ error: "Invalid related type" }, { status: 400 });
      }
      if (!relatedId) {
        return NextResponse.json(
          { error: `Please select the ${relatedTypeRaw} this document belongs to` },
          { status: 400 }
        );
      }
      relatedType = relatedTypeRaw;
    }

    // Validate the related entity actually exists (prevents dangling references)
    let resolvedRelatedName = relatedName || null;
    if (relatedType) {
      const model = relatedType === "staff" ? "user" : relatedType;
      const delegate = (prisma as unknown as Record<string, { findUnique: (args: Record<string, unknown>) => Promise<unknown> }>)[model];
      const record = (await delegate?.findUnique({
        where: { id: relatedId },
        select: { name: true },
      })) as { name: string } | null;
      if (!record) {
        return NextResponse.json({ error: `Selected ${relatedType} no longer exists` }, { status: 400 });
      }
      resolvedRelatedName = record.name;
    }

    // Store file with randomized name (original extension preserved)
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, storedName), buffer);

    const doc = await prisma.document.create({
      data: {
        name,
        storedName,
        url: `/uploads/documents/${storedName}`,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        category,
        uploadedBy: session.user.name,
        relatedType,
        relatedId: relatedType ? relatedId : null,
        relatedName: relatedType ? resolvedRelatedName : null,
        notes,
      },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "document.create",
      module: "documents",
      details: `Uploaded document ${doc.name}`,
    });

    // In-app notification
    await prisma.notification.create({
      data: {
        type: "system",
        title: "Document uploaded",
        message: `${doc.name} was uploaded by ${session.user.name}`,
        href: "#admin",
      },
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (e) {
    console.error("POST /api/documents error", e);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
