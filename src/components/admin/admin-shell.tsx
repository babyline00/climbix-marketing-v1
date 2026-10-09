"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  ExternalLink,
  LogOut,
  TrendingUp,
  MessageSquare,
  Search,
  Maximize2,
  Loader2,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Image as ImageIcon,
  FileEdit,
  FolderTree,
  FolderOpen,
  Palette,
  Mail,
  BarChart3,
  User,
  UserCog,
  ShieldCheck,
  History,
  Kanban,
  PhoneCall,
  Building2,
  FolderKanban,
  ListTodo,
  Bell,
  LayoutTemplate,
  PanelTop,
  KeyRound,
  Workflow,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { can, VIEW_PERMISSIONS, type SessionUser } from "@/lib/rbac";
import { AdminDashboard } from "./views/dashboard";
import { AdminLeads } from "./views/leads";
import { AdminMeetings } from "./views/meetings";
import { AdminContent } from "./views/content";
import { AdminMedia } from "./views/media";
import { AdminPages } from "./views/pages";
import { AdminBlogPosts } from "./views/blog-posts";
import { AdminCategories } from "./views/categories";
import { AdminAppearance } from "./views/appearance";
import { AdminBranding } from "./views/branding";
import { AdminEmails } from "./views/emails";
import { AdminHomepage } from "./views/homepage";
import { AdminHeaderManager } from "./views/header";
import { AdminStaff } from "./views/staff";
import { AdminRoles } from "./views/roles";
import { AdminActivity } from "./views/activity";
import { AdminClients } from "./views/clients";
import { AdminProjects } from "./views/projects";
import { AdminTasks } from "./views/tasks";
import { AdminPipeline } from "./views/pipeline";
import { AdminFollowups } from "./views/followups";
import { AdminReports } from "./views/reports";
import { AdminNotifications } from "./views/notifications";
import { AdminDocuments } from "./views/documents";
import { AdminSettings } from "./views/settings";
import { ChangePasswordDialog } from "./change-password-dialog";
import { NotificationBell } from "./notification-bell";
import { AdminAutomations } from "./views/automations";
import { AdminServices } from "./views/services";

type View =
  | "dashboard"
  | "homepage"
  | "header"
  | "services"
  | "leads"
  | "pipeline"
  | "followups"
  | "clients"
  | "meetings"
  | "content"
  | "media"
  | "pages"
  | "blog-posts"
  | "categories"
  | "appearance"
  | "branding"
  | "emails"
  | "projects"
  | "tasks"
  | "documents"
  | "settings"
  | "reports"
  | "staff"
  | "roles"
  | "activity"
  | "notifications"
  | "automations";

type NavSection = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  view?: View;
  children?: { label: string; view: View; icon?: typeof Users }[];
};

// WordPress-style sidebar navigation with all sections
const NAV_SECTIONS: NavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    view: "dashboard",
  },
  {
    id: "homepage",
    label: "Homepage",
    icon: LayoutTemplate,
    view: "homepage",
  },
  {
    id: "header",
    label: "Header & Popup",
    icon: PanelTop,
    view: "header",
  },
  // {
  //   id: "services",
  //   label: "Services",
  //   icon: Layers,
  //   view: "services",
  // },
  {
    id: "content",
    label: "Content",
    icon: FileEdit,
    children: [
      { label: "Pages", view: "pages", icon: FileText },
      { label:"services", view: "services",icon: Layers },
      { label: "Blog Posts", view: "blog-posts", icon: FileEdit },
      { label: "Categories", view: "categories", icon: FolderTree },
      { label: "Document Library", view: "documents", icon: FolderOpen },
    ],
  },
  {
    id: "media",
    label: "Media Library",
    icon: ImageIcon,
    view: "media",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    children: [
      { label: "Hero & Sections", view: "appearance", icon: LayoutTemplate },
      { label: "Branding", view: "branding", icon: ImageIcon },
    ],
  },
  {
    id: "automations",
    label: "Automations",
    icon: Workflow,
    view: "automations",
  },
  {
    id: "crm",
    label: "CRM & Leads",
    icon: Users,
    children: [
      { label: "All Leads", view: "leads", icon: Users },
      { label: "Pipeline", view: "pipeline", icon: Kanban }
      ,{ label: "Follow-ups", view: "followups", icon: PhoneCall },
      { label: "Clients", view: "clients", icon: Building2 },
      { label: "Meetings", view: "meetings", icon: CalendarCheck },
      { label: "Email Log", view: "emails", icon: Mail },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    children: [
      { label: "All Projects", view: "projects", icon: FolderKanban },
      { label: "Tasks", view: "tasks", icon: ListTodo },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    view: "reports",
  },
  {
    id: "settings",
    label: "Site Content",
    icon: Settings,
    view: "content",
  },
  {
    id: "system",
    label: "System",
    icon: ShieldCheck,
    children: [
      { label: "Notifications", view: "notifications", icon: Bell },
      { label: "Staff", view: "staff", icon: UserCog },
      { label: "Roles & Permissions", view: "roles", icon: ShieldCheck },
      { label: "Activity Log", view: "activity", icon: History },
      { label: "Settings", view: "settings", icon: Settings },
    ],
  },
];

const VIEW_META: Record<View, { title: string; breadcrumb: string[] }> = {
  dashboard: { title: "Dashboard", breadcrumb: ["Home", "Dashboard"] },
  homepage: {
    title: "Homepage Manager",
    breadcrumb: ["Home", "Homepage Manager"],
  },
  header: {
    title: "Header & Popup",
    breadcrumb: ["Home", "Header & Popup"],
  },
  services: {
    title: "Services",
    breadcrumb: ["Home", "Services"],
  },
  pages: { title: "Pages", breadcrumb: ["Home", "Content", "Pages"] },
  "blog-posts": { title: "Blog Posts", breadcrumb: ["Home", "Content", "Blog Posts"] },
  categories: { title: "Categories", breadcrumb: ["Home", "Content", "Categories"] },
  media: { title: "Media Library", breadcrumb: ["Home", "Media Library"] },
  documents: { title: "Document Library", breadcrumb: ["Home", "Content", "Document Library"] },
  appearance: { title: "Appearance", breadcrumb: ["Home", "Appearance", "Hero & Sections"] },
  branding: { title: "Branding", breadcrumb: ["Home", "Appearance", "Branding"] },
  leads: { title: "Leads", breadcrumb: ["Home", "CRM", "Leads"] },
  meetings: { title: "Meetings", breadcrumb: ["Home", "CRM", "Meetings"] },
  emails: { title: "Email Log", breadcrumb: ["Home", "CRM", "Email Log"] },
  content: { title: "Site Content", breadcrumb: ["Home", "Settings", "Site Content"] },
  staff: { title: "Staff", breadcrumb: ["Home", "System", "Staff"] },
  roles: { title: "Roles & Permissions", breadcrumb: ["Home", "System", "Roles & Permissions"] },
  activity: { title: "Activity Log", breadcrumb: ["Home", "System", "Activity Log"] },
  notifications: { title: "Notifications", breadcrumb: ["Home", "System", "Notifications"] },
  automations: { title: "Workflow Automations", breadcrumb: ["Home", "Automations"] },
  settings: { title: "Settings", breadcrumb: ["Home", "System", "Settings"] },
  pipeline: { title: "Lead Pipeline", breadcrumb: ["Home", "CRM", "Pipeline"] },
  followups: { title: "Follow-ups", breadcrumb: ["Home", "CRM", "Follow-ups"] },
  clients: { title: "Clients", breadcrumb: ["Home", "CRM", "Clients"] },
  projects: { title: "Projects", breadcrumb: ["Home", "Projects", "All Projects"] },
  tasks: { title: "Tasks", breadcrumb: ["Home", "Projects", "Tasks"] },
  reports: { title: "Reports", breadcrumb: ["Home", "Reports"] },
};

export function AdminShell({
  user,
  onLogout,
}: {
  user: SessionUser;
  onLogout: () => void;
}) {
  const [view, setView] = React.useState<View>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [changePwOpen, setChangePwOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(["content", "crm", "system"])
  );

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* best-effort */
    }
    if (typeof window !== "undefined") {
      window.location.hash = "#top";
    }
    onLogout();
  };

  // A role edit can revoke access to whatever view the user is sitting on, so
  // the rendered view is *derived* rather than corrected by an effect. The old
  // effect painted the now-forbidden view for one frame and then bounced to the
  // dashboard, and the view state could stay pointing at something the user is
  // no longer allowed to open.
  const viewPerm = VIEW_PERMISSIONS[view];
  const activeView: View =
    viewPerm && !can(user.permissions, viewPerm) ? "dashboard" : view;

  // ── Global search (Ctrl+K, debounced) ──
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<
    { key: string; label: string; items: { id: string; title: string; subtitle?: string; badge?: string }[] }[]
  >([]);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Typing applies the query and drops stale results in the same render. The
  // effect-driven version left the previous term's results on screen for a beat
  // after the query fell under two characters.
  const applySearchQuery = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    setSearchLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const data = await res.json();
        setSearchResults(data.groups ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  // Close search dropdown on outside click
  React.useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".max-w-md.flex-1")) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchOpen]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectView = (v: View) => {
    setView(v);
    setMobileNavOpen(false);
  };

  const meta = VIEW_META[activeView];

  // Permission-filtered navigation
  const navSections = NAV_SECTIONS.map((section) => {
    if (section.view) {
      const perm = VIEW_PERMISSIONS[section.view];
      return perm && !can(user.permissions, perm) ? null : section;
    }
    const children = section.children?.filter(
      (c) => !VIEW_PERMISSIONS[c.view] || can(user.permissions, VIEW_PERMISSIONS[c.view])
    );
    if (!children || children.length === 0) return null;
    return { ...section, children };
  }).filter(Boolean) as typeof NAV_SECTIONS;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ────────── SIDEBAR ────────── */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white flex flex-col transition-transform duration-300 h-screen",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">
                Climb<span className="text-brand-400">ix</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Admin Panel
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => {
            const isActive = section.view === activeView ||
              (section.children?.some((c) => c.view === activeView));

            if (section.view && !section.children) {
              return (
                <button
                  key={section.id}
                  onClick={() => selectView(section.view!)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-500/20 text-brand-200 border-l-2 border-brand-400"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  )}
                >
                  <section.icon className="size-4" />
                  {section.label}
                </button>
              );
            }

            const isExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-700/60 text-white"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <section.icon className="size-4" />
                    {section.label}
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && section.children && (
                  <div className="mt-0.5 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                    {section.children.map((child) => (
                      <button
                        key={child.view}
                        onClick={() => selectView(child.view)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          activeView === child.view
                            ? "bg-brand-500/15 text-brand-300 font-medium"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/40"
                        )}
                      >
                        {child.icon && <child.icon className="size-3.5" />}
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-700 space-y-0.5">
          <a
            href="#top"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
          >
            <ExternalLink className="size-4" />
            View Website
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      {/* ────────── MAIN AREA ────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ────────── TOP HEADER ────────── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: hamburger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>

            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => applySearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search leads, clients, projects... (Ctrl+K)"
                className="pl-9 bg-slate-100 border-slate-200 rounded-full h-9 text-sm focus-visible:bg-white"
              />
              {searchOpen && (searchQuery.trim().length >= 2) && (
                <div className="absolute left-0 right-0 top-11 z-[100] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-96 overflow-y-auto scrollbar-thin">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-400">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">No results for “{searchQuery}”</p>
                  ) : (
                    searchResults.map((group) => (
                      <div key={group.key} className="border-b border-slate-100 last:border-0">
                        <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={`${group.key}-${item.id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              applySearchQuery("");
                              if (group.key === "leads" || group.key === "pipeline") selectView("leads");
                              else if (group.key === "clients") selectView("clients");
                              else if (group.key === "projects" || group.key === "tasks") selectView("projects");
                              else if (group.key === "pages") selectView("pages");
                              else if (group.key === "posts") selectView("blog-posts");
                              else if (group.key === "staff") selectView("staff");
                            }}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-medium truncate">{item.title}</span>
                              {item.subtitle && (
                                <span className="block text-[11px] text-slate-500 truncate">{item.subtitle}</span>
                              )}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono uppercase bg-slate-100 rounded px-1.5 py-0.5 text-slate-500 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: utility icons + profile */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Fullscreen */}
            <button
              onClick={() => {
                if (typeof document !== "undefined") {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                }
              }}
              className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="size-4" />
            </button>

            {/* Notifications */}
            <NotificationBell onOpenCenter={() => selectView("notifications")} />

            {/* Settings shortcut */}
            <button
              onClick={() => selectView("content")}
              className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg pl-1.5 pr-3 py-1.5 transition-colors">
                  <div className="size-7 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold hidden sm:inline max-w-32 truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {user.email}
                    </span>
                    <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-brand-500/10 border border-brand-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                      <ShieldCheck className="size-3 mr-1" />
                      {user.roleLabel}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => selectView("dashboard")}>
                  <User className="size-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                {can(user.permissions, "staff.view") && (
                  <DropdownMenuItem onClick={() => selectView("staff")}>
                    <UserCog className="size-4 mr-2" />
                    Staff Management
                  </DropdownMenuItem>
                )}
                {can(user.permissions, "activity.view") && (
                  <DropdownMenuItem onClick={() => selectView("activity")}>
                    <History className="size-4 mr-2" />
                    Activity Log
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setChangePwOpen(true)}>
                  <KeyRound className="size-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-rose-600 focus:text-rose-700"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ────────── CONTENT ────────── */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm mb-5">
            {meta.breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <ChevronRight className="size-3.5 text-slate-400" />
                )}
                <span
                  className={cn(
                    i === meta.breadcrumb.length - 1
                      ? "text-slate-900 font-medium"
                      : "text-brand-600 hover:text-brand-700 cursor-pointer"
                  )}
                  onClick={() => {
                    if (i === 0) selectView("dashboard");
                  }}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* View content */}
          {activeView === "dashboard" && <AdminDashboard onNavigate={(v) => selectView(v as View)} />}
          {activeView === "homepage" && <AdminHomepage />}
          {activeView === "header" && <AdminHeaderManager />}
          {activeView === "services" && <AdminServices />}
          {activeView === "leads" && <AdminLeads />}
          {activeView === "meetings" && <AdminMeetings />}
          {activeView === "content" && <AdminContent />}
          {activeView === "media" && <AdminMedia />}
          {activeView === "pages" && <AdminPages />}
          {activeView === "blog-posts" && <AdminBlogPosts />}
          {activeView === "categories" && <AdminCategories />}
          {activeView === "appearance" && <AdminAppearance />}
          {activeView === "branding" && <AdminBranding />}
          {activeView === "emails" && <AdminEmails />}
          {activeView === "staff" && <AdminStaff user={user} />}
          {activeView === "roles" && <AdminRoles user={user} />}
          {activeView === "activity" && <AdminActivity user={user} />}
          {activeView === "pipeline" && <AdminPipeline user={user} />}
          {activeView === "followups" && <AdminFollowups user={user} />}
          {activeView === "clients" && <AdminClients user={user} />}
          {activeView === "projects" && <AdminProjects user={user} />}
          {activeView === "tasks" && <AdminTasks user={user} />}
          {activeView === "documents" && <AdminDocuments user={user} />}
          {activeView === "settings" && <AdminSettings user={user} />}
          {activeView === "reports" && <AdminReports />}
          {activeView === "notifications" && <AdminNotifications />}
          {activeView === "automations" && <AdminAutomations user={user} />}
        </main>

        {/* Change password dialog */}
        <ChangePasswordDialog open={changePwOpen} onOpenChange={setChangePwOpen} />

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 lg:px-6 py-4 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Climbix Admin Panel. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
