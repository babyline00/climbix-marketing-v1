import "server-only";

import { db } from "./db";
import type { Prisma } from "@prisma/client";

/**
 * Page reads that tolerate a production database which has not yet received
 * the Page.renderMode column.
 *
 * Adding a column to schema.prisma is not enough: a deploy ships the new code
 * immediately, while the production database only changes when someone runs
 * the ALTER TABLE. In that window every query which selects the whole Page row
 * fails with Prisma P2022, which took /api/pages down with a bare 500.
 *
 * This module keeps the admin working in that window. Any query that does not
 * name renderMode is unaffected — Prisma only selects the columns you ask for,
 * which is why the sitemap and site search never broke — so the fix is limited
 * to the few call sites that genuinely need the whole row.
 *
 * This is a compatibility shim, not the intended steady state. The schema
 * migration is still required before document-mode pages can be authored:
 *
 *     ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "renderMode" TEXT NOT NULL DEFAULT 'inline';
 *
 * Once applied, the first attempt in each helper succeeds and nothing here runs.
 */

type RenderModeError = { code?: unknown; meta?: { column?: unknown } };

/** True for Prisma's "column does not exist" error naming renderMode. */
export function isMissingRenderMode(error: unknown): boolean {
  const e = error as RenderModeError | null;
  if (!e || e.code !== "P2022") return false;
  return String(e.meta?.column ?? "").includes("renderMode");
}

/** Every Page column except renderMode, for the fallback query. */
const SELECT_WITHOUT_RENDER_MODE = {
  id: true,
  title: true,
  slug: true,
  content: true,
  status: true,
  template: true,
  schemaJson: true,
  parentId: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PageSelect;

/** A Page row, with renderMode always present for the caller. */
export type PageRow = Prisma.PageGetPayload<Record<string, never>> & {
  renderMode: string;
};

/**
 * The fallback query returns the same columns minus renderMode, so the rows
 * need one field added before they match PageRow again.
 */
function withInlineMode(row: object): PageRow {
  return { ...row, renderMode: "inline" } as unknown as PageRow;
}

export type FindPageArgs = {
  where?: Prisma.PageWhereInput;
  include?: Prisma.PageInclude;
  orderBy?:
    | Prisma.PageOrderByWithRelationInput
    | Prisma.PageOrderByWithRelationInput[];
};

/** List pages, falling back to a renderMode-free select when the column is absent. */
export async function listPages(args: FindPageArgs): Promise<PageRow[]> {
  try {
    return (await db.page.findMany(args)) as PageRow[];
  } catch (error) {
    if (!isMissingRenderMode(error)) throw error;
    const { include, ...rest } = args;
    const rows = await db.page.findMany({ ...rest, select: SELECT_WITHOUT_RENDER_MODE });
    return rows.map(withInlineMode);
  }
}

/** First matching page, or null. Same fallback as listPages. */
export async function findPage(args: {
  where?: Prisma.PageWhereInput;
  include?: Prisma.PageInclude;
}): Promise<PageRow | null> {
  try {
    return ((await db.page.findFirst(args)) ?? null) as PageRow | null;
  } catch (error) {
    if (!isMissingRenderMode(error)) throw error;
    const { include, ...rest } = args;
    const row = await db.page.findFirst({ ...rest, select: SELECT_WITHOUT_RENDER_MODE });
    return row ? withInlineMode(row as never) : null;
  }
}

/** Page by slug — the lookup every public route and built-in override uses. */
export function findPageBySlug(
  slug: string,
  include?: Prisma.PageInclude
): Promise<PageRow | null> {
  return findPage({ where: { slug }, include });
}

/** Page by primary key. */
export function findPageById(
  id: string,
  include?: Prisma.PageInclude
): Promise<PageRow | null> {
  return findPage({ where: { id }, include });
}