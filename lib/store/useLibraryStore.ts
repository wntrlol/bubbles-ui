"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaSummary, MediaType } from "../types";

export interface LibraryEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  addedAt: number;
}

export interface HistoryEntry extends LibraryEntry {
  /** 0–1. Anything at or above 0.92 counts as finished. */
  progress: number;
  positionSeconds: number;
  durationSeconds: number;
  season?: number;
  episode?: number;
  watchedAt: number;
}

interface LibraryState {
  watchlist: LibraryEntry[];
  history: HistoryEntry[];
  toggleWatchlist: (media: MediaSummary) => void;
  removeFromWatchlist: (id: number, mediaType: MediaType) => void;
  clearWatchlist: () => void;
  recordProgress: (
    media: MediaSummary,
    data: { positionSeconds: number; durationSeconds: number; season?: number; episode?: number },
  ) => void;
  removeFromHistory: (id: number, mediaType: MediaType) => void;
  clearHistory: () => void;
}

const keyOf = (id: number, mediaType: MediaType) => `${mediaType}:${id}`;

function toEntry(media: MediaSummary): LibraryEntry {
  return {
    id: media.id,
    mediaType: media.mediaType,
    title: media.title,
    posterPath: media.posterPath,
    backdropPath: media.backdropPath,
    releaseDate: media.releaseDate,
    voteAverage: media.voteAverage,
    addedAt: Date.now(),
  };
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      watchlist: [],
      history: [],

      toggleWatchlist: (media) =>
        set((state) => {
          const key = keyOf(media.id, media.mediaType);
          const exists = state.watchlist.some((e) => keyOf(e.id, e.mediaType) === key);
          return {
            watchlist: exists
              ? state.watchlist.filter((e) => keyOf(e.id, e.mediaType) !== key)
              : [toEntry(media), ...state.watchlist],
          };
        }),

      removeFromWatchlist: (id, mediaType) =>
        set((state) => ({
          watchlist: state.watchlist.filter((e) => keyOf(e.id, e.mediaType) !== keyOf(id, mediaType)),
        })),

      clearWatchlist: () => set({ watchlist: [] }),

      recordProgress: (media, data) =>
        set((state) => {
          const key = keyOf(media.id, media.mediaType);
          const progress =
            data.durationSeconds > 0
              ? Math.min(1, data.positionSeconds / data.durationSeconds)
              : 0;
          const entry: HistoryEntry = {
            ...toEntry(media),
            progress,
            positionSeconds: data.positionSeconds,
            durationSeconds: data.durationSeconds,
            season: data.season,
            episode: data.episode,
            watchedAt: Date.now(),
          };
          return {
            history: [entry, ...state.history.filter((e) => keyOf(e.id, e.mediaType) !== key)].slice(
              0,
              60,
            ),
          };
        }),

      removeFromHistory: (id, mediaType) =>
        set((state) => ({
          history: state.history.filter((e) => keyOf(e.id, e.mediaType) !== keyOf(id, mediaType)),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    { name: "nexa.library.v1" },
  ),
);

/** Selector helper — avoids re-rendering every card when the list changes. */
export function useIsInWatchlist(id: number, mediaType: MediaType): boolean {
  return useLibraryStore((s) =>
    s.watchlist.some((e) => e.id === id && e.mediaType === mediaType),
  );
}
