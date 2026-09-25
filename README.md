# Climbix Marketing — SEO, AI Search & Lead Generation Agency

A complete, production-ready marketing agency website with a WordPress-style admin panel, built with Next.js 16, TypeScript, Tailwind CSS, and Prisma.

## Features

### Public Website
- **Real Multi-Page Architecture** — every page is a crawlable, indexable route with unique metadata, canonical URLs, Open Graph tags and JSON-LD structured data (Organization, WebSite, Service, FAQPage, Article, BreadcrumbList) + dynamic `sitemap.xml` and `robots.txt`
- **Homepage** — 15 admin-managed sections (order, visibility AND text content editable from #admin): hero, trust badges, client logos, offers, problem, services, why us, case studies, process, industries, locations, free audit, testimonials, FAQ, final CTA
- **10 Service Pages** — `/services/seo`, `/services/ai-search`, `/services/lead-generation`, `/services/content-marketing`, `/services/ppc`, `/services/cro`, plus Performance Marketing, AI Automation, Website Development and AI Content Marketing — each with framework, sub-services, process, results and FAQ
- **6 Industry Pages** — SaaS, B2B, Technology, Ecommerce, Healthcare, Real Estate (`/industries/[slug]`) with category challenges, keyword groups, case studies and FAQs
- **Company Pages** — About Us, Case Studies (6 documented engagements), Our Process, Pricing, Testimonials, FAQ, Contact (working lead form)
- **Resources** — Blog (server-rendered listing + article pages), SEO Guides (8 in-depth playbooks), Free Tools (interactive marketing ROI calculator), Free Growth Audit (30-point analysis), Strategy Call
- **Locations Page** — global markets breakdown with region-specific positioning
- **Navigation** — admin-managed header with 4 dropdown menus (Services, Industries, Company, Resources) all built on real routes, mobile sheet menu, full sitemap footer
- **Blog** — 5 SEO articles + WYSIWYG editor, search, category filter, pagination
- **Pricing Page** — 3 tiers (Starter, Growth, Enterprise) with FAQ
- **Meeting Scheduler** — Date/time/timezone picker with 7 services dropdown
- **Free Audit Lead Magnet** — Interactive form with audit score animation
- **AI Voice Agent** — Site-wide floating assistant any visitor can chat with or talk to: microphone voice input (Web Speech API), AI replies powered by LLM, spoken answers via ElevenLabs TTS with browser-speech fallback, conversation history, mute toggle

### Admin Panel (`#admin`)
- **Dashboard** — Stats, upcoming meetings, recent leads, quick actions
- **Homepage Manager** — Section order/visibility toggles, Section Content editors (headlines, intros, item lists per section), Trust Badges / Client Logos / Reviews / Offers CRUD
- **Header & Popup Manager** — Reorder, show/hide and add nav links (Services/Industries/Company/Resources dropdown kinds + custom links), announcement popup with delay & dismiss memory
- **Pages Management** — Full CRUD with WYSIWYG editor
- **Blog Posts** — Full CRUD with WYSIWYG editor, categories, tags, featured flag
- **Categories** — Hierarchical tree with subcategories
- **Media Library** — Upload images/videos, grid view, delete
- **Appearance** — Hero editor with live preview and image upload
- **Leads CRM** — Table with action dropdown, lead scoring, CSV export
- **Meetings** — Upcoming/past with Complete/Cancel
- **Email Log** — View all sent emails with full HTML preview
- **Site Content** — Edit hero text, stats, contact info, SEO settings
- **Projects & Tasks** — Project CRUD with budget/timeline, task boards, staff assignments
- **Clients & Documents** — Client records, company profile, document management
- **Reports & Notifications** — Date-filtered analytics, CSV export, in-app notification center

### System (Super Admin RBAC)
- **Authentication** — Email + password login, scrypt-hashed credentials, HMAC-signed 7-day sessions, login rate limiting
- **Staff Management** — Full user CRUD, activate/deactivate, password reset, guarded against removing the last active Super Admin
- **Roles & Permissions** — 7 system roles (Super Admin, Admin, Sales Manager, Content Manager, Manager, Staff, Viewer) with granular `module.action` permission matrix enforced on both API and UI
- **Activity Log** — Audit trail of logins, creates, updates and deletes with module filters
- **Backend Enforcement** — Every admin API route validates the session and required permission (401/403), public marketing site unaffected

### Backend Features
- **Lead Scoring** — Auto-qualify leads (HOT/WARM/COLD) based on form data
- **Email Notifications** — Meeting confirmations + lead notifications
- **SEO** — Dynamic meta tags and Open Graph per page/article
- **Real-Time Refresh** — Admin edits appear instantly on public site (BroadcastChannel)
- **Database** — Prisma ORM with SQLite (User, Role, ActivityLog, Lead, Meeting, Project, Task, Client, Page, BlogPost, Category, Media, EmailLog, SiteContent…)

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM + SQLite
- **Rich Text:** TipTap (WYSIWYG editor)
- **Icons:** Lucide React
- **Animations:** Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (package manager)

### Installation

```bash
# Install dependencies
bun install

# Apply the formal migration (creates schema via prisma/migrations/000_init)
bunx prisma migrate deploy
# — or, for development iterations after schema edits —
bun run db:migrate

# Seed ALL demo data in one command (CMS + users/RBAC + business data)
bun run db:seed
# individual seeds: bun scripts/seed-cms.ts / seed-users.ts / seed-business.ts

# Start dev server
bun run dev
```

> Note: `bun run db:push` (schema push without migration files) still works for
> rapid prototyping, but the repository ships a formal `prisma/migrations/`
> baseline — use `prisma migrate deploy` for staging/production environments.

### Admin Access
Navigate to `http://localhost:3000/#admin` and sign in with the administrator email plus the password configured in `ADMIN_PASSWORD`.

For a fresh database, run the seed with `ADMIN_PASSWORD` and `DEMO_PASSWORD` set in the environment. No administrator password is hard-coded in the application or login UI.

| Role | Email | Password source |
|------|-------|-----------------|
| Super Admin | `admin@climbixmarketing.com` | `$ADMIN_PASSWORD` |
| Content Manager | `sarah@climbixmarketing.com` | `$DEMO_PASSWORD` |
| Sales Manager | `mike@climbixmarketing.com` | `$DEMO_PASSWORD` |
| Viewer | `viewer@climbixmarketing.com` | `$DEMO_PASSWORD` |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, staff, roles, activity, leads, meetings, projects, tasks, clients, pages, blog-posts, media, etc.)
│   ├── globals.css    # Global styles + brand palette
│   ├── layout.tsx     # Root layout
│   └── page.tsx      # Main page with hash-based routing
├── components/
│   ├── admin/         # Admin panel components
│   │   ├── admin-shell.tsx
│   │   ├── admin-login.tsx
│   │   ├── rich-text-editor.tsx
│   │   └── views/     # Dashboard, leads, meetings, pages, blog-posts, etc.
│   └── site/          # Public website components
│       ├── header.tsx
│       ├── hero.tsx
│       ├── services.tsx
│       ├── blog-view.tsx
│       ├── meeting-scheduler.tsx
│       └── ...
├── data/              # Static content data
│   ├── services.ts    # 10 services with full content
│   ├── industries.ts  # 3 industries with full content
│   └── blog.ts        # 5 sample articles
└── lib/
    ├── db.ts          # Prisma client
    ├── auth.ts        # Sessions, password hashing, permission guards, audit logging
    ├── rbac.ts        # Permission catalog, system roles, view-permission map
    ├── email.ts       # Email templates and sending
    └── lead-scoring.ts # Lead qualification algorithm
```

## License

MIT
