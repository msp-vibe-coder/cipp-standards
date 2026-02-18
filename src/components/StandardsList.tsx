"use client";

import type { Standard } from "@/types/standards";
import type { ViewMode } from "@/hooks/useStandardsFilter";
import { impactConfig, type ImpactLevel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import StandardCard from "./StandardCard";
import { useState } from "react";
import StandardDetail from "./StandardDetail";

interface StandardsListProps {
  standards: Standard[];
  viewMode: ViewMode;
}

function TableView({ standards }: { standards: Standard[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-secondary">
            <th className="px-4 py-3 text-left font-medium text-text-secondary">
              Name
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-text-secondary sm:table-cell">
              Impact
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">
              Date Added
            </th>
          </tr>
        </thead>
        {standards.map((s, i) => {
          const cfg =
            impactConfig[s.impact as ImpactLevel] || impactConfig["Low Impact"];
          const isExpanded = expandedIdx === i;
          return (
            <tbody key={s.name}>
              <tr
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="cursor-pointer border-b border-border transition-colors hover:bg-surface-secondary"
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {s.label}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  >
                    {s.impact}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                  {s.cat}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-text-tertiary">
                  {formatDate(s.addedDate)}
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={4} className="border-b border-border bg-surface-secondary px-4 pb-4">
                    <StandardDetail standard={s} />
                  </td>
                </tr>
              )}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default function StandardsList({
  standards,
  viewMode,
}: StandardsListProps) {
  if (standards.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <p className="text-text-secondary">
          No standards match your current filters.
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  if (viewMode === "table") {
    return <TableView standards={standards} />;
  }

  return (
    <div className="space-y-3">
      {standards.map((standard) => (
        <StandardCard key={standard.name} standard={standard} />
      ))}
    </div>
  );
}
