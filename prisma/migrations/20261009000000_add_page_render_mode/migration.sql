-- Add Page.renderMode so a page can be authored as a complete HTML file.
--
-- Existing rows default to "inline", which is exactly how they already render,
-- so this is additive: no data backfill is required.
ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "renderMode" TEXT NOT NULL DEFAULT 'inline';