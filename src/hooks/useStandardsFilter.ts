"use client";

import { useMemo, useState, useCallback } from "react";
import type { Standard } from "@/types/standards";
import { isWithinDays } from "@/lib/utils";
import { config } from "@/lib/config";

export type ViewMode = "card" | "table";

export function useStandardsFilter(standards: Standard[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImpacts, setSelectedImpacts] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedRecommendedBy, setSelectedRecommendedBy] = useState<Set<string>>(new Set());
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const isDeprecated = useCallback((s: Standard): boolean => {
    const text = `${s.label} ${s.helpText}`.toLowerCase();
    return text.includes("deprecated");
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    standards.forEach((s) => s.tag?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [standards]);

  const allRecommendedBy = useMemo(() => {
    const recs = new Set<string>();
    standards.forEach((s) => s.recommendedBy?.forEach((r) => recs.add(r)));
    return [...recs].sort();
  }, [standards]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    standards.forEach((s) => {
      if (s.cat) cats.add(s.cat);
    });
    return [...cats].sort();
  }, [standards]);

  const filteredStandards = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return standards
      .filter((s) => {
        // Deprecated filter
        if (!showDeprecated && isDeprecated(s)) return false;

        // Search
        if (query) {
          const searchable = `${s.label} ${s.helpText} ${s.executiveText} ${s.docsDescription}`.toLowerCase();
          if (!searchable.includes(query)) return false;
        }

        // Impact filter
        if (selectedImpacts.size > 0 && !selectedImpacts.has(s.impact)) return false;

        // Category filter
        if (selectedCategories.size > 0 && !selectedCategories.has(s.cat)) return false;

        // Tags filter
        if (selectedTags.size > 0) {
          if (!s.tag?.some((t) => selectedTags.has(t))) return false;
        }

        // Recommended By filter
        if (selectedRecommendedBy.size > 0) {
          if (!s.recommendedBy?.some((r) => selectedRecommendedBy.has(r))) return false;
        }

        // New only
        if (showNewOnly && !isWithinDays(s.addedDate, config.newStandardsDays)) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by addedDate descending (newest first)
        if (!a.addedDate && !b.addedDate) return 0;
        if (!a.addedDate) return 1;
        if (!b.addedDate) return -1;
        return b.addedDate.localeCompare(a.addedDate);
      });
  }, [
    standards,
    searchQuery,
    selectedImpacts,
    selectedCategories,
    selectedTags,
    selectedRecommendedBy,
    showDeprecated,
    showNewOnly,
    isDeprecated,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    standards.forEach((s) => {
      if (!showDeprecated && isDeprecated(s)) return;
      counts[s.cat] = (counts[s.cat] || 0) + 1;
    });
    return counts;
  }, [standards, showDeprecated, isDeprecated]);

  const impactCounts = useMemo(() => {
    const counts: Record<string, number> = { "High Impact": 0, "Medium Impact": 0, "Low Impact": 0 };
    standards.forEach((s) => {
      if (!showDeprecated && isDeprecated(s)) return;
      if (selectedCategories.size > 0 && !selectedCategories.has(s.cat)) return;
      if (s.impact && counts[s.impact] !== undefined) {
        counts[s.impact]++;
      }
    });
    return counts;
  }, [standards, selectedCategories, showDeprecated, isDeprecated]);

  const newStandardsCount = useMemo(() => {
    return filteredStandards.filter((s) =>
      isWithinDays(s.addedDate, config.newStandardsDays)
    ).length;
  }, [filteredStandards, isWithinDays]);

  const totalVisible = useMemo(() => {
    return standards.filter((s) => showDeprecated || !isDeprecated(s)).length;
  }, [standards, showDeprecated, isDeprecated]);

  const toggleImpact = useCallback((impact: string) => {
    setSelectedImpacts((prev) => {
      const next = new Set(prev);
      if (next.has(impact)) next.delete(impact);
      else next.add(impact);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (category === "") return new Set();
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const toggleRecommendedBy = useCallback((rec: string) => {
    setSelectedRecommendedBy((prev) => {
      const next = new Set(prev);
      if (next.has(rec)) next.delete(rec);
      else next.add(rec);
      return next;
    });
  }, []);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedImpacts.size > 0 ||
    selectedCategories.size > 0 ||
    selectedTags.size > 0 ||
    selectedRecommendedBy.size > 0 ||
    showNewOnly;

  return {
    searchQuery,
    setSearchQuery,
    selectedImpacts,
    toggleImpact,
    selectedCategories,
    toggleCategory,
    selectedTags,
    toggleTag,
    selectedRecommendedBy,
    toggleRecommendedBy,
    showDeprecated,
    setShowDeprecated,
    showNewOnly,
    setShowNewOnly,
    viewMode,
    setViewMode,
    filteredStandards,
    categoryCounts,
    impactCounts,
    newStandardsCount,
    totalVisible,
    allTags,
    allRecommendedBy,
    allCategories,
    hasActiveFilters,
  };
}
