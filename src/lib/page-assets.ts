import "server-only";

import { prisma } from "./db-alias";
import { getSettings } from "./settings";
import { getAgentConfig } from "./settings";
import { resolveBrand } from "./brand";
import {
  buildAssetIndex,
  type AssetIndex,
  type ShortcodeAsset,
  type ShortcodeContext,
} from "./shortcodes";

/**
 * Server-side plumbing for shortcodes on complete-HTML pages: resolves the
 * files that [image] / [attachment] can reference, plus the site facts that
 * [email] / [phone] / [site_name] / [chat] need.
 *
 * Everything here is best-effort. A page must still render when the media or
 * document tables are empty or unreachable — shortcodes then render their
 * visible "[not found]" placeholder instead of taking the page down.
 */

export type ShortcodeAssets = {
  media: AssetIndex;
  documents: AssetIndex;
  allDocuments: ShortcodeAsset[];
};

const EMPTY_INDEX: AssetIndex = { exact: new Map(), loose: new Map() };

/** Load media + documents and index them for shortcode lookup. */
export async function loadShortcodeAssets(): Promise<ShortcodeAssets> {
  const [mediaRows, documentRows] = await Promise.all([
    prisma.media
      .findMany({ orderBy: { createdAt: "desc" }, take: 500 })
      .catch(() => []),
    prisma.document
      .findMany({ orderBy: { createdAt: "desc" }, take: 500 })
      .catch(() => []),
  ]);

  const documents = documentRows.map((row) => ({
    id: row.id,
    url: row.url,
    name: row.name,
    mimeType: row.mimeType,
    size: row.size,
  }));

  return {
    media: buildAssetIndex(
      mediaRows.map((row) => ({
        id: row.id,
        url: row.url,
        name: row.filename,
        mimeType: row.mimeType,
        size: row.size,
      }))
    ),
    documents: buildAssetIndex(documents),
    allDocuments: documents.map((row) => ({
      url: row.url,
      name: row.name,
      mimeType: row.mimeType,
      size: row.size,
    })),
  };
}

/**
 * Site facts for the contact and chat shortcodes. Each source is isolated so a
 * single failure cannot blank the whole page — [phone] simply falls back to
 * its placeholder.
 */
export async function loadShortcodeContext(input: {
  slug: string;
  pageTitle: string;
}): Promise<ShortcodeContext> {
  const [settingsResult, agentResult] = await Promise.allSettled([
    getSettings(),
    getAgentConfig(),
  ]);

  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : {};
  const brand = resolveBrand(settings);

  const phone =
    settings["general.phone"] ||
    settings["agent.callkitNumber"] ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE ||
    "";
  const email = settings["general.email"] || settings["email.senderEmail"] || "";

  return {
    slug: input.slug,
    pageTitle: input.pageTitle,
    siteName: brand.appName || settings["general.appName"] || "Climbix",
    phone,
    email,
    agentEnabled: agentResult.status === "fulfilled" && agentResult.value.enabled,
  };
}

export { EMPTY_INDEX };