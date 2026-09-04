"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Viewer preferences. Every entry here is read by real UI somewhere. If a
 * control cannot change behaviour, it does not belong in this store.
 */

export type AccentId = "mint" | "amber" | "cyan" | "rose";

/**
 * "system" follows the OS `prefers-reduced-motion` setting. The other two
 * override it in either direction, so a viewer is never locked out of
 * animation by an OS toggle they set for a different reason.
 */
export type MotionPreference = "system" | "full" | "reduced";

export interface Accent {
  id: AccentId;
  label: string;
  base: string;
  hover: string;
}

/** Each accent is light enough to carry black label text at WCAG AA. */
export const ACCENTS: Accent[] = [
  { id: "mint", label: "Zenox", base: "#4fe3b0", hover: "#9df2d4" },
  { id: "amber", label: "Projector", base: "#ffb340", hover: "#ffd08a" },
  { id: "cyan", label: "Cold Open", base: "#4fd6ff", hover: "#a5e9ff" },
  { id: "rose", label: "Late Show", base: "#ff6b8a", hover: "#ffb0c0" },
];

export const SUBTITLE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
] as const;

interface SettingsState {
  // Appearance
  accent: AccentId;
  cardTitles: "hover" | "always";
  episodeView: "carousel" | "grid";
  motion: MotionPreference;

  // Playback
  autoplayNext: boolean;
  resumePlayback: boolean;
  defaultVolume: number;

  // Subtitles
  subtitlesEnabled: boolean;
  subtitleLanguage: string;
  subtitleSize: "sm" | "md" | "lg";

  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  reset: () => void;
}

const DEFAULTS = {
  accent: "mint" as AccentId,
  cardTitles: "hover" as const,
  episodeView: "carousel" as const,
  motion: "system" as MotionPreference,
  autoplayNext: true,
  resumePlayback: true,
  defaultVolume: 0.8,
  subtitlesEnabled: false,
  subtitleLanguage: "en",
  subtitleSize: "md" as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "zenox.settings.v1",
      version: 3,
      // v1 stored a `reduceMotion` boolean, which could only ever add reduction
      // on top of the OS setting. Carry a saved `true` across as an explicit
      // "reduced"; anything else falls back to following the system.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SettingsState> & { reduceMotion?: boolean };
        let next = state;
        if (version < 2) {
          const { reduceMotion, ...rest } = next;
          next = { ...rest, motion: reduceMotion ? "reduced" : "system" };
        }
        // v3 retired the "lime" accent, which was lifted from another site.
        if ((next as { accent?: string }).accent === "lime") {
          next = { ...next, accent: "mint" as AccentId };
        }
        return next as SettingsState;
      },
    },
  ),
);

export function accentById(id: AccentId): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}
