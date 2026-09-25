import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/search?q= — global search across leads, clients, projects, tasks, content, staff
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (q.length < 2) {
      return NextResponse.json({ groups: [] });
    }

    const [leads, clients, projects, tasks, pages, posts, staff] = await Promise.all([
      prisma.lead.findMany({
        where: { OR: [{ name: { contains: q } }, { email: { contains: q } }, { company: { contains: q } }] },
        take: 5,
        select: { id: true, name: true, email: true, company: true, status: true },
      }),
      prisma.client.findMany({
        where: { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] },
        take: 5,
        select: { id: true, name: true, company: true, status: true },
      }),
      prisma.project.findMany({
        where: { OR: [{ name: { contains: q } }, { code: { contains: q } }] },
        take: 5,
        select: { id: true, name: true, code: true, status: true },
      }),
      prisma.task.findMany({
        where: { title: { contains: q } },
        take: 5,
        select: { id: true, title: true, status: true },
      }),
      prisma.page.findMany({
        where: { OR: [{ title: { contains: q } }, { slug: { contains: q } }] },
        take: 4,
        select: { id: true, title: true, slug: true, status: true },
      }),
      prisma.blogPost.findMany({
        where: { OR: [{ title: { contains: q } }, { slug: { contains: q } }] },
        take: 4,
        select: { id: true, title: true, slug: true, status: true },
      }),
      prisma.user.findMany({
        where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
        take: 4,
        select: { id: true, name: true, email: true, role: true },
      }),
    ]);

    const groups = [
      { key: "leads", label: "Leads", items: leads.map((l) => ({ id: l.id, title: l.name ?? l.email, subtitle: l.company ?? l.email, badge: l.status })) },
      { key: "clients", label: "Clients", items: clients.map((c) => ({ id: c.id, title: c.name, subtitle: c.company ?? "", badge: c.status })) },
      { key: "projects", label: "Projects", items: projects.map((p) => ({ id: p.id, title: p.name, subtitle: p.code ?? "", badge: p.status })) },
      { key: "tasks", label: "Tasks", items: tasks.map((t) => ({ id: t.id, title: t.title, subtitle: "", badge: t.status })) },
      { key: "pages", label: "Pages", items: pages.map((p) => ({ id: p.id, title: p.title, subtitle: `/${p.slug}`, badge: p.status })) },
      { key: "posts", label: "Blog Posts", items: posts.map((p) => ({ id: p.id, title: p.title, subtitle: `/${p.slug}`, badge: p.status })) },
      { key: "staff", label: "Staff", items: staff.map((s) => ({ id: s.id, title: s.name, subtitle: s.email, badge: s.role })) },
    ].filter((g) => g.items.length > 0);

    return NextResponse.json({ groups });
  } catch (e) {
    console.error("GET /api/search error", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
