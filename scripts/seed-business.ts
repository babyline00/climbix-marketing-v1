/**
 * Seed demo business data: clients, projects, tasks, follow-ups.
 * Idempotent — keyed by unique fields.
 *   bun scripts/seed-business.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding clients…");
  const acme = await prisma.client.upsert({
    where: { id: "demo-client-acme" },
    update: {},
    create: {
      id: "demo-client-acme",
      name: "Acme Retail Group",
      company: "Acme Retail Group LLC",
      email: "hello@acmeretail.com",
      phone: "+92 300 1112223",
      website: "https://acmeretail.com",
      industry: "Retail",
      country: "Pakistan",
      city: "Lahore",
      status: "active",
    },
  });
  const nova = await prisma.client.upsert({
    where: { id: "demo-client-nova" },
    update: {},
    create: {
      id: "demo-client-nova",
      name: "Nova Clinics",
      company: "Nova Healthcare Pvt Ltd",
      email: "info@novaclinics.com",
      phone: "+92 321 4445556",
      website: "https://novaclinics.com",
      industry: "Healthcare",
      country: "Pakistan",
      city: "Karachi",
      status: "active",
    },
  });

  console.log("Seeding projects…");
  const p1 = await prisma.project.upsert({
    where: { code: "CLB-001" },
    update: {},
    create: {
      name: "Acme E-commerce SEO Sprint",
      code: "CLB-001",
      description: "3-month technical SEO + content program for Acme's online store.",
      clientId: acme.id,
      managerName: "Mike Tanner",
      status: "active",
      priority: "high",
      progress: 45,
      budget: 500000,
      actualCost: 180000,
      revenue: 750000,
      startDate: new Date(Date.now() - 45 * 864e5),
      deadline: new Date(Date.now() + 45 * 864e5),
    },
  });
  const p2 = await prisma.project.upsert({
    where: { code: "CLB-002" },
    update: {},
    create: {
      name: "Nova Clinics Google Ads Launch",
      code: "CLB-002",
      description: "Paid search campaign build-out for 4 clinic locations.",
      clientId: nova.id,
      managerName: "Sarah Ahmed",
      status: "planning",
      priority: "medium",
      progress: 10,
      budget: 300000,
      actualCost: 20000,
      revenue: 400000,
      startDate: new Date(),
      deadline: new Date(Date.now() + 60 * 864e5),
    },
  });

  console.log("Seeding tasks…");
  const tasks = [
    { title: "Technical SEO audit — crawl & indexation", status: "completed", priority: "high" },
    { title: "Product category page copy (12 pages)", status: "in_progress", priority: "medium" },
    { title: "Schema markup rollout", status: "todo", priority: "medium" },
    { title: "Monthly performance report — August", status: "review", priority: "low" },
  ];
  for (const [i, t] of tasks.entries()) {
    const existing = await prisma.task.findFirst({
      where: { title: t.title, projectId: p1.id },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          title: t.title,
          projectId: p1.id,
          status: t.status,
          priority: t.priority,
          assigneeName: i % 2 === 0 ? "Mike Tanner" : "Sarah Ahmed",
          dueDate: new Date(Date.now() + (i + 1) * 5 * 864e5),
          estimatedHours: 6 + i * 2,
        },
      });
    }
  }

  console.log("Seeding follow-ups…");
  const lead = await prisma.lead.findUnique({ where: { email: "ayesha@peakfashion.com" } });
  if (lead) {
    const existing = await prisma.followUp.findFirst({ where: { leadId: lead.id } });
    if (!existing) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          staffName: "Mike Tanner",
          type: "call",
          scheduledAt: new Date(Date.now() + 2 * 3600 * 1000), // today, 2h from now
          notes: "Discuss SEO proposal & pricing tiers",
        },
      });
    }
    const overdue = await prisma.followUp.findFirst({
      where: { leadId: lead.id, notes: "Send case study deck" },
    });
    if (!overdue) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          staffName: "Mike Tanner",
          type: "email",
          scheduledAt: new Date(Date.now() - 26 * 3600 * 1000), // yesterday (overdue)
          notes: "Send case study deck",
        },
      });
    }
  } else {
    console.log("  (test lead not found — skipping follow-up seed)");
  }

  console.log("Seeding a demo notification…");
  const notif = await prisma.notification.findFirst({
    where: { title: "Welcome to the new Climbix admin" },
  });
  if (!notif) {
    await prisma.notification.create({
      data: {
        type: "system",
        title: "Welcome to the new Climbix admin",
        message: "Clients, Projects, Tasks, Pipeline, Follow-ups and Reports are now live.",
      },
    });
  }

  console.log("Business seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
