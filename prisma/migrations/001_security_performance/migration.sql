-- Security: revoke all outstanding sessions when password/sessionVersion changes.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- Performance: common CRM/admin/public listing filters.
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX IF NOT EXISTS "Meeting_date_time_idx" ON "Meeting"("date", "time");
CREATE INDEX IF NOT EXISTS "Meeting_status_date_idx" ON "Meeting"("status", "date");
CREATE INDEX IF NOT EXISTS "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category");
