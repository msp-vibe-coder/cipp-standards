"use client";

import type { AddedComponent } from "@/types/standards";

interface ConfigOptionsProps {
  components: AddedComponent[];
}

export default function ConfigOptions({ components }: ConfigOptionsProps) {
  if (!components || components.length === 0) return null;

  return (
    <div>
      <div className="grid gap-3">
        {components.map((comp, i) => (
          <div
            key={comp.name || i}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {comp.label}
              </p>
              {comp.helperText && (
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {comp.helperText}
                </p>
              )}
            </div>
            <div className="ml-3 flex items-center gap-2">
              <span className="rounded-md bg-code-bg px-2 py-0.5 text-xs font-mono text-text-secondary">
                {comp.type}
              </span>
              {!comp.options?.length && !comp.defaultValue && !comp.default && (
                <span className="text-xs text-text-tertiary">(No options)</span>
              )}
              {comp.multiple && (
                <span className="rounded-md bg-brand-primary-light px-2 py-0.5 text-xs font-medium text-brand-primary">
                  Multiple
                </span>
              )}
              {comp.api && (
                <span className="rounded-md bg-brand-primary-light px-2 py-0.5 text-xs font-medium text-brand-primary">
                  API
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
