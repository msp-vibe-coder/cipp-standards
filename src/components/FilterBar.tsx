"use client";

import { Archive, LayoutGrid, Rows3, Tag, Users } from "lucide-react";
import type { ViewMode } from "@/hooks/useStandardsFilter";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  allTags: string[];
  selectedTags: Set<string>;
  toggleTag: (t: string) => void;
  allRecommendedBy: string[];
  selectedRecommendedBy: Set<string>;
  toggleRecommendedBy: (r: string) => void;
  showDeprecated: boolean;
  setShowDeprecated: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export default function FilterBar(props: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <SearchBar value={props.searchQuery} onChange={props.setSearchQuery} />
        <div className="flex overflow-hidden rounded-lg border border-border">
          <button
            onClick={() => props.setViewMode("card")}
            aria-label="Card view"
            className={`flex items-center justify-center p-2 transition-colors ${
              props.viewMode === "card"
                ? "bg-brand-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => props.setViewMode("table")}
            aria-label="Table view"
            className={`flex items-center justify-center border-l border-border p-2 transition-colors ${
              props.viewMode === "table"
                ? "bg-brand-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            <Rows3 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Tags"
          icon={<Tag size={14} />}
          options={props.allTags}
          selected={props.selectedTags}
          onToggle={props.toggleTag}
        />

        <FilterDropdown
          label="Recommended By"
          icon={<Users size={14} />}
          options={props.allRecommendedBy}
          selected={props.selectedRecommendedBy}
          onToggle={props.toggleRecommendedBy}
        />

        <button
          onClick={() => props.setShowDeprecated(!props.showDeprecated)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            props.showDeprecated
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-border bg-surface text-text-secondary hover:border-brand-primary"
          }`}
        >
          <Archive size={14} />
          <span>Show Deprecated</span>
        </button>
      </div>
    </div>
  );
}
