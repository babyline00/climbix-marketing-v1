"use client";

import * as React from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/**
 * Marketing ROI calculator — estimates the revenue impact of growing
 * organic traffic and conversion rate. Intentionally conservative:
 * it compounds traffic growth with conversion improvements, nothing else.
 */
export function RoiCalculator() {
  const [visitors, setVisitors] = React.useState(10000);
  const [conversionRate, setConversionRate] = React.useState(1.5);
  const [dealValue, setDealValue] = React.useState(1200);
  const [trafficUplift, setTrafficUplift] = React.useState(50);

  const currentRevenue =
    visitors * (conversionRate / 100) * dealValue * 12;
  const futureVisitors = visitors * (1 + trafficUplift / 100);
  const futureRevenue =
    futureVisitors * (conversionRate / 100) * dealValue * 12;
  const annualGain = futureRevenue - currentRevenue;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="size-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <Calculator className="size-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold">Marketing ROI Calculator</h3>
          <p className="text-xs text-muted-foreground">
            See what a modest growth lift is worth per year
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="roi-visitors">Monthly organic visitors</Label>
          <Input
            id="roi-visitors"
            type="number"
            min={0}
            value={visitors}
            onChange={(e) => setVisitors(Math.max(0, Number(e.target.value)))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roi-cr">Conversion rate (%)</Label>
          <Input
            id="roi-cr"
            type="number"
            min={0}
            step={0.1}
            value={conversionRate}
            onChange={(e) =>
              setConversionRate(Math.max(0, Number(e.target.value)))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roi-value">Value per customer ($)</Label>
          <Input
            id="roi-value"
            type="number"
            min={0}
            value={dealValue}
            onChange={(e) => setDealValue(Math.max(0, Number(e.target.value)))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Annual traffic growth target: +{trafficUplift}%</Label>
          <Slider
            min={10}
            max={200}
            step={5}
            value={[trafficUplift]}
            onValueChange={(v) => setTrafficUplift(v[0])}
            className="mt-2.5"
          />
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
          <div className="text-xs text-muted-foreground">Revenue today</div>
          <div className="mt-1 text-xl font-bold">{currency(currentRevenue)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">per year</div>
        </div>
        <div className="rounded-2xl border border-brand-500/40 bg-brand-500/[0.06] p-4 text-center">
          <div className="text-xs text-muted-foreground">Revenue at +{trafficUplift}% traffic</div>
          <div className="mt-1 text-xl font-bold text-brand-700">
            {currency(futureRevenue)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">per year</div>
        </div>
        <div className="rounded-2xl border border-border bg-ink-900 text-white p-4 text-center">
          <div className="text-xs text-white/60">Potential annual gain</div>
          <div className="mt-1 text-xl font-bold text-brand-300">
            {currency(annualGain)}
          </div>
          <div className="text-[10px] text-white/50 mt-0.5">
            same conversion rate, more traffic
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <TrendingUp className="size-3.5 shrink-0 mt-0.5 text-brand-600" />
        <p>
          This is a deliberately simple model — real engagements also improve
          conversion rate, average order value, and retention. Want a forecast
          built on your actual funnel data instead?{" "}
          <Link
            href="/free-growth-audit"
            className="text-brand-700 font-medium hover:underline inline-flex items-center gap-0.5"
          >
            Get a free audit
            <ArrowRight className="size-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
