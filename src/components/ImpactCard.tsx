"use client";

import { AlertCircle } from "lucide-react";
import { impactConfig, type ImpactLevel } from "@/lib/constants";

interface ImpactCardProps {
  impactCounts: Record<string, number>;
  selectedImpacts: Set<string>;
  toggleImpact: (impact: string) => void;
}

const impactOrder: ImpactLevel[] = ["High Impact", "Low Impact", "Medium Impact"];

export default function ImpactCard({
  impactCounts,
  selectedImpacts,
  toggleImpact,
}: ImpactCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <AlertCircle size={20} className="text-brand-primary" />
        <h3 className="font-semibold text-brand-primary">Impact Distribution</h3>
      </div>
      <p className="mb-4 text-xs text-text-tertiary">
        Click to filter by severity level
      </p>
      <div className="space-y-2">
        {impactOrder.map((impact) => {
          const cfg = impactConfig[impact];
          const active = selectedImpacts.has(impact);
          return (
            <button
              key={impact}
              onClick={() => toggleImpact(impact)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all hover:scale-[1.02] ${
                active
                  ? "border-brand-primary/30 bg-brand-primary-light"
                  : "border-border hover:bg-surface-secondary"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotColor}`} />
                <span className="text-text-primary">{impact}</span>
              </div>
              <span className="font-semibold text-text-primary">
                {impactCounts[impact] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
