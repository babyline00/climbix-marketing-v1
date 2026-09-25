// Lead scoring utility — auto-qualifies leads based on form data
// Score: 0-100, Tier: HOT (70+), WARM (40-69), COLD (<40)

type LeadData = {
  name?: string | null;
  email?: string;
  company?: string | null;
  website?: string | null;
  phone?: string | null;
  service?: string | null;
  goal?: string | null;
  message?: string | null;
  source?: string | null;
  auditScore?: number | null;
};

type ScoreResult = {
  score: number;
  tier: "HOT" | "WARM" | "COLD";
  reasons: string[];
};

export function calculateLeadScore(data: LeadData): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Has name (+10)
  if (data.name) {
    score += 10;
    reasons.push("Provided name (+10)");
  }

  // Has company (+15) — business intent signal
  if (data.company) {
    score += 15;
    reasons.push("Provided company name (+15)");
  }

  // Has website (+10) — ready to be audited
  if (data.website) {
    score += 10;
    reasons.push("Provided website URL (+10)");
  }

  // Has phone (+5) — direct contact willingness
  if (data.phone) {
    score += 5;
    reasons.push("Provided phone number (+5)");
  }

  // Has specific service interest (+15) — qualified intent
  if (data.service && data.service !== "General Strategy Call") {
    score += 15;
    reasons.push(`Specific service interest: ${data.service} (+15)`);
  }

  // Has specific goal (+10) — knows what they want
  if (data.goal) {
    score += 10;
    reasons.push(`Clear goal: ${data.goal} (+10)`);
  }

  // Has message/note (+5) — engaged
  if (data.message && data.message.length > 20) {
    score += 5;
    reasons.push("Wrote a detailed message (+5)");
  }

  // Source quality scoring
  if (data.source) {
    if (data.source.includes("meeting-scheduler")) {
      score += 20;
      reasons.push("Booked a meeting — high intent (+20)");
    } else if (data.source.includes("pricing")) {
      score += 15;
      reasons.push("Engaged from pricing page (+15)");
    } else if (data.source.includes("service")) {
      score += 10;
      reasons.push("Engaged from service page (+10)");
    } else if (data.source.includes("free-audit")) {
      score += 5;
      reasons.push("Completed free audit (+5)");
    } else if (data.source.includes("hero")) {
      score += 5;
      reasons.push("Engaged from hero CTA (+5)");
    }
  }

  // Audit score bonus — if they completed an audit with a decent score
  if (data.auditScore) {
    if (data.auditScore < 50) {
      score += 15;
      reasons.push(`Low audit score (${data.auditScore}/100) — needs help (+15)`);
    } else if (data.auditScore >= 70) {
      score += 5;
      reasons.push(`Good audit score (${data.auditScore}/100) (+5)`);
    }
  }

  // Email domain quality — business email vs free email
  if (data.email) {
    const domain = data.email.split("@")[1]?.toLowerCase();
    const freeEmailProviders = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
      "icloud.com", "aol.com", "protonmail.com", "mail.com",
    ];
    if (domain && !freeEmailProviders.includes(domain)) {
      score += 10;
      reasons.push(`Business email domain (${domain}) (+10)`);
    } else {
      reasons.push("Free email provider (no bonus)");
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine tier
  let tier: "HOT" | "WARM" | "COLD";
  if (score >= 70) {
    tier = "HOT";
  } else if (score >= 40) {
    tier = "WARM";
  } else {
    tier = "COLD";
  }

  return { score, tier, reasons };
}
