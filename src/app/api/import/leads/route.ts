import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

const VALID_STATUSES = new Set([
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION",
  "CONVERTED", "LOST", "FOLLOW_UP", "IN_PROGRESS", "CLOSED", "ARCHIVED",
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 1000;

/** RFC-4180-ish CSV line parser — handles quoted fields with commas/escapes */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** Normalize a header cell to a known field key */
function mapHeader(h: string): string | null {
  const key = h.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, string> = {
    firstname: "firstName",
    lastname: "lastName",
    name: "name",
    email: "email",
    company: "company",
    phone: "phone",
    whatsapp: "whatsapp",
    country: "country",
    city: "city",
    source: "source",
    campaign: "campaign",
    tags: "tags",
    estimatedvalue: "estimatedValue",
    value: "estimatedValue",
    expectedclosingdate: "expectedCloseAt",
    expectedcloseat: "expectedCloseAt",
    assignedstaff: "assignedTo",
    assignedto: "assignedTo",
    status: "status",
    notes: "notes",
  };
  return map[key] ?? null;
}

function validDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// POST /api/import/leads — CSV upload, row-level validation, transactional insert
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      return NextResponse.json({ error: "Only .csv files are accepted" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header row and at least one data row" },
        { status: 400 }
      );
    }

    // Parse header
    const headers = parseCsvLine(lines[0]).map(mapHeader);
    if (!headers.includes("email")) {
      return NextResponse.json(
        { error: 'CSV must include an "email" column (required). Optional: firstName, lastName, company, phone, whatsapp, country, city, source, campaign, tags, estimatedValue, expectedCloseAt, assignedTo, status, notes' },
        { status: 400 }
      );
    }

    const rows = lines.slice(1);
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (max ${MAX_ROWS} per import)` },
        { status: 400 }
      );
    }

    // Validate every row first — nothing is inserted unless we say so
    type Prepared = Record<string, string>;
    const valid: Prepared[] = [];
    const errors: { row: number; error: string }[] = [];
    const seenEmails = new Set<string>();

    rows.forEach((line, idx) => {
      const rowNo = idx + 2; // +1 header, +1 human numbering
      const cells = parseCsvLine(line);
      const rec: Prepared = {};
      headers.forEach((h, i) => {
        if (h && cells[i] !== undefined && cells[i] !== "") rec[h] = cells[i];
      });
      let rowOk = true;

      const firstName = rec.firstName ?? "";
      const lastName = rec.lastName ?? "";
      const fullName = rec.name || [firstName, lastName].filter(Boolean).join(" ");
      const email = (rec.email ?? "").toLowerCase();

      if (!email) {
        errors.push({ row: rowNo, error: "Email is required" });
        rowOk = false;
      } else if (!EMAIL_RE.test(email)) {
        errors.push({ row: rowNo, error: `Invalid email "${email}"` });
        rowOk = false;
      } else if (seenEmails.has(email)) {
        errors.push({ row: rowNo, error: `Duplicate email "${email}" in file` });
        rowOk = false;
      } else if (!fullName) {
        errors.push({ row: rowNo, error: "Name is required (firstName/lastName or name)" });
        rowOk = false;
      }

      let status = "NEW";
      if (rec.status) {
        const s = rec.status.toUpperCase().replace(/[\s-]+/g, "_");
        if (!VALID_STATUSES.has(s)) {
          errors.push({ row: rowNo, error: `Invalid status "${rec.status}"` });
          rowOk = false;
        } else status = s;
      }

      if (rec.estimatedValue && isNaN(Number(rec.estimatedValue))) {
        errors.push({ row: rowNo, error: `Invalid estimated value "${rec.estimatedValue}"` });
        rowOk = false;
      }
      if (rec.expectedCloseAt && !validDate(rec.expectedCloseAt)) {
        errors.push({ row: rowNo, error: `Invalid date "${rec.expectedCloseAt}" (use YYYY-MM-DD)` });
        rowOk = false;
      }

      if (email) seenEmails.add(email);
      if (rowOk) valid.push({ ...rec, fullName, email, status });
    });

    // Skip emails that already exist in DB (report as errors)
    const existing = await prisma.lead.findMany({
      where: { email: { in: [...seenEmails] } },
      select: { email: true },
    });
    const existingSet = new Set(existing.map((e) => e.email));
    const insertable = valid.filter((r) => {
      if (existingSet.has(r.email)) {
        errors.push({ row: 0, error: `Email ${r.email} already exists — skipped` });
        return false;
      }
      return true;
    });

    // Transactional insert of the valid set
    let inserted = 0;
    if (insertable.length > 0) {
      const result = await prisma.$transaction(
        insertable.map((r) =>
          prisma.lead.create({
            data: {
              name: r.fullName,
              email: r.email,
              company: r.company || null,
              phone: r.phone || null,
              whatsapp: r.whatsapp || null,
              country: r.country || null,
              city: r.city || null,
              source: r.source ? r.source.toLowerCase() : "import",
              campaign: r.campaign || null,
              tags: r.tags || null,
              estimatedValue: r.estimatedValue ? Number(r.estimatedValue) : null,
              expectedCloseAt: r.expectedCloseAt ? validDate(r.expectedCloseAt) : null,
              assignedTo: r.assignedTo || null,
              status: (r.status as "NEW") ?? "NEW",
              message: r.notes || null,
            },
          })
        )
      );
      inserted = result.length;
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "leads.import",
      module: "leads",
      details: `Imported ${inserted} lead(s) from ${file.name} (${errors.length} issue(s) skipped)`,
    });

    return NextResponse.json({
      inserted,
      failed: errors.length,
      errors: errors.slice(0, 100),
      total: rows.length,
    });
  } catch (e) {
    console.error("POST /api/import/leads error", e);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
