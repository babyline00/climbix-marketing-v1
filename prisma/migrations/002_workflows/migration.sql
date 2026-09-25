CREATE TABLE "Workflow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "trigger" TEXT NOT NULL DEFAULT 'lead.created',
  "nodes" TEXT NOT NULL DEFAULT '[]',
  "edges" TEXT NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "lastRunAt" DATETIME,
  "createdBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "Workflow_isActive_trigger_idx" ON "Workflow"("isActive", "trigger");
CREATE INDEX "Workflow_updatedAt_idx" ON "Workflow"("updatedAt");

CREATE TABLE "WorkflowRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workflowId" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "triggerId" TEXT,
  "leadId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'running',
  "logs" TEXT NOT NULL DEFAULT '[]',
  "error" TEXT,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" DATETIME,
  CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "WorkflowRun_workflowId_createdAt_idx" ON "WorkflowRun"("workflowId", "startedAt");
CREATE INDEX "WorkflowRun_leadId_createdAt_idx" ON "WorkflowRun"("leadId", "startedAt");
CREATE INDEX "WorkflowRun_status_startedAt_idx" ON "WorkflowRun"("status", "startedAt");
CREATE INDEX "WorkflowRun_startedAt_idx" ON "WorkflowRun"("startedAt");
