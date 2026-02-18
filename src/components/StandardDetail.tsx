"use client";

import { Info, Code2, Tag } from "lucide-react";
import type { Standard } from "@/types/standards";
import ConfigOptions from "./ConfigOptions";
import MarkdownText from "./MarkdownText";


interface StandardDetailProps {
  standard: Standard;
}

export default function StandardDetail({ standard }: StandardDetailProps) {
  return (
    <div className="space-y-4 pt-4">
      {/* Executive Summary */}
      {standard.executiveText && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Info size={16} className="text-brand-primary" />
            <h4 className="text-sm font-semibold text-text-primary">
              Executive Summary
            </h4>
          </div>
          <div className="rounded-lg bg-brand-primary-light p-4">
            <p className="text-sm leading-relaxed text-text-primary">
              {standard.executiveText}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Description */}
      {standard.docsDescription && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Info size={16} className="text-brand-accent" />
            <h4 className="text-sm font-semibold text-text-primary">
              Detailed Description
            </h4>
          </div>
          <div className="text-sm leading-relaxed text-text-secondary">
            <MarkdownText text={standard.docsDescription} />
          </div>
        </div>
      )}

      {/* Tags */}
      {standard.tag && standard.tag.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Tag size={16} className="text-brand-primary" />
            <h4 className="text-sm font-semibold text-text-primary">Tags</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {standard.tag.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Options */}
      {standard.addedComponent && standard.addedComponent.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Code2 size={16} className="text-brand-primary" />
            <h4 className="text-sm font-semibold text-text-primary">
              Configuration Options
            </h4>
          </div>
          <ConfigOptions components={standard.addedComponent} />
        </div>
      )}

      {/* PowerShell Equivalent */}
      {standard.powershellEquivalent && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Code2 size={16} className="text-brand-accent" />
            <h4 className="text-sm font-semibold text-text-primary">
              PowerShell Equivalent
            </h4>
          </div>
          <div className="rounded-lg bg-code-bg p-4">
            <code className="text-sm text-text-secondary font-mono whitespace-pre-wrap break-all">
              {standard.powershellEquivalent}
            </code>
          </div>
        </div>
      )}

    </div>
  );
}
