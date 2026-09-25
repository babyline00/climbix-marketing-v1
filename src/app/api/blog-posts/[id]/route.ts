import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission, logActivity } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function revalidatePost(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

// Static-backed rows are addressed as "system:<slug>" (or legacy "system-<slug>")
// so that editing a built-in article upserts the override row instead of erroring.
function resolveKey(id: string): { slug?: string; rowId?: string } {
  if (id.startsWith("system:")) return { slug: id.slice("system:".length) };
  if (id.startsWith("system-")) return { slug: id.slice("system-".length) };
  return { rowId: id };
}

// GET /api/blog-posts/[id] — get a single blog post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { slug, rowId } = resolveKey(id);
    const post = slug
      ? await db.blogPost.findUnique({ where: { slug } })
      : await db.blogPost.findUnique({ where: { id: rowId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (e) {
    console.error("GET /api/blog-posts/[id] error", e);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH /api/blog-posts/[id] — update (upserts built-in rows by slug)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = (await req.json()) ?? {};
    const { slug, rowId } = resolveKey(id);

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = String(body.title);
    if (body.slug !== undefined) data.slug = String(body.slug);
    if (body.excerpt !== undefined) data.excerpt = String(body.excerpt);
    if (body.content !== undefined) data.content = String(body.content);
    if (body.category !== undefined) data.category = body.category ? String(body.category) : null;
    if (body.tags !== undefined) data.tags = body.tags ? String(body.tags) : null;
    if (body.author !== undefined) data.author = String(body.author);
    if (body.heroImage !== undefined) data.heroImage = body.heroImage ? String(body.heroImage) : null;
    if (body.readTime !== undefined) data.readTime = String(body.readTime);
    if (body.status !== undefined) data.status = String(body.status);
    if (body.featured !== undefined) data.featured = Boolean(body.featured);

    let post;
    if (slug) {
      if (data.slug && data.slug !== slug) {
        const conflict = await db.blogPost.findUnique({
          where: { slug: String(data.slug) },
        });
        const existing = await db.blogPost.findUnique({ where: { slug } });
        if (conflict && conflict.id !== existing?.id) {
          return NextResponse.json(
            { error: `Slug "${String(data.slug)}" is already in use` },
            { status: 409 }
          );
        }
      }
      const existing = await db.blogPost.findUnique({ where: { slug } });
      post = existing
        ? await db.blogPost.update({ where: { id: existing.id }, data: data as never })
        : await db.blogPost.create({
            data: {
              title: String(data.title || body.title || ""),
              slug: String(data.slug || slug),
              excerpt: data.excerpt ? String(data.excerpt) : "",
              content: data.content ? String(data.content) : "<p></p>",
              category: data.category ? String(data.category) : null,
              tags: data.tags ? String(data.tags) : null,
              author: String(data.author || "Climbix Team"),
              heroImage: data.heroImage
                ? String(data.heroImage)
                : "from-brand-500/20 to-brand-700/10",
              readTime: String(data.readTime || "5 min read"),
              status: String(data.status || "published"),
              featured: Boolean(data.featured),
            } as never,
          });
    } else {
      if (!rowId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
      post = await db.blogPost
        .update({ where: { id: rowId }, data: data as never })
        .catch(() => null);
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePost(String(data.slug || slug || post.slug));
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "blog.update",
      module: "content",
      details: `Updated blog post ${post.slug}`,
    });
    return NextResponse.json({ post });
  } catch (e) {
    console.error("PATCH /api/blog-posts/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE /api/blog-posts/[id] — delete (built-in resets the row → defaults)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const { slug, rowId } = resolveKey(id);

    if (slug) {
      await db.blogPost.deleteMany({ where: { slug } });
      revalidatePost(slug);
    } else if (rowId) {
      const post = await db.blogPost.findUnique({ where: { id: rowId } });
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await db.blogPost.delete({ where: { id: rowId } });
      revalidatePost(post.slug);
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "blog.delete",
      module: "content",
      details: `Deleted blog post ${slug || rowId || ""}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/blog-posts/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}