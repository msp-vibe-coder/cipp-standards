"use client";

import { BarChart3, Sparkles } from "lucide-react";

interface FilteredCountCardProps {
  filteredCount: number;
  totalVisible: number;
  newStandardsCount: number;
  hasActiveFilters: boolean;
  showNewOnly: boolean;
  setShowNewOnly: (v: boolean) => void;
}

export default function FilteredCountCard({
  filteredCount,
  totalVisible,
  newStandardsCount,
  hasActiveFilters,
  showNewOnly,
  setShowNewOnly,
}: FilteredCountCardProps) {
  const pct =
    totalVisible > 0
      ? Math.round((newStandardsCount / totalVisible) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <BarChart3 size={20} className="text-brand-primary" />
        <h3 className="font-semibold text-brand-primary">Filtered Standards</h3>
      </div>
      <p className="mb-4 text-xs text-text-tertiary">Matching your criteria</p>

      <div className="mb-4 text-center">
        <span className="text-4xl font-bold text-brand-primary">
          {filteredCount}
        </span>
        <p className="mt-1 text-xs text-text-tertiary">
          {hasActiveFilters
            ? `Showing ${filteredCount} of ${totalVisible} standards`
            : "Showing all standards"}
        </p>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-primary" />
            <p className="text-sm font-medium text-brand-primary">
              New Standards
            </p>
          </div>
          <p className="text-xs text-text-tertiary">
            Added in last 30 days
          </p>
          <span className="my-1 text-2xl font-bold text-text-primary">
            {newStandardsCount}
          </span>
          <p className="mb-2 text-xs text-text-tertiary">
            {pct}% of filtered
          </p>
          <button
            onClick={() => setShowNewOnly(!showNewOnly)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showNewOnly
                ? "bg-brand-primary text-white"
                : "bg-surface-secondary text-text-secondary hover:bg-border"
            }`}
          >
            <Sparkles size={12} />
            {showNewOnly ? "Show All" : "Show New Only"}
          </button>
        </div>
      </div>
    </div>
  );
}
