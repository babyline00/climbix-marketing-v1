import {
  AlertTriangle,
  BadgePercent,
  Briefcase,
  Building2,
  ClipboardCheck,
  Factory,
  HeartHandshake,
  HelpCircle,
  LayoutTemplate,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Representative icon per homepage section key. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Sparkles,
  "trust-badges": ShieldCheck,
  "client-logos": Building2,
  offers: BadgePercent,
  problem: AlertTriangle,
  services: Layers,
  "why-us": HeartHandshake,
  "case-studies": Briefcase,
  process: Workflow,
  industries: Factory,
  locations: MapPin,
  "free-audit": ClipboardCheck,
  testimonials: Star,
  faq: HelpCircle,
  "final-cta": Target,
};

export function sectionIcon(key: string): LucideIcon {
  return SECTION_ICONS[key] ?? LayoutTemplate;
}