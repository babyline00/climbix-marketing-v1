# Automation Engine v2

Added a production-oriented second automation layer:

- Workflow graph validation before create/update/run.
- Incoming webhook trigger with per-workflow secret.
- Webhook action with HMAC `x-climbix-signature` support.
- SSRF protections for private/local webhook destinations.
- Webhook payload size limit and JSON validation.
- Secret redaction from normal workflow GET/PATCH responses.
- One-time webhook secret returned on create.
- Workflow duplication API and Admin Duplicate action.
- Invalid/self-referencing/missing-node edge checks.
- Exactly-one-trigger validation.
- Runtime validation before execution.

Webhook endpoint:
`POST /api/workflows/webhook/<workflow-webhook-secret>`

For webhook-triggered workflows, the request body should include `leadId` when the workflow uses lead actions.
