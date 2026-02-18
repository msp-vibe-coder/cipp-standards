"use client";

import { config } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

export default function Header({ isDark, toggleTheme, mounted }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
        </div>
        <ThemeToggle isDark={isDark} toggle={toggleTheme} mounted={mounted} />
      </div>
    </header>
  );
}
