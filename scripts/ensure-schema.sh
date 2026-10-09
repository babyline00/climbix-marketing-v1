#!/bin/sh
# Apply the additive schema statements in prisma/sql/ensure-schema.sql.
#
# Why this exists: this project's prisma/migrations/* are SQLite dialect while
# the datasource is postgresql, so `prisma migrate deploy` cannot run at all —
# production was provisioned with `prisma db push`. With no working migration
# path, a column added to schema.prisma reaches the code immediately but only
# reaches the database when something applies it. That is exactly how
# Page.renderMode shipped in code while production lacked the column, and took
# GET /api/pages down with a P2022 error.
#
# The statements are additive and idempotent, so running them on every deploy is
# safe: they never drop or rewrite existing data.
#
# The URL is passed explicitly with --url on purpose. `prisma db execute
# --schema ...` resolves DATABASE_URL from the .env file instead of the ambient
# environment, and exits 0 even when it cannot reach the server — which would
# make this step silently do nothing on a build machine. With --url it fails
# loudly. Local .env is sourced first so `npm run build` works without exported
# variables; on Vercel the platform's real DATABASE_URL wins and .env is not
# uploaded at all (see .vercelignore).
set -e

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ensure-schema: DATABASE_URL is not set — skipping." >&2
  exit 1
fi

exec prisma db execute --url "$DATABASE_URL" --file prisma/sql/ensure-schema.sql