"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import type { Standard } from "@/types/standards";
import { impactConfig, type ImpactLevel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import MarkdownText from "./MarkdownText";
import StandardDetail from "./StandardDetail";

interface StandardCardProps {
  standard: Standard;
}

const impactIcons: Record<string, React.ReactNode> = {
  "High Impact": <AlertCircle size={12} />,
  "Medium Impact": <AlertTriangle size={12} />,
  "Low Impact": <Info size={12} />,
};

export default function StandardCard({ standard }: StandardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = impactConfig[standard.impact as ImpactLevel] || impactConfig["Low Impact"];

  return (
    <div
      className={`rounded-xl border bg-surface shadow-sm transition-shadow hover:shadow-md ${
        expanded ? "border-brand-primary/30" : "border-border"
      }`}
    >
      <div className="flex rounded-xl">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-start gap-4 p-4 text-left"
          aria-expanded={expanded}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-text-primary">
                {standard.label}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
              >
                {impactIcons[standard.impact]}
                {standard.impact}
              </span>
              {standard.tag?.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1.5 line-clamp-2 text-sm text-text-secondary">
              <MarkdownText text={standard.helpText} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {standard.addedDate && (
              <span className="flex items-center gap-1 whitespace-nowrap text-xs text-text-tertiary">
                <Clock size={12} />
                {formatDate(standard.addedDate)}
              </span>
            )}
            <ChevronDown
              size={18}
              className={`transition-all ${
                expanded
                  ? "rotate-180 text-brand-primary"
                  : "text-text-tertiary"
              }`}
            />
          </div>
        </button>
      </div>

      <div className={`accordion-content ${expanded ? "open" : ""}`}>
        <div>
          <div className="border-t border-border px-4 pb-4">
            <StandardDetail standard={standard} />
          </div>
        </div>
      </div>
    </div>
  );
}
