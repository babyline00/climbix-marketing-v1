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
ALTER TABLE `Page`
  ADD COLUMN IF NOT EXISTS `renderMode` TEXT NOT NULL DEFAULT 'inline';