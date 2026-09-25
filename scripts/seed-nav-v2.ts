/**
 * Navigation v2 migration — replaces the legacy hash-based system links
 * with real route-based navigation (Services, Industries, Company,
 * Resources dropdowns + Locations / Pricing / Contact links).
 * Custom (non-system) links are preserved. Idempotent.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAV_V2 = [
  { label: "Services", href: "/services", kind: "services" },
  { label: "Industries", href: "/industries", kind: "industries" },
  { label: "Company", href: "/about", kind: "company" },
  { label: "Resources", href: "/blog", kind: "resources" },
  { label: "Locations", href: "/locations", kind: "link" },
  { label: "Pricing", href: "/pricing", kind: "link" },
  { label: "Contact", href: "/contact", kind: "link" },
];

async function main() {
  // Preserve custom links
  const customLinks = await prisma.headerLink.findMany({
    where: { isSystem: false },
  });

  await prisma.headerLink.deleteMany({ where: { isSystem: true } });

  await prisma.headerLink.createMany({
    data: NAV_V2.map((l, i) => ({
      label: l.label,
      href: l.href,
      kind: l.kind,
      isSystem: true,
      position: (i + 1) * 10,
      isActive: true,
    })),
  });

  // Re-add custom links after the system ones
  if (customLinks.length > 0) {
    await prisma.headerLink.createMany({
      data: customLinks.map((l, i) => ({
        label: l.label,
        href: l.href,
        kind: l.kind,
        isSystem: false,
        position: (NAV_V2.length + 1 + i) * 10,
        isActive: l.isActive,
      })),
    });
  }

  console.log(
    `Nav v2 migrated: ${NAV_V2.length} system links, ${customLinks.length} custom links preserved`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
