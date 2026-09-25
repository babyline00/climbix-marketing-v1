"use client";

import * as React from "react";
import { Loader2, Upload, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportResult {
  inserted: number;
  failed: number;
  total: number;
  errors: { row: number; error: string }[];
}

const TEMPLATE = `firstName,lastName,email,company,phone,city,country,source,status,estimatedValue,assignedTo,notes
John,Doe,john@example.com,Acme Corp,+1 555 0100,New York,USA,Website,NEW,5000,Sarah Ahmed,Interested in SEO retainer`;

export function LeadImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImported: () => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    if (!file) {
      setError("Please choose a CSV file");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/import/leads", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        onImported();
      } else {
        setError(data.error ?? "Import failed");
      }
    } catch {
      setError("Import failed. Please retry.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Leads (CSV)</DialogTitle>
          <DialogDescription>
            Upload up to 1,000 leads. Rows are validated first — invalid rows are skipped and reported, valid rows are imported in a single transaction.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800">
                  {result.inserted} lead{result.inserted !== 1 ? "s" : ""} imported
                </p>
                <p className="text-xs text-emerald-700">
                  {result.total} row{result.total !== 1 ? "s" : ""} processed
                  {result.failed > 0 ? ` · ${result.failed} skipped` : " · no issues"}
                </p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800 mb-2">
                  <AlertTriangle className="size-4" />
                  Skipped rows ({result.errors.length})
                </p>
                <ul className="space-y-1 max-h-40 overflow-y-auto text-xs text-amber-800">
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      {e.row > 0 ? `Row ${e.row}: ` : ""}
                      {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">CSV file *</label>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && <p className="text-xs text-slate-500">{file.name}</p>}
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
              <p className="font-medium text-slate-700">Required column: email. Optional:</p>
              <p className="font-mono text-[11px] leading-relaxed">
                firstName, lastName, name, company, phone, whatsapp, city, country, source, campaign, tags, estimatedValue, expectedCloseAt, assignedTo, status, notes
              </p>
              <p>
                Status must be one of: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION,
                CONVERTED, LOST, FOLLOW_UP.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
                type="button"
              >
                <Download className="size-3" /> Download CSV template
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={importing || !file}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                {importing ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Upload className="size-4 mr-1.5" />}
                Import
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
