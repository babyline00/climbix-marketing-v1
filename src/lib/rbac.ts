// ─────────────────────────────────────────────────────────────
// RBAC — roles, permission catalog & helpers
// Permission format: "<module>.<action>" e.g. "leads.manage"
// SUPER_ADMIN holds "*" (implicit access to everything)
// ─────────────────────────────────────────────────────────────

export const ALL_PERMISSION = "*";

/** Permission catalog — grouped for the Roles editor UI */
export const PERMISSION_CATALOG: {
  group: string;
  items: { key: string; label: string; hint?: string }[];
}[] = [
  {
    group: "General",
    items: [
      { key: "dashboard.view", label: "View dashboard" },
      { key: "activity.view", label: "View activity log", hint: "Audit trail" },
      { key: "export.data", label: "Export data (CSV)" },
    ],
  },
  {
    group: "CRM",
    items: [
      { key: "leads.view", label: "View leads" },
      { key: "leads.manage", label: "Manage leads", hint: "Edit status, notes, delete" },
      { key: "meetings.view", label: "View meetings" },
      { key: "meetings.manage", label: "Manage meetings", hint: "Reschedule, cancel" },
      { key: "emails.view", label: "View email log" },
      { key: "pipeline.manage", label: "Move leads through pipeline" },
      { key: "automation.view", label: "View workflow automations" },
      { key: "automation.manage", label: "Build & manage automations", hint: "Triggers, conditions and actions" },
    ],
  },
  {
    group: "Projects",
    items: [
      { key: "projects.view", label: "View projects & tasks" },
      { key: "projects.manage", label: "Manage projects & tasks", hint: "Create, edit, delete" },
      { key: "documents.view", label: "View documents" },
      { key: "documents.manage", label: "Upload & manage documents", hint: "Attach to projects, clients, leads" },
    ],
  },
  {
    group: "Content",
    items: [
      { key: "content.view", label: "View content settings" },
      { key: "content.manage", label: "Manage site content", hint: "Pages, blog, categories" },
      { key: "media.view", label: "View media library" },
      { key: "media.manage", label: "Upload & delete media" },
      { key: "homepage.manage", label: "Manage homepage sections & items" },
      { key: "header.manage", label: "Manage header links & popup" },
      { key: "appearance.manage", label: "Manage appearance & SEO" },
    ],
  },
  {
    group: "System",
    items: [
      { key: "staff.view", label: "View staff & roles" },
      { key: "staff.manage", label: "Manage staff users", hint: "Create, edit, deactivate" },
      { key: "roles.manage", label: "Manage roles & permissions", hint: "Super Admin only by default" },
      { key: "settings.view", label: "View system settings" },
      { key: "settings.manage", label: "Manage system settings", hint: "General, branding, security, email, SEO" },
    ],
  },
];

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATALOG.flatMap(
  (g) => g.items.map((i) => i.key)
);

/** View keys used by the admin sidebar — each maps to required permission */
export const VIEW_PERMISSIONS: Record<string, string> = {
  dashboard: "dashboard.view",
  homepage: "homepage.manage",
  header: "header.manage",
  services: "content.manage",
  pages: "content.manage",
  "blog-posts": "content.manage",
  categories: "content.manage",
  media: "media.view",
  appearance: "appearance.manage",
  leads: "leads.view",
  pipeline: "leads.view",
  followups: "leads.view",
  clients: "leads.view",
  projects: "projects.view",
  tasks: "projects.view",
  documents: "documents.view",
  settings: "settings.view",
  reports: "dashboard.view",
  meetings: "meetings.view",
  emails: "emails.view",
  content: "content.view",
  staff: "staff.view",
  roles: "staff.view",
  activity: "activity.view",
  automations: "automation.view",
};

/** System roles — seeded into the Role table */
export const SYSTEM_ROLES: {
  name: string;
  label: string;
  description: string;
  permissions: string[];
}[] = [
  {
    name: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full unrestricted access to every module, including staff & roles.",
    permissions: [ALL_PERMISSION],
  },
  {
    name: "ADMIN",
    label: "Admin",
    description: "Manages all content, CRM and media. Cannot manage staff or roles.",
    permissions: [
      "dashboard.view",
      "activity.view",
      "export.data",
      "leads.view",
      "leads.manage",
      "pipeline.manage",
      "automation.view",
      "automation.manage",
      "meetings.view",
      "meetings.manage",
      "emails.view",
      "projects.view",
      "projects.manage",
      "documents.view",
      "documents.manage",
      "settings.view",
      "content.view",
      "content.manage",
      "media.view",
      "media.manage",
      "homepage.manage",
      "header.manage",
      "appearance.manage",
    ],
  },
  {
    name: "SALES_MANAGER",
    label: "Sales Manager",
    description: "Owns the CRM: leads, pipeline, follow-ups and the email log.",
    permissions: [
      "dashboard.view",
      "export.data",
      "leads.view",
      "leads.manage",
      "pipeline.manage",
      "automation.view",
      "automation.manage",
      "meetings.view",
      "meetings.manage",
      "emails.view",
      "projects.view",
      "documents.view",
      "documents.manage",
    ],
  },
  {
    name: "CONTENT_MANAGER",
    label: "Content Manager",
    description: "Edits website content: pages, blog, homepage, header & media.",
    permissions: [
      "dashboard.view",
      "content.view",
      "content.manage",
      "media.view",
      "media.manage",
      "homepage.manage",
      "header.manage",
      "appearance.manage",
    ],
  },
  {
    name: "MANAGER",
    label: "Manager",
    description: "Reads CRM, projects and content, exports data. No editing rights.",
    permissions: [
      "dashboard.view",
      "export.data",
      "leads.view",
      "meetings.view",
      "emails.view",
      "projects.view",
      "content.view",
      "media.view",
      "documents.view",
      "settings.view",
    ],
  },
  {
    name: "STAFF",
    label: "Staff",
    description: "Works assigned leads, follow-ups and tasks.",
    permissions: [
      "dashboard.view",
      "leads.view",
      "meetings.view",
      "emails.view",
      "projects.view",
      "documents.view",
    ],
  },
  {
    name: "VIEWER",
    label: "Viewer",
    description: "Read-only dashboard access.",
    permissions: ["dashboard.view"],
  },
];

/** Parse the stored JSON permissions string safely */
export function parsePermissions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}

/** Does a permission list grant `perm`? */
export function can(permissions: string[], perm: string): boolean {
  if (permissions.includes(ALL_PERMISSION)) return true;
  return permissions.includes(perm);
}

/** Client-side session shape shared between panel components */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // role key, e.g. "SUPER_ADMIN"
  roleLabel: string;
  permissions: string[];
}
