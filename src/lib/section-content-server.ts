import { db } from "@/lib/db";
import {
  SECTION_CONTENT_DEFAULTS,
  mergeSection,
  type SectionContentMap,
  type SectionKey,
} from "@/lib/section-content";

/**
 * Fetch all section content overrides in one query and merge with defaults.
 * Never throws — falls back to defaults on any database issue.
 */
export async function getSectionContent(): Promise<SectionContentMap> {
  const merged: SectionContentMap = JSON.parse(
    JSON.stringify(SECTION_CONTENT_DEFAULTS)
  );
  try {
    const rows = await db.sectionContent.findMany();
    for (const row of rows) {
      const key = row.key as SectionKey;
      if (!(key in SECTION_CONTENT_DEFAULTS)) continue;
      try {
        const parsed = JSON.parse(row.data);
        // @ts-expect-error — dynamic key assignment across union shapes
        merged[key] = mergeSection(SECTION_CONTENT_DEFAULTS[key], parsed);
      } catch {
        // malformed JSON — keep defaults
      }
    }
  } catch {
    // DB unavailable — defaults already populated
  }
  return merged;
}
