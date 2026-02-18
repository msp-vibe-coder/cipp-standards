"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}

export default function FilterDropdown({
  label,
  icon,
  options,
  selected,
  onToggle,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const hasSelection = selected.size > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          hasSelection
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-border bg-surface text-text-secondary hover:border-brand-primary"
        }`}
      >
        {icon}
        <span>{label}</span>
        {hasSelection && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
            {selected.size}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-1 w-72 rounded-lg border border-border bg-surface shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full rounded-md border border-border bg-surface-secondary py-1.5 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="custom-scrollbar max-h-60 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-text-tertiary">
                No matches found
              </p>
            ) : (
              filtered.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-secondary"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(option)}
                    onChange={() => onToggle(option)}
                    className="h-3.5 w-3.5 rounded border-border accent-brand-primary"
                  />
                  <span className="truncate text-text-primary">{option}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
