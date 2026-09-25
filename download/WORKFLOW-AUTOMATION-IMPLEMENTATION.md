# Climbix Marketing — Workflow Automation

## What was added

The admin panel now includes **Workflow Automations**, a real event-driven automation engine and visual builder.

### Visual builder
- Drag blocks from the palette onto the canvas.
- Move blocks around the canvas.
- Connect blocks visually.
- Conditions support TRUE/FALSE branches.
- Configure each block from the Inspector.
- Save, activate/pause, delete and test workflows.
- Run history refreshes every 4 seconds in the admin UI.

### Triggers
- Incoming lead (`lead.created`)
- Lead status changed (`lead.status_changed`)
- Lead assigned (`lead.assigned`)

### Conditions
- equals
- not equals
- contains
- starts with
- greater than
- less than
- exists

Available fields include lead score, tier, status, source, service, country, company, assignment and tags.

### Actions
- Round-robin assignment across active staff
- Assign to a specific staff member
- Set lead status
- Add a tag
- Create a scheduled follow-up
- Create an in-app notification
- Send an email to the lead

## Realtime execution

Lead creation and lead status/assignment updates call the workflow engine immediately after database persistence. No cron job is required for event-driven workflows.

Every execution is recorded in `WorkflowRun` with status, timestamps and execution logs.

## Security

Workflow APIs require:
- `automation.view` for read access
- `automation.manage` for creation/edit/delete/test

Workflow mutations are also recorded in the activity log.

## Database

Added:
- `Workflow`
- `WorkflowRun`

Migration:
- `prisma/migrations/002_workflows/migration.sql`

The bundled SQLite database contains a starter workflow:

**New Lead → Assign → Follow-up**

It assigns incoming leads to active staff using a load-balanced round-robin strategy and schedules a next-day call follow-up.
