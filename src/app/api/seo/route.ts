import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/seo?type=blog&slug=<slug> or type=page&slug=<slug>
// Returns SEO metadata for the given content
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "appearance.manage");
  if (isResponse(session)) return session;

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const slug = url.searchParams.get("slug");

    if (!type || !slug) {
      return NextResponse.json(
        { error: "type and slug are required" },
        { status: 400 }
      );
    }

    let title: string | null = null;
    let description: string | null = null;
    let ogImage: string | null = null;

    if (type === "blog") {
      const post = await db.blogPost.findUnique({ where: { slug } });
      if (post) {
        title = post.title;
        description = post.excerpt;
        ogImage = post.heroImage;
      }
    } else if (type === "page") {
      const page = await db.page.findUnique({ where: { slug } });
      if (page) {
        title = page.title;
        description = page.title;
      }
    }

    // Also fetch site-level content for defaults
    const siteContent = await db.siteContent.findMany();
    const contentMap: Record<string, string> = {};
    for (const row of siteContent) contentMap[row.key] = row.value;

    const defaultTitle = contentMap["seo.defaultTitle"] || "Climbix Marketing — SEO, AI Search & Lead Generation Agency";
    const defaultDescription = contentMap["seo.defaultDescription"] || "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies.";

    return NextResponse.json({
      title: title ? `${title} | Climbix Marketing` : defaultTitle,
      description: description || defaultDescription,
      ogImage: ogImage || null,
    });
  } catch (e) {
    console.error("GET /api/seo error", e);
    return NextResponse.json(
      { error: "Failed to fetch SEO data" },
      { status: 500 }
    );
  }
}

// PUT /api/seo — update site-level SEO defaults
export async function PUT(req: NextRequest) {
  const session = await requirePermission(req, "appearance.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { defaultTitle, defaultDescription } = body;

    const updates: Record<string, string> = {};
    if (defaultTitle) updates["seo.defaultTitle"] = defaultTitle;
    if (defaultDescription) updates["seo.defaultDescription"] = defaultDescription;

    for (const [key, value] of Object.entries(updates)) {
      await db.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PUT /api/seo error", e);
    return NextResponse.json(
      { error: "Failed to update SEO settings" },
      { status: 500 }
    );
  }
}
