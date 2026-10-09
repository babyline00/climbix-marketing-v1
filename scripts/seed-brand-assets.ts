/**
 * Seed placeholder brand imagery for the client-logo marquee and trust badges.
 *
 * Renders each item's own wordmark/emblem to a real PNG in public/uploads,
 * registers it in the Media table, then points the CMS row at it. Admins can
 * replace any of these later from Homepage Manager without touching this file.
 *
 * Run: bun scripts/seed-brand-assets.ts
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "../src/lib/db-alias";

const UPLOADS = path.join(process.cwd(), "public", "uploads");

/** Ink-on-white wordmarks read as real client logos in a greyscale marquee. */
const CLIENT_LOGOS: { name: string; sub: string }[] = [
  { name: "NexaCloud", sub: "INFRASTRUCTURE" },
  { name: "Flowdesk", sub: "WORKFLOWS" },
  { name: "Quantly", sub: "ANALYTICS" },
  { name: "Pinnacle", sub: "FINANCE" },
  { name: "BrightPath", sub: "EDUCATION" },
  { name: "LeadForge", sub: "REVENUE OPS" },
  { name: "Skyline SaaS", sub: "SAAS" },
  { name: "Vertex", sub: "LOGISTICS" },
];

/** Circular emblems sized for the 20px badge slot in trust-badges.tsx. */
const TRUST_BADGES: { label: string; glyph: string; tint: string }[] = [
  { label: "Google Certified Partner", glyph: "G", tint: "#4285F4" },
  { label: "500+ Campaigns Delivered", glyph: "500+", tint: "#10B981" },
  { label: "Results in 90 Days", glyph: "90d", tint: "#F59E0B" },
  { label: "4.9/5 Client Rating", glyph: "4.9", tint: "#8B5CF6" },
  { label: "Dedicated Strategist", glyph: "DS", tint: "#FF6B2C" },
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Slug for the stored filename — never spaces or shell-hostile characters. */
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

async function save(svg: string, base: string, w: number, h: number) {
  const buf = await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
  const storedName = `brand-${slugify(base)}-${Date.now()}.png`;
  await writeFile(path.join(UPLOADS, storedName), buf);
  return { storedName, url: `/uploads/${storedName}`, size: buf.length };
}

function clientLogoSvg(name: string, sub: string) {
  const w = 320;
  const h = 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#ffffff"/>
  <rect x="18" y="26" width="44" height="44" rx="12" fill="#0F172A"/>
  <path d="M30 58l8-8 6 6 10-12" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="76" y="48" font-family="Inter, Helvetica, Arial, sans-serif" font-size="27" font-weight="700" fill="#0F172A" letter-spacing="-0.5">${esc(name)}</text>
  <text x="77" y="68" font-family="Inter, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="#94A3B8" letter-spacing="2.2">${esc(sub)}</text>
</svg>`;
}

function badgeSvg(glyph: string, tint: string) {
  const s = 160;
  const fontSize = glyph.length > 2 ? 40 : 62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <circle cx="80" cy="80" r="74" fill="#ffffff" stroke="${tint}" stroke-width="8"/>
  <circle cx="80" cy="80" r="60" fill="${tint}" opacity="0.10"/>
  <text x="80" y="80" text-anchor="middle" dominant-baseline="central" font-family="Inter, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="${tint}" letter-spacing="-1">${esc(glyph)}</text>
</svg>`;
}

async function main() {
  await mkdir(UPLOADS, { recursive: true });

  // Client logos — match rows by name so re-running is idempotent.
  for (const { name, sub } of CLIENT_LOGOS) {
    const row = await prisma.clientLogo.findFirst({ where: { name } });
    if (!row) {
      console.log(`  ! no ClientLogo row named "${name}" — skipped`);
      continue;
    }
    if (row.imageUrl) {
      console.log(`  = ${name} already has an image — skipped`);
      continue;
    }
    const file = await save(clientLogoSvg(name, sub), name.toLowerCase(), 320, 96);
    await prisma.media.create({
      data: {
        filename: `${name}-logo.png`,
        storedName: file.storedName,
        url: file.url,
        mimeType: "image/png",
        size: file.size,
        altText: `${name} logo`,
        title: `${name} logo`,
        type: "image",
      },
    });
    await prisma.clientLogo.update({
      where: { id: row.id },
      data: { imageUrl: file.url },
    });
    console.log(`  ✓ ${name} → ${file.url}`);
  }

  // Trust badges — match by label.
  for (const { label, glyph, tint } of TRUST_BADGES) {
    const row = await prisma.trustBadge.findFirst({ where: { label } });
    if (!row) {
      console.log(`  ! no TrustBadge row labelled "${label}" — skipped`);
      continue;
    }
    if (row.imageUrl) {
      console.log(`  = ${label} already has an image — skipped`);
      continue;
    }
    const slug = slugify(label);
    const file = await save(badgeSvg(glyph, tint), slug, 160, 160);
    await prisma.media.create({
      data: {
        filename: `${slug}.png`,
        storedName: file.storedName,
        url: file.url,
        mimeType: "image/png",
        size: file.size,
        altText: label,
        title: label,
        type: "image",
      },
    });
    await prisma.trustBadge.update({
      where: { id: row.id },
      data: { imageUrl: file.url },
    });
    console.log(`  ✓ ${label} → ${file.url}`);
  }

  console.log("\nBrand imagery seeded. Replace any of these from Homepage Manager.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
