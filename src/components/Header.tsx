"use client";

import Image from "next/image";
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
          <Image
            src="/logo.svg"
            alt={`${config.brandName} logo`}
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-text-primary">
              {config.brandName}
            </span>
            <span className="-mt-1 hidden text-xs text-brand-primary sm:block">
              {config.brandSubtitle}
            </span>
          </div>
        </div>
        <ThemeToggle isDark={isDark} toggle={toggleTheme} mounted={mounted} />
      </div>
    </header>
  );
}
