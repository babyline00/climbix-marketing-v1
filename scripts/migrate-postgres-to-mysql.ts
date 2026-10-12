/**
 * One-shot migration from the previous PostgreSQL database to MySQL/MariaDB.
 *
 * The project ran on PostgreSQL (local dev on localhost:55432, production on
 * Neon) and was moved to a Hostinger MariaDB instance when the Vercel team
 * was blocked for exceeding fair-use limits. This copies every row across.
 *
 * Why a second Prisma client: the generated client is bound to the provider
 * declared in schema.prisma, which is now mysql. Reading the old database
 * needs a postgresql client, so prisma/pg-schema.prisma is a copy of the same
 * schema with provider postgresql and the old URL, generating into
 * node_modules/.prisma/pg-client. Same models, same payload shapes — the schema
 * differences between providers are column types, not client types.
 *
 * Ordering matters. MySQL enforces foreign keys, so rows are inserted after the
 * rows they reference. The MySQL side already holds seed data for the same
 * tables, and Postgres uses the same seed scripts, so the target tables are
 * cleared first to avoid unique-constraint collisions (User.email, Role.name,
 * Service.slug, Page.slug, ...).
 *
 * Run: bun run scripts/migrate-postgres-to-mysql.ts
 */
import { prisma } from "../src/lib/db-alias";
import { PrismaClient as PgClient } from "../node_modules/.prisma/pg-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Prisma exposes models under camelCase accessors. */
function accessor(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function pgModel(client: PgClient, model: string): any {
  return (client as any)[accessor(model)];
}

function mysqlModel(model: string): any {
  return (prisma as any)[accessor(model)];
}

/** Insertion order: referenced tables before referencing ones. */
const LOAD_ORDER = [
  "Role",
  "User",
  "Client",
  "Project",
  "Task",
  "Lead",
  "Meeting",
  "FollowUp",
  "EmailLog",
  "ActivityLog",
  "Notification",
  "Service",
  "Category",
  "BlogPost",
  "Page",
  "SectionContent",
  "HomePageSection",
  "HeaderLink",
  "SiteContent",
  "SitePopup",
  "Setting",
  "Media",
  "Document",
  "TrustBadge",
  "ClientLogo",
  "Testimonial",
  "Offer",
  "Redirect",
  "Workflow",
  "WorkflowRun",
  "PasswordReset",
];

async function main() {
  const pg = new PgClient();
  const source: Record<string, number> = {};

  try {
    console.log("Reading PostgreSQL inventory...");
    for (const model of LOAD_ORDER) {
      const rows = await pgModel(pg, model).findMany();
      source[model] = rows.length;
    }

    const total = Object.values(source).reduce((a, b) => a + b, 0);
    const nonEmpty = Object.entries(source).filter(([, c]) => c > 0);
    console.log(`\n${LOAD_ORDER.length} tables, ${total} rows total (${nonEmpty.length} non-empty)`);
    for (const [model, count] of nonEmpty.sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(4)}  ${model}`);
    }

    console.log("\nClearing MySQL tables (seed data replaced by the real copy)...");
    for (const model of [...LOAD_ORDER].reverse()) {
      await mysqlModel(model).deleteMany();
    }

    console.log("Copying rows...");
    const report: string[] = [];
    for (const model of LOAD_ORDER) {
      const rows = await pgModel(pg, model).findMany();
      if (rows.length === 0) continue;

      // One createMany per table: far faster than a row-at-a-time loop, and it
      // succeeds or fails per table so a problem is isolated.
      const result = await mysqlModel(model).createMany({ data: rows });
      report.push(`  ${String(result.count).padStart(4)}  ${model}`);
    }
    console.log(report.join("\n"));

    console.log("\nVerifying MySQL counts...");
    let mismatches = 0;
    for (const model of LOAD_ORDER) {
      const pgCount = source[model];
      const mysqlCount = await mysqlModel(model).count();
      if (pgCount !== mysqlCount) {
        console.log(`  MISMATCH ${model}: postgres=${pgCount} mysql=${mysqlCount}`);
        mismatches++;
      }
    }
    console.log(
      mismatches === 0
        ? "\nAll tables match. Migration complete."
        : `\n${mismatches} table(s) do not match — investigate before continuing.`
    );
  } finally {
    await pg.$disconnect();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});