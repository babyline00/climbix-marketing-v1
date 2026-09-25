ALTER TABLE "Workflow" ADD COLUMN "webhookSecret" TEXT;
CREATE UNIQUE INDEX "Workflow_webhookSecret_key" ON "Workflow"("webhookSecret");
