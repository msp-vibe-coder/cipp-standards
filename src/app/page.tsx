"use client";

import { useTheme } from "@/hooks/useTheme";
import { useStandardsFilter } from "@/hooks/useStandardsFilter";
import standards from "@/data/standards.json";
import type { Standard } from "@/types/standards";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import FilterBar from "@/components/FilterBar";
import StandardsList from "@/components/StandardsList";

export default function Home() {
  const { isDark, toggle, mounted } = useTheme();
  const filter = useStandardsFilter(standards as Standard[]);

  return (
    <div className="min-h-screen">
      <Header isDark={isDark} toggleTheme={toggle} mounted={mounted} />

      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <Hero />

        <div className="-mt-12 space-y-6">
          <Dashboard
            impactCounts={filter.impactCounts}
            selectedImpacts={filter.selectedImpacts}
            toggleImpact={filter.toggleImpact}
            allCategories={filter.allCategories}
            categoryCounts={filter.categoryCounts}
            selectedCategories={filter.selectedCategories}
            toggleCategory={filter.toggleCategory}
            filteredCount={filter.filteredStandards.length}
            totalVisible={filter.totalVisible}
            newStandardsCount={filter.newStandardsCount}
            hasActiveFilters={filter.hasActiveFilters}
            showNewOnly={filter.showNewOnly}
            setShowNewOnly={filter.setShowNewOnly}
          />

          <FilterBar
            searchQuery={filter.searchQuery}
            setSearchQuery={filter.setSearchQuery}
            allTags={filter.allTags}
            selectedTags={filter.selectedTags}
            toggleTag={filter.toggleTag}
            allRecommendedBy={filter.allRecommendedBy}
            selectedRecommendedBy={filter.selectedRecommendedBy}
            toggleRecommendedBy={filter.toggleRecommendedBy}
            showDeprecated={filter.showDeprecated}
            setShowDeprecated={filter.setShowDeprecated}
            viewMode={filter.viewMode}
            setViewMode={filter.setViewMode}
          />

          <StandardsList
            standards={filter.filteredStandards}
            viewMode={filter.viewMode}
          />
        </div>
      </main>
    </div>
  );
}
