import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, isResponse, requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// GET /api/blog-posts — public published posts; authenticated content users can see drafts
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (session && !can(session.permissions, "content.view")) {
      return NextResponse.json({ error: "You do not have permission to view content" }, { status: 403 });
    }
    const posts = await db.blogPost.findMany({
      where: session ? undefined : { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ posts });
  } catch (e) {
    console.error("GET /api/blog-posts error", e);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/blog-posts — create a new blog post
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      author,
      heroImage,
      readTime,
      status,
      featured,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        content: content || JSON.stringify([]),
        category: category || null,
        tags: tags || null,
        author: author || "Climbix Team",
        heroImage: heroImage || "from-brand-500/20 to-brand-700/10",
        readTime: readTime || "5 min read",
        status: status || "published",
        featured: featured ?? false,
      },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error("POST /api/blog-posts error", e);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
