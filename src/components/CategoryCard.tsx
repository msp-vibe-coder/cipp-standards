"use client";

import { Tag } from "lucide-react";
import { truncate } from "@/lib/utils";

interface CategoryCardProps {
  allCategories: string[];
  categoryCounts: Record<string, number>;
  selectedCategories: Set<string>;
  toggleCategory: (category: string) => void;
}

export default function CategoryCard({
  allCategories,
  categoryCounts,
  selectedCategories,
  toggleCategory,
}: CategoryCardProps) {
  const isAllSelected = selectedCategories.size === 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Tag size={20} className="text-brand-primary" />
        <h3 className="font-semibold text-brand-primary">Category Distribution</h3>
      </div>
      <p className="mb-4 text-xs text-text-tertiary">
        Click to filter by category
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleCategory("")}
          className={`flex items-center justify-between rounded-lg border p-3 text-xs font-medium transition-all hover:scale-[1.02] ${
            isAllSelected
              ? "border-brand-primary/30 bg-brand-primary-light"
              : "border-border bg-surface hover:bg-surface-secondary"
          }`}
        >
          <span className={`truncate ${isAllSelected ? "text-brand-primary" : "text-text-primary"}`}>
            All Categories
          </span>
          <span className={`ml-2 font-bold ${isAllSelected ? "text-brand-primary" : "text-text-primary"}`}>
            {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>
        {allCategories.map((cat) => {
          const active = selectedCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center justify-between rounded-lg border p-3 text-xs font-medium transition-all hover:scale-[1.02] ${
                active
                  ? "border-brand-primary/30 bg-brand-primary-light"
                  : "border-border bg-surface hover:bg-surface-secondary"
              }`}
            >
              <span className="truncate text-text-primary">
                {truncate(cat, 18)}
              </span>
              <span className="ml-2 font-bold text-text-primary">
                {categoryCounts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
