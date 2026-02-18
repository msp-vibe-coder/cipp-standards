"use client";

import ImpactCard from "./ImpactCard";
import CategoryCard from "./CategoryCard";
import FilteredCountCard from "./FilteredCountCard";

interface DashboardProps {
  impactCounts: Record<string, number>;
  selectedImpacts: Set<string>;
  toggleImpact: (impact: string) => void;
  allCategories: string[];
  categoryCounts: Record<string, number>;
  selectedCategories: Set<string>;
  toggleCategory: (category: string) => void;
  filteredCount: number;
  totalVisible: number;
  newStandardsCount: number;
  hasActiveFilters: boolean;
  showNewOnly: boolean;
  setShowNewOnly: (v: boolean) => void;
}

export default function Dashboard(props: DashboardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ImpactCard
        impactCounts={props.impactCounts}
        selectedImpacts={props.selectedImpacts}
        toggleImpact={props.toggleImpact}
      />
      <CategoryCard
        allCategories={props.allCategories}
        categoryCounts={props.categoryCounts}
        selectedCategories={props.selectedCategories}
        toggleCategory={props.toggleCategory}
      />
      <FilteredCountCard
        filteredCount={props.filteredCount}
        totalVisible={props.totalVisible}
        newStandardsCount={props.newStandardsCount}
        hasActiveFilters={props.hasActiveFilters}
        showNewOnly={props.showNewOnly}
        setShowNewOnly={props.setShowNewOnly}
      />
    </div>
  );
}
