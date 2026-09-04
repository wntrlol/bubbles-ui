"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Viewer preferences. Every entry here is read by real UI somewhere. If a
 * control cannot change behaviour, it does not belong in this store.
 */

export type AccentId = "lime" | "amber" | "cyan" | "rose";

export interface Accent {
  id: AccentId;
  label: string;
  base: string;
  hover: string;
}

/** Each accent is light enough to carry black label text at WCAG AA. */
export const ACCENTS: Accent[] = [
  { id: "lime", label: "Marquee", base: "#95ff50", hover: "#c9ffab" },
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
  reduceMotion: boolean;

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
  accent: "lime" as AccentId,
  cardTitles: "hover" as const,
  episodeView: "carousel" as const,
  reduceMotion: false,
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
    { name: "nexa.settings.v1" },
  ),
);

export function accentById(id: AccentId): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}
