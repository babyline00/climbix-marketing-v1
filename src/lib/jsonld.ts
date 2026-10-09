/**
 * Validation for the optional Schema.org JSON-LD field on a page.
 *
 * The stored value is injected verbatim into a <script type="application/ld+json">
 * tag by the public renderer, which makes two classes of mistake worth
 * catching at save time rather than discovering them in Search Console:
 *
 *  - Invalid JSON. It renders as nothing, so the page simply loses its rich
 *    result and the admin sees no error anywhere.
 *  - A literal "</script" inside a string. That closes the tag early, so the
 *    rest of the value is parsed as markup instead of JSON.
 *
 * Pure and browser-safe: the admin editor uses it for live feedback and the API
 * routes use it as the authoritative check.
 */

export type JsonLdCheck =
  | { ok: true; empty: true }
  | { ok: true; empty: false; count: number }
  | { ok: false; error: string };

/** Generous but bounded — real JSON-LD is a few KB; 100k is far past useful. */
export const MAX_JSON_LD_CHARS = 100_000;

/**
 * Validate raw JSON-LD. Returns the number of top-level entities on success so
 * the editor can say "3 schemas" instead of a bare "valid".
 */
export function checkJsonLd(raw: string | null | undefined): JsonLdCheck {
  const text = String(raw ?? "").trim();
  if (!text) return { ok: true, empty: true };

  if (text.length > MAX_JSON_LD_CHARS) {
    return {
      ok: false,
      error: `JSON-LD is too large (max ${MAX_JSON_LD_CHARS.toLocaleString()} characters)`,
    };
  }

  // Checked before parsing: a "</script" inside a JSON string parses fine but
  // would terminate the surrounding tag.
  if (/<\/script/i.test(text)) {
    return {
      ok: false,
      error: 'JSON-LD cannot contain "</script" — it would close the tag early',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, error: `Invalid JSON: ${detail}` };
  }

  const entities = Array.isArray(parsed) ? parsed : [parsed];
  if (entities.length === 0) {
    return { ok: false, error: "JSON-LD cannot be an empty array" };
  }

  for (const [index, entity] of entities.entries()) {
    const label = entities.length > 1 ? `Item ${index + 1}` : "JSON-LD";
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) {
      return { ok: false, error: `${label} must be a JSON object` };
    }
    const record = entity as Record<string, unknown>;
    if (record["@type"] === undefined || record["@type"] === null || record["@type"] === "") {
      return { ok: false, error: `${label} is missing "@type" (e.g. "FAQPage", "Article", "WebPage")` };
    }
    if (record["@context"] === undefined) {
      return {
        ok: false,
        error: `${label} is missing "@context" — use "https://schema.org"`,
      };
    }
  }

  return { ok: true, empty: false, count: entities.length };
}

/** Starter JSON-LD matching the textarea placeholder, for the editor. */
export const JSON_LD_PLACEHOLDER = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}`;