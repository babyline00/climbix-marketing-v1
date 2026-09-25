/**
 * Seed the service catalog into the `Service` table from the canonical
 * static defaults (src/data/services.ts). Idempotent — upserted by slug,
 * existing rows are never overwritten so admin edits are preserved.
 *   bun scripts/seed-services.ts
 */
import { PrismaClient } from "@prisma/client";
import { SERVICES } from "../src/data/services";
import { CARD_META } from "../src/data/service-cards";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding services…");
  for (const [index, s] of SERVICES.entries()) {
    const data = {
      name: s.name,
      shortName: s.shortName,
      tagline: s.tagline,
      icon: s.icon,
      accent: s.accent,
      border: s.border,
      cardDesc: CARD_META[s.slug]?.desc ?? "",
      cardPoints: JSON.stringify(CARD_META[s.slug]?.points ?? []),
      data: JSON.stringify({
        hero: s.hero,
        problem: s.problem,
        framework: s.framework,
        subServices: s.subServices,
        process: s.process,
        results: s.results,
        faq: s.faq,
        finalCta: s.finalCta,
      }),
      position: index * 10,
    };
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { slug: s.slug, ...data },
    });
  }
  console.log(`Service seed complete (${SERVICES.length} services).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());