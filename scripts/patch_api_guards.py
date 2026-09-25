#!/usr/bin/env python3
"""Patch admin API routes with requirePermission guards (idempotent)."""
import re, os

ROOT = "/home/z/my-project"
GUARD_IMPORT = 'import { isResponse, requirePermission } from "@/lib/auth";\n'

# file -> list of (METHOD, permission, needs_req_param, param_name)
PLAN = {
    "src/app/api/leads/route.ts": [("GET", "leads.view", True, "req")],
    "src/app/api/leads/[id]/route.ts": [("PATCH", "leads.manage", False, "req"), ("DELETE", "leads.manage", False, "req")],
    "src/app/api/meetings/route.ts": [("GET", "meetings.view", True, "req")],
    "src/app/api/emails/route.ts": [("GET", "emails.view", False, "req")],
    "src/app/api/export/leads/route.ts": [("GET", "export.data", False, "_req")],
    "src/app/api/seo/route.ts": [("GET", "appearance.manage", False, "req"), ("PUT", "appearance.manage", False, "req")],
    "src/app/api/site-content/route.ts": [("PUT", "content.manage", False, "req")],
    "src/app/api/homepage/sections/route.ts": [("GET", "homepage.manage", True, "req"), ("PATCH", "homepage.manage", False, "req")],
    "src/app/api/homepage/items/route.ts": [("GET", "homepage.manage", False, "req"), ("POST", "homepage.manage", False, "req")],
    "src/app/api/homepage/items/[id]/route.ts": [("PATCH", "homepage.manage", False, "req"), ("DELETE", "homepage.manage", False, "req")],
    "src/app/api/header/links/route.ts": [("GET", "header.manage", True, "req"), ("POST", "header.manage", False, "req"), ("PATCH", "header.manage", False, "req")],
    "src/app/api/header/links/[id]/route.ts": [("PATCH", "header.manage", False, "req"), ("DELETE", "header.manage", False, "req")],
    "src/app/api/popup/route.ts": [("GET", "header.manage", True, "req"), ("PUT", "header.manage", False, "req")],
    "src/app/api/media/route.ts": [("GET", "media.view", True, "req"), ("POST", "media.manage", False, "req")],
    "src/app/api/media/[id]/route.ts": [("DELETE", "media.manage", False, "req"), ("PATCH", "media.manage", False, "req")],
    "src/app/api/categories/route.ts": [("GET", "content.view", True, "req"), ("POST", "content.manage", False, "req")],
    "src/app/api/categories/[id]/route.ts": [("PATCH", "content.manage", False, "req"), ("DELETE", "content.manage", False, "req")],
    "src/app/api/blog-posts/route.ts": [("POST", "content.manage", False, "req")],
    "src/app/api/blog-posts/[id]/route.ts": [("PATCH", "content.manage", False, "req"), ("DELETE", "content.manage", False, "req")],
    "src/app/api/pages/route.ts": [("POST", "content.manage", False, "req")],
    "src/app/api/pages/[id]/route.ts": [("PATCH", "content.manage", False, "req"), ("DELETE", "content.manage", False, "req")],
}

for rel, handlers in PLAN.items():
    path = os.path.join(ROOT, rel)
    src = open(path).read()

    # 1. add import if missing
    if GUARD_IMPORT not in src:
        lines = src.split("\n")
        # insert after last import line at top
        last_import = 0
        for i, ln in enumerate(lines[:30]):
            if ln.startswith("import ") or ln.startswith('import "'):
                last_import = i
        lines.insert(last_import + 1, GUARD_IMPORT.rstrip("\n"))
        src = "\n".join(lines)

    for method, perm, needs_req, pname in handlers:
        # find handler signature (may be multi-line params)
        if needs_req:
            # replace `METHOD() {` with `METHOD(req: NextRequest) {`
            pat = re.compile(r"export async function %s\(\) \{" % method)
            src = pat.sub(
                "export async function %s(req: NextRequest) {" % method, src, count=1
            )

        # locate the function body start
        m = re.search(r"export async function %s\([^)]*\)?[^{]*\{" % method, src, re.S)
        if not m:
            m = re.search(r"export async function %s\([^{]*\{" % method, src, re.S)
        if not m:
            print(f"!! {rel}: {method} signature not found")
            continue

        insert_at = m.end()
        guard = (
            f"\n  const session = await requirePermission({pname}, \"{perm}\");\n"
            f"  if (isResponse(session)) return session;\n"
        )
        # idempotency: check if guard already present within next 300 chars
        window = src[insert_at:insert_at + 400]
        if f'requirePermission({pname}, "{perm}")' in window:
            print(f".. {rel}: {method} already guarded")
            continue
        src = src[:insert_at] + guard + src[insert_at:]
        print(f"OK {rel}: {method} -> {perm}")

    open(path, "w").write(src)
print("done")
