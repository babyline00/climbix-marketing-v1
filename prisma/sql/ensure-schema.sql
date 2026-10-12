-- Idempotent schema additions that Prisma migrations cannot express here.
--
-- This project's prisma/migrations/* were written in SQLite dialect (DATETIME,
-- REAL) and never ran against a real server, so `prisma migrate deploy` is not
-- a usable path. The database is provisioned with `prisma db push` instead,
-- which means a column added to schema.prisma reaches the code immediately and
-- only reaches the database when something applies it. That is how Page.renderMode
-- shipped in code while the live database still lacked the column, taking
-- GET /api/pages down with a P2022 error.
--
-- These statements are additive and idempotent, so they are safe to run on
-- every build. They never drop or rewrite existing data.
--
-- Identifiers use backticks and `IF NOT EXISTS` because the datasource is
-- MySQL/MariaDB. The Postgres-dialect form ("Page") is a syntax error there,
-- which is how the earlier version of this file failed on MariaDB.
--
-- Page.content and Page.schemaJson are widened to LONGTEXT. They were TEXT
-- (65,535 bytes) while the app accepted up to 200,000 characters, and the host
-- runs without STRICT_TRANS_TABLES — so a page larger than 64 KB saved
-- successfully and was silently truncated. A complete landing page with its
-- own CSS and JS inline passes 64 KB routinely, so this was data loss, not a
-- theoretical edge case.
ALTER TABLE `Page`
  ADD COLUMN IF NOT EXISTS `renderMode` TEXT NOT NULL DEFAULT 'inline';

ALTER TABLE `Page` MODIFY COLUMN `content`  LONGTEXT NOT NULL;
ALTER TABLE `Page` MODIFY COLUMN `schemaJson` LONGTEXT NULL;