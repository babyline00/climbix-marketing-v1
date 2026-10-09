/**
 * Brand identity — types and pure helpers shared by server and client code.
 *
 * Deliberately free of `server-only` and Prisma imports so client components
 * (header, footer, admin preview) can use the same types the server resolves
 * from the `Setting` key/value store. See `lib/settings.ts` for the DB access.
 */

export type BrandSettings = {
  /** Wordmark shown beside the logo in the header. Short by design. */
  siteName: string;
  /** Full business name — mobile menu, footer, emails. */
  appName: string;
  /** Uploaded logo. Empty string means "use the built-in mark". */
  logoUrl: string;
  /** Accessible name for the logo image. Falls back to the site name. */
  logoAlt: string;
  faviconUrl: string;
  /** When false the wordmark is hidden and the logo stands alone. */
  showName: boolean;
};

export const DEFAULT_BRAND: BrandSettings = {
  siteName: "Climbix",
  appName: "Climbix Marketing",
  logoUrl: "",
  logoAlt: "",
  faviconUrl: "",
  showName: true,
};

/** Map raw `Setting` rows onto a resolved, non-empty brand config. */
export function resolveBrand(s: Record<string, string> = {}): BrandSettings {
  const siteName = (s["branding.siteName"] ?? "").trim() || DEFAULT_BRAND.siteName;
  return {
    siteName,
    appName: (s["general.appName"] ?? "").trim() || DEFAULT_BRAND.appName,
    logoUrl: (s["branding.logoUrl"] ?? "").trim(),
    logoAlt: (s["branding.logoAlt"] ?? "").trim(),
    faviconUrl: (s["branding.faviconUrl"] ?? "").trim(),
    showName: (s["branding.showName"] ?? "true") !== "false",
  };
}

/**
 * Split a wordmark so the tail can carry the gradient accent.
 *
 * Multi-word names accent the final word ("Acme Digital" -> "Acme " + "Digital").
 * Single words accent the last two characters, which reproduces the original
 * "Climb" + "ix" treatment. Very short names get no accent at all.
 */
export function splitWordmark(name: string): {
  base: string;
  accent: string;
} {
  const trimmed = name.trim();
  if (!trimmed) return { base: "", accent: "" };

  const words = trimmed.split(/\s+/);
  if (words.length > 1) {
    const accent = words[words.length - 1];
    return { base: words.slice(0, -1).join(" ") + " ", accent };
  }

  const word = words[0];
  if (word.length < 5) return { base: word, accent: "" };
  return { base: word.slice(0, -2), accent: word.slice(-2) };
}

/** Only same-origin, root-relative upload paths may be trusted as internal. */
export function isInternalAsset(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
