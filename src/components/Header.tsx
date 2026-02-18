"use client";

import ThemeToggle from "./ThemeToggle";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
  onSync: () => Promise<void>;
  syncedAt: Date | null;
  newCount: number;
  isSyncing: boolean;
  syncError: string | null;
}

function formatSyncTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Header({
  isDark,
  toggleTheme,
  mounted,
  onSync,
  syncedAt,
  newCount,
  isSyncing,
  syncError,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sync standards from CIPP GitHub"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-brand-primary/50 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={isSyncing ? "animate-spin" : ""}
            />
            <span>{isSyncing ? "Syncing…" : "Sync Standards"}</span>
          </button>

          <div className="hidden items-center gap-2 text-xs text-text-muted sm:flex">
            {syncError ? (
              <span className="text-red-500">{syncError}</span>
            ) : syncedAt ? (
              <>
                <span>Synced {formatSyncTime(syncedAt)}</span>
                {newCount > 0 && (
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-medium text-brand-primary">
                    +{newCount} new
                  </span>
                )}
              </>
            ) : (
              <span>Not yet synced</span>
            )}
          </div>
        </div>

        <ThemeToggle isDark={isDark} toggle={toggleTheme} mounted={mounted} />
      </div>
    </header>
  );
}
