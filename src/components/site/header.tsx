"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGrowthPlan } from "@/components/site/growth-plan-context";
import { useServices } from "@/components/site/services-context";
import { INDUSTRIES } from "@/data/industries";
import { DEFAULT_HEADER_LINKS, type HeaderLinkItem } from "@/lib/header";
import { DEFAULT_BRAND, type BrandSettings } from "@/lib/brand";
import { BrandLockup, BrandLogo, BrandWordmark } from "@/components/site/brand-mark";

type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

const INDUSTRIES_CHILDREN: NavChild[] = INDUSTRIES.map((i) => ({
  label: i.name,
  href: `/industries/${i.slug}`,
  desc: i.tagline,
}));

const COMPANY_CHILDREN: NavChild[] = [
  { label: "About Us", href: "/about", desc: "Who we are and how we work" },
  { label: "Case Studies", href: "/case-studies", desc: "Real client results" },
  { label: "Our Process", href: "/process", desc: "How we grow your business" },
  { label: "Pricing", href: "/pricing", desc: "Transparent monthly plans" },
  { label: "Testimonials", href: "/testimonials", desc: "What clients say" },
  { label: "FAQ", href: "/faq", desc: "Questions, answered" },
  { label: "Contact", href: "/contact", desc: "Talk to a strategist" },
];

const RESOURCES_CHILDREN: NavChild[] = [
  { label: "Blog", href: "/blog", desc: "Growth & SEO insights" },
  { label: "SEO Guides", href: "/seo-guides", desc: "Step-by-step playbooks" },
  { label: "Free Tools", href: "/free-tools", desc: "Audit, ROI calculator & more" },
  { label: "Free Growth Audit", href: "/free-growth-audit", desc: "30-point website analysis" },
  { label: "Strategy Call", href: "/strategy-call", desc: "Free 30-minute consult" },
];

/** Fallback nav when no DB data is passed (defensive only). */
const FALLBACK_NAV: HeaderLinkItem[] = DEFAULT_HEADER_LINKS.map((l, i) => ({
  id: `fallback-${i}`,
  label: l.label,
  href: l.href,
  kind: l.kind,
  isSystem: true,
  isActive: true,
  position: (i + 1) * 10,
}));

function navChildrenFor(
  kind: string,
  services: NavChild[]
): NavChild[] | undefined {
  if (kind === "services") return services;
  if (kind === "industries") return INDUSTRIES_CHILDREN;
  if (kind === "company") return COMPANY_CHILDREN;
  if (kind === "resources") return RESOURCES_CHILDREN;
  return undefined;
}

export function SiteHeader({
  links,
  brand = DEFAULT_BRAND,
}: {
  links?: HeaderLinkItem[];
  brand?: BrandSettings;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const { openGrowthPlan } = useGrowthPlan();
  const services = useServices();

  const servicesChildren: NavChild[] = services.map((s) => ({
    label: s.name,
    href: `/services/${s.slug}`,
    desc: s.tagline,
  }));

  const nav = links && links.length > 0 ? links : FALLBACK_NAV;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderLink = (item: HeaderLinkItem, variant: "desktop" | "mobile") => {
    const children = navChildrenFor(item.kind, servicesChildren);
    const isExternal =
      item.kind === "link" && /^https?:\/\//i.test(item.href);

    if (variant === "desktop") {
      if (isExternal) {
        return (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-medium tracking-[-0.01em] text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-400 after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:transition-none"
          >
            {item.label}
          </a>
        );
      }
      return (
        <Link
          href={item.href}
          className="group relative inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-medium tracking-[-0.01em] text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-400 after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:transition-none"
        >
          {item.label}
          {children && <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180 motion-reduce:transition-none" />}
        </Link>
      );
    }

    // Mobile sheet
    return (
      <SheetClose asChild>
        {isExternal ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted hover:text-brand-700"
          >
            {item.label}
          </a>
        ) : (
          <Link
            href={item.href}
            className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted hover:text-brand-700"
          >
            {item.label}
          </Link>
        )}
      </SheetClose>
    );
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-900/90 text-white backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none",
        scrolled && "border-white/15 bg-ink-900/95 shadow-lg shadow-black/20"
      )}
    >
      <div className="mx-auto max-w-7xl container-px">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="motion-reduce:transform-none"
          >
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            aria-label={`${brand.appName} home`}
          >
            <BrandLockup brand={brand} />
          </Link>
          </motion.div>

          {/* Desktop nav — admin-managed links in DB order */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => {
              const children = navChildrenFor(item.kind, servicesChildren);
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => children && setOpenMenu(item.id)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {renderLink(item, "desktop")}
                  {children && (
                    <AnimatePresence>
                      {openMenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className={
                            item.kind === "services"
                              ? "absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[34rem]"
                              : "absolute left-0 top-full pt-2 w-80"
                          }
                        >
                          <div
                            className={cn(
                              "rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl shadow-black/10 max-h-[70vh] overflow-y-auto scrollbar-thin",
                              item.kind === "services" &&
                                "grid grid-cols-2 gap-1"
                            )}
                          >
                            {children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setOpenMenu(null)}
                                className="group/item block rounded-xl px-3 py-2.5 transition-all duration-200 hover:translate-x-1 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-reduce:transition-none"
                              >
                                <div className="text-[15px] font-semibold tracking-[-0.01em] transition-colors group-hover/item:text-brand-700">
                                  {child.label}
                                </div>
                                {child.desc && (
                                  <div className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                                    {child.desc}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="group text-[15px] font-medium text-white/80 transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white active:translate-y-0 motion-reduce:transition-none"
            >
              <Link href="/free-growth-audit">
                <Search className="size-4 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
                Free Audit
              </Link>
            </Button>
            <Button
              onClick={() => openGrowthPlan({ source: "header-cta" })}
              size="sm"
              className="group bg-brand-600 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-brand-500/35 active:translate-y-0 motion-reduce:transition-none"
            >
              Get Free Strategy
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </Button>
          </div>

          {/* Mobile trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transition-none"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-96 p-0 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                  <BrandLogo brand={brand} decorative />
                  <BrandWordmark brand={brand} />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu for {brand.appName} website
                </SheetDescription>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-1">
                {nav.map((item) => {
                  const children = navChildrenFor(item.kind, servicesChildren);
                  return (
                    <div key={item.id} className="space-y-1">
                      {renderLink(item, "mobile")}
                      {children && (
                        <div className="pl-3 border-l border-border ml-3 space-y-1">
                          {children.map((child) => (
                            <SheetClose asChild key={child.label}>
                              <Link
                                href={child.href}
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {child.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              <div className="p-5 border-t border-border space-y-2">
                <SheetClose asChild>
                  <Button
                    onClick={() =>
                      openGrowthPlan({ source: "mobile-header-cta" })
                    }
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    Get Free Strategy
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/free-growth-audit">
                      Get Free Website Audit
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
