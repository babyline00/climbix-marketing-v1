/**
 * Unified seed orchestrator — runs all seed scripts in dependency order:
 *   1. CMS (site content, homepage sections, header links)
 *   2. Users & RBAC (roles + accounts)
 *   3. Business (clients, projects, tasks, follow-ups, notifications)
 *   4. Services (static service catalog defaults)
 *
 * Usage: bun run db:seed
 */
import { spawnSync } from "child_process";

const steps = [
  "scripts/seed-cms.ts",
  "scripts/seed-users.ts",
  "scripts/seed-business.ts",
  "scripts/seed-services.ts",
];

let failed = false;
for (const step of steps) {
  console.log(`\n▶ Seeding: ${step}`);
  const res = spawnSync("bun", ["run", step], { stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`✗ Seed step failed: ${step}`);
    failed = true;
    break;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log("\n✓ All seed data installed. Admin login email: admin@climbixmarketing.com (password supplied via ADMIN_PASSWORD).");
}
