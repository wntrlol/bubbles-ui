"use client";

import { useEffect } from "react";

import { accentById, useSettingsStore } from "@/lib/store/useSettingsStore";

/**
 * Pushes viewer preferences onto the document root so plain CSS can react to
 * them. Keeping this in one place means components read tokens, not settings.
 */
export default function SettingsBridge() {
  const accent = useSettingsStore((s) => s.accent);
  const motion = useSettingsStore((s) => s.motion);

  useEffect(() => {
    const { base, hover } = accentById(accent);
    const root = document.documentElement;
    root.style.setProperty("--color-primary", base);
    root.style.setProperty("--color-primary-hover", hover);
  }, [accent]);

  useEffect(() => {
    // CSS keys off this to override the OS preference in either direction.
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  return null;
}
