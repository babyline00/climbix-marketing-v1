import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/export/leads — export all leads as CSV
export async function GET(_req: NextRequest) {
  const session = await requirePermission(_req, "export.data");
  if (isResponse(session)) return session;

  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Name",
      "Email",
      "Company",
      "Website",
      "Phone",
      "Service",
      "Goal",
      "Source",
      "Audit Score",
      "Status",
      "Action",
      "Action Note",
      "Message",
      "Created At",
      "Updated At",
    ];

    const escape = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = leads.map((l) =>
      [
        l.id,
        l.name,
        l.email,
        l.company,
        l.website,
        l.phone,
        l.service,
        l.goal,
        l.source,
        l.auditScore,
        l.status,
        l.action,
        l.actionNote,
        l.message,
        l.createdAt.toISOString(),
        l.updatedAt.toISOString(),
      ]
        .map(escape)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="climbix-leads-${Date.now()}.csv"`,
      },
    });
  } catch (e) {
    console.error("GET /api/export/leads error", e);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
