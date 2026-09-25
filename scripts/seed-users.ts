/**
 * Seed roles + users for the Climbix admin RBAC system.
 * Idempotent — safe to run repeatedly.
 *
 *   bun scripts/seed-users.ts
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const SYSTEM_ROLES = [
  {
    name: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full unrestricted access to every module, including staff & roles.",
    permissions: ["*"],
  },
  {
    name: "ADMIN",
    label: "Admin",
    description: "Manages all content, CRM and media. Cannot manage staff or roles.",
    permissions: [
      "dashboard.view", "activity.view", "export.data",
      "leads.view", "leads.manage", "pipeline.manage", "meetings.view", "meetings.manage", "emails.view",
      "projects.view", "projects.manage",
      "content.view", "content.manage", "media.view", "media.manage",
      "homepage.manage", "header.manage", "appearance.manage",
    ],
  },
  {
    name: "SALES_MANAGER",
    label: "Sales Manager",
    description: "Owns the CRM: leads, meetings and the email log.",
    permissions: [
      "dashboard.view", "export.data",
      "leads.view", "leads.manage", "pipeline.manage", "meetings.view", "meetings.manage", "emails.view",
      "projects.view",
    ],
  },
  {
    name: "CONTENT_MANAGER",
    label: "Content Manager",
    description: "Edits website content: pages, blog, homepage, header & media.",
    permissions: [
      "dashboard.view", "content.view", "content.manage",
      "media.view", "media.manage", "homepage.manage", "header.manage", "appearance.manage",
    ],
  },
  {
    name: "MANAGER",
    label: "Manager",
    description: "Reads CRM and content, exports data. No editing rights.",
    permissions: [
      "dashboard.view", "export.data",
      "leads.view", "meetings.view", "emails.view", "projects.view", "content.view", "media.view",
    ],
  },
  {
    name: "STAFF",
    label: "Staff",
    description: "Works assigned leads and meetings.",
    permissions: ["dashboard.view", "leads.view", "meetings.view", "emails.view", "projects.view"],
  },
  {
    name: "VIEWER",
    label: "Viewer",
    description: "Read-only dashboard access.",
    permissions: ["dashboard.view"],
  },
];

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD must be set before seeding users");
if (!DEMO_PASSWORD) throw new Error("DEMO_PASSWORD must be set before seeding demo users");

const DEMO_USERS = [
  {
    name: "Climbix Super Admin",
    email: "admin@climbixmarketing.com",
    role: "SUPER_ADMIN",
    password: ADMIN_PASSWORD,
  },
  {
    name: "Sarah Ahmed",
    email: "sarah@climbixmarketing.com",
    role: "CONTENT_MANAGER",
    password: DEMO_PASSWORD,
  },
  {
    name: "Mike Tanner",
    email: "mike@climbixmarketing.com",
    role: "SALES_MANAGER",
    password: DEMO_PASSWORD,
  },
  {
    name: "Front Desk",
    email: "viewer@climbixmarketing.com",
    role: "VIEWER",
    password: DEMO_PASSWORD,
  },
];

async function main() {
  console.log("Seeding roles…");
  for (const r of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {
        label: r.label,
        description: r.description,
        permissions: JSON.stringify(r.permissions),
        isSystem: true,
      },
      create: {
        name: r.name,
        label: r.label,
        description: r.description,
        permissions: JSON.stringify(r.permissions),
        isSystem: true,
      },
    });
    console.log(`  ✓ role ${r.name}`);
  }

  console.log("Seeding users…");
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, isActive: true },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hashPassword(u.password),
        role: u.role,
        isActive: true,
      },
    });
    console.log(`  ✓ user ${u.email} (${u.role})`);
  }

  const total = await prisma.user.count();
  console.log(`Done — ${await prisma.role.count()} roles, ${total} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
