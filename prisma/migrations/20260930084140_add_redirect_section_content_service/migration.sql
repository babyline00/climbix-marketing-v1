-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "Lead" ADD COLUMN "utmContent" TEXT;
ALTER TABLE "Lead" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "Lead" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "Lead" ADD COLUMN "utmTerm" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN "schemaJson" TEXT;

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionContent" (
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionContent_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'search',
    "accent" TEXT NOT NULL DEFAULT 'from-brand-500/20 to-brand-700/10',
    "border" TEXT NOT NULL DEFAULT 'border-brand-500/30',
    "cardDesc" TEXT NOT NULL DEFAULT '',
    "cardPoints" TEXT NOT NULL DEFAULT '[]',
    "data" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_source_key" ON "Redirect"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_isActive_position_idx" ON "Service"("isActive", "position");

-- DropIndex
DROP INDEX IF EXISTS "BlogPost_category_idx";

-- DropIndex
DROP INDEX IF EXISTS "BlogPost_status_publishedAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Meeting_status_date_idx";

-- DropIndex
DROP INDEX IF EXISTS "Meeting_date_time_idx";

-- RedefineIndex
DROP INDEX IF EXISTS "WorkflowRun_leadId_createdAt_idx";
CREATE INDEX "WorkflowRun_leadId_startedAt_idx" ON "WorkflowRun"("leadId", "startedAt");

-- RedefineIndex
DROP INDEX IF EXISTS "WorkflowRun_workflowId_createdAt_idx";
CREATE INDEX "WorkflowRun_workflowId_startedAt_idx" ON "WorkflowRun"("workflowId", "startedAt");
