"use client";

import { useState, useEffect, useCallback } from "react";
import bundledStandards from "@/data/standards.json";
import type { Standard } from "@/types/standards";

const GITHUB_URL =
  "https://raw.githubusercontent.com/KelvinTegelaar/CIPP/main/src/data/standards.json";
const STORAGE_KEY = "cipp_standards_sync";

interface StoredSync {
  data: Standard[];
  syncedAt: string;
  newCount: number;
}

export interface SyncState {
  standards: Standard[];
  syncedAt: Date | null;
  newCount: number;
  isSyncing: boolean;
  syncError: string | null;
  sync: () => Promise<void>;
}

export function useSyncStandards(): SyncState {
  const [standards, setStandards] = useState<Standard[]>(
    bundledStandards as Standard[]
  );
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Restore cached sync from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredSync = JSON.parse(raw);
        setStandards(stored.data);
        setSyncedAt(new Date(stored.syncedAt));
        setNewCount(stored.newCount);
      }
    } catch {
      // Ignore parse/storage errors
    }
  }, []);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(GITHUB_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const fetched: Standard[] = await res.json();

      // Count items not present in the bundled build
      const bundledNames = new Set(
        (bundledStandards as Standard[]).map((s) => s.name)
      );
      const newItems = fetched.filter((s) => !bundledNames.has(s.name)).length;

      const now = new Date();
      const toStore: StoredSync = {
        data: fetched,
        syncedAt: now.toISOString(),
        newCount: newItems,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

      setStandards(fetched);
      setSyncedAt(now);
      setNewCount(newItems);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { standards, syncedAt, newCount, isSyncing, syncError, sync };
}
