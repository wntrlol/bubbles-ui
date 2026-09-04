"use client";

import { useEffect, useMemo, useState } from "react";

import MediaRow from "@/components/MediaRow";
import { useLibraryStore } from "@/lib/store/useLibraryStore";
import { useHydrated } from "@/lib/store/usePlayerStore";
import type { MediaSummary } from "@/lib/types";

/**
 * Taste model. Recency-weighted genre affinity built from what the viewer has
 * actually watched, with the watchlist counting for less because saving a title
 * is a weaker signal than finishing one.
 *
 * Runs on the client because history is local; the blend itself happens on the
 * server, where the TMDB key lives.
 */
const HALF_LIFE_DAYS = 30;
const WATCHLIST_WEIGHT = 0.4;

export default function ForYouRail() {
  const hydrated = useHydrated();
  const history = useLibraryStore((s) => s.history);
  const watchlist = useLibraryStore((s) => s.watchlist);
  const [items, setItems] = useState<MediaSummary[]>([]);

  const { weights, exclude } = useMemo(() => {
    const weights: Record<string, number> = {};
    const now = Date.now();

    const add = (genreIds: number[], strength: number, at: number) => {
      // Interest decays: what you watched last week says more than last year.
      const ageDays = Math.max(0, (now - at) / 86_400_000);
      const recency = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
      for (const id of genreIds ?? []) {
        weights[id] = (weights[id] ?? 0) + strength * recency;
      }
    };

    for (const entry of history) {
      // Finishing something counts for more than opening it.
      add(entry.genreIds ?? [], 0.5 + entry.progress, entry.watchedAt);
    }
    for (const entry of watchlist) {
      add(entry.genreIds ?? [], WATCHLIST_WEIGHT, entry.addedAt);
    }

    const exclude = [
      ...history.map((e) => `${e.mediaType}:${e.id}`),
      ...watchlist.map((e) => `${e.mediaType}:${e.id}`),
    ];

    return { weights, exclude };
  }, [history, watchlist]);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    fetch("/api/for-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights, exclude }),
    })
      .then((res) => res.json() as Promise<{ results: MediaSummary[] }>)
      .then((data) => {
        if (!cancelled) setItems(data.results ?? []);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [hydrated, weights, exclude]);

  if (!items.length) return null;

  const personalised = Object.keys(weights).length > 0;

  return (
    <MediaRow
      title={personalised ? "For You" : "Popular Right Now"}
      items={items}
      href="/trending"
    />
  );
}
