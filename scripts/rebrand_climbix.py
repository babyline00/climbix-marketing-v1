#!/usr/bin/env python3
"""Rebrand Growthora -> Climbix Marketing across the growthora project.

Ordered replacements: compound tokens first (passwords, tokens, channels,
emails, socials, CSV names), then multi-word phrases, then the bare brand.
"""
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")

FILES = [
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/api/auth/route.ts",
    "src/app/api/meetings/route.ts",
    "src/app/api/leads/route.ts",
    "src/app/api/export/leads/route.ts",
    "src/app/api/blog-posts/route.ts",
    "src/app/api/seo/route.ts",
    "src/lib/email.ts",
    "src/data/services.ts",
    "src/data/blog.ts",
    "src/components/site/testimonials.tsx",
    "src/components/site/dynamic-article-view.tsx",
    "src/components/site/header.tsx",
    "src/components/site/blog-view.tsx",
    "src/components/site/hero.tsx",
    "src/components/site/site-content-context.tsx",
    "src/components/site/footer.tsx",
    "src/components/site/article-view.tsx",
    "src/components/site/page-view.tsx",
    "src/components/admin/admin-shell.tsx",
    "src/components/admin/admin-login.tsx",
    "src/components/admin/admin-panel.tsx",
    "src/components/admin/views/content.tsx",
    "src/components/admin/views/blog-posts.tsx",
    "prisma/schema.prisma",
    "README.md",
]

# Order matters: longest / most specific first.
REPLACEMENTS = [
    # storage / channel tokens
    ("growthora-admin-token", "climbix-admin-token"),
    ("growthora-content", "climbix-content"),
    ("growthora-leads-", "climbix-leads-"),
    # domains & socials
    ("@growthora.com", "@climbixmarketing.com"),
    ("company/growthora", "company/climbixmarketing"),
    ("twitter.com/growthora", "twitter.com/climbixmarketing"),
    # multi-word phrases (before bare brand)
    ("Growthora marketing team", "Climbix Marketing team"),
    ("Growthora Team", "Climbix Team"),
    ("Growthora Admin", "Climbix Admin"),
    ("Growthora Blog", "Climbix Marketing Blog"),
    ("The Growthora ", "The Climbix "),
    # bare brand fallback
    ("Growthora", "Climbix Marketing"),
]


def main() -> int:
    total = 0
    leftovers = []
    for rel in FILES:
        path = ROOT / rel
        if not path.exists():
            print(f"MISSING: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        count = 0
        for old, new in REPLACEMENTS:
            n = text.count(old)
            if n:
                text = text.replace(old, new)
                count += n
        path.write_text(text, encoding="utf-8")
        total += count
        print(f"{rel}: {count} replacement(s)")
        # anything left?
        low = text.lower()
        if "growthora" in low:
            leftovers.append(rel)
    print(f"\nTotal replacements: {total}")
    if leftovers:
        print("Files still containing 'growthora' (expect only split wordmarks):")
        for f in leftovers:
            print(f"  - {f}")
    else:
        print("No leftovers.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
