export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  duration: string;
  challenge: string;
  strategy: string[];
  outcomes: { label: string; value: string }[];
  timeline: { phase: string; work: string }[];
  disclosure: string;
  quote?: { text: string; name: string; role: string };
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "nexacloud",
    client: "NexaCloud",
    industry: "SaaS — Workflow Automation",
    duration: "9 months",
    challenge: "Traffic was healthy but the funnel was inefficient: roughly 40,000 monthly visits converted to demos at 0.4%, while paid acquisition supplied most of the pipeline.",
    strategy: ["Bottom-funnel keyword and comparison strategy", "14 pillar-and-cluster content hubs", "Free-tool lead magnets and nurture flows", "Demo-flow CRO experiments"],
    outcomes: [{ label: "Organic traffic", value: "+250%" }, { label: "Qualified leads", value: "+180%" }, { label: "Organic-sourced revenue", value: "+120%" }],
    timeline: [{ phase: "Months 1–2", work: "Technical baseline, keyword mapping, analytics and conversion-path review." }, { phase: "Months 3–6", work: "Content hubs, comparison pages, internal linking and lead magnets." }, { phase: "Months 7–9", work: "CRO experiments, content refreshes and pipeline attribution." }],
    disclosure: "Client name and performance figures are presented as supplied for this case-study portfolio; attribution methods and measurement windows should be confirmed with the engagement owner before external publication.",
    quote: { text: "Within two quarters, our organic pipeline became our largest source of new business.", name: "Aisha Rahman", role: "VP Marketing, NexaCloud" },
  },
  {
    slug: "pinnacle-consulting-group",
    client: "Pinnacle Consulting Group",
    industry: "B2B — Professional Services",
    duration: "6 months",
    challenge: "Acquisition relied heavily on referrals and LinkedIn ads, while service pages and proposal-stage conversion paths were not aligned to buyer objections.",
    strategy: ["PPC account restructuring by intent", "Retargeting around proposal-stage objections", "Buyer-focused service-page rewrites", "Consultation-flow CRO"],
    outcomes: [{ label: "Cost per acquisition", value: "-40%" }, { label: "Monthly qualified leads", value: "+200%" }, { label: "Blended ROAS", value: "+165%" }],
    timeline: [{ phase: "Month 1", work: "Account audit, attribution checks and funnel diagnostics." }, { phase: "Months 2–4", work: "Campaign restructuring, landing-page changes and retargeting." }, { phase: "Months 5–6", work: "CRO iterations, budget reallocation and reporting." }],
    disclosure: "Client name and performance figures are presented as supplied for this case-study portfolio; attribution methods and measurement windows should be confirmed with the engagement owner before external publication.",
    quote: { text: "We cut our cost per acquisition by 38% in the first 90 days.", name: "Lena Volkov", role: "Director of Demand Gen, Pinnacle" },
  },
  {
    slug: "quantly",
    client: "Quantly",
    industry: "SaaS — Analytics Platform",
    duration: "8 months",
    challenge: "Buyers increasingly used AI assistants for vendor research, but the brand had limited visibility in those answers despite stable traditional search rankings.",
    strategy: ["Entity and structured-data improvements", "Citation-worthy original research", "Category comparison assets", "Digital PR and authoritative mentions"],
    outcomes: [{ label: "AI citations", value: "+340%" }, { label: "Demo requests from AI search", value: "+95%" }, { label: "Pipeline influenced", value: "$1.2M" }],
    timeline: [{ phase: "Months 1–2", work: "Entity audit, source mapping and technical search review." }, { phase: "Months 3–5", work: "Original data assets, comparisons and definitive guides." }, { phase: "Months 6–8", work: "Digital PR, source acquisition and citation monitoring." }],
    disclosure: "AI-search metrics are dependent on the monitoring methodology, query set and observation window. They should not be interpreted as a guarantee of inclusion in any particular AI system.",
    quote: { text: "Their AI search optimization work got us cited for our core category.", name: "Mira Tanaka", role: "Head of Growth, Quantly" },
  },
  {
    slug: "skyline-commerce",
    client: "Skyline Commerce",
    industry: "Ecommerce — DTC Home Goods",
    duration: "8 months",
    challenge: "Revenue had been flat for three quarters, sales depended heavily on paid ads, and collection pages lacked organic visibility and retention flows.",
    strategy: ["Collection-page SEO and internal linking", "Buying-guide content hub", "Performance Max restructuring by margin", "Email and SMS lifecycle flows"],
    outcomes: [{ label: "Organic revenue", value: "+214%" }, { label: "Blended CAC", value: "-31%" }, { label: "Average order value", value: "+22%" }],
    timeline: [{ phase: "Months 1–2", work: "Collection audit, technical SEO and margin-based channel analysis." }, { phase: "Months 3–5", work: "Buying guides, collection rewrites and lifecycle automation." }, { phase: "Months 6–8", work: "Paid-budget optimization and retention experimentation." }],
    disclosure: "Client name and performance figures are presented as supplied for this case-study portfolio; attribution methods and measurement windows should be confirmed with the engagement owner before external publication.",
    quote: { text: "Organic became our second-largest revenue channel in eight months.", name: "Omar Haddad", role: "Co-founder, Skyline Commerce" },
  },
  {
    slug: "brightpath-health",
    client: "BrightPath Health",
    industry: "Healthcare — Multi-Location Clinics",
    duration: "6 months",
    challenge: "Seven clinic locations had inconsistent local visibility, weak review processes and limited organic indexing, while paid traffic was not consistently converting to bookings.",
    strategy: ["Google Business Profile and citation cleanup", "Service × location content architecture", "Privacy-first review generation", "Call tracking and booking funnel improvements"],
    outcomes: [{ label: "Map pack appearances", value: "+178%" }, { label: "New patient calls", value: "+120%" }, { label: "Cost per booked patient", value: "-68%" }],
    timeline: [{ phase: "Months 1–2", work: "Location audit, profile cleanup and measurement setup." }, { phase: "Months 3–4", work: "Service/location pages and review workflows." }, { phase: "Months 5–6", work: "Call tracking, booking optimization and local reporting." }],
    disclosure: "Healthcare work is described as privacy-first marketing support, not legal or regulatory compliance advice. Performance figures are presented as supplied and should be independently validated before publication.",
    quote: { text: "All seven of our locations now show up for their core services.", name: "Samuel Park", role: "COO, BrightPath Health" },
  },
  {
    slug: "meridian-properties",
    client: "Meridian Properties",
    industry: "Real Estate — Luxury Brokerage",
    duration: "9 months",
    challenge: "Lead acquisition depended on portals, the site had weak non-brand visibility, and sold listings stopped contributing useful search equity.",
    strategy: ["Hyperlocal neighborhood content hubs", "Home-valuation lead funnel", "Listing templates with structured data", "Unified agent and review architecture"],
    outcomes: [{ label: "Organic leads", value: "+310%" }, { label: "Cost per qualified lead", value: "$19" }, { label: "Top-3 neighborhood rankings", value: "25 terms" }],
    timeline: [{ phase: "Months 1–3", work: "Technical audit, neighborhood research and information architecture." }, { phase: "Months 4–6", work: "Neighborhood hubs, valuation funnel and listing templates." }, { phase: "Months 7–9", work: "Agent pages, review program and ranking expansion." }],
    disclosure: "Client name and performance figures are presented as supplied for this case-study portfolio; attribution methods and measurement windows should be confirmed with the engagement owner before external publication.",
  },
];

