"use client";

import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
  mounted: boolean;
}

export default function ThemeToggle({ isDark, toggle, mounted }: ThemeToggleProps) {
  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 p-2.5 text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
