"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import MediaDrawer from "@/components/overlay/MediaDrawer";
import SearchModal from "@/components/overlay/SearchModal";
import SettingsModal from "@/components/overlay/SettingsModal";
import type { MediaType } from "@/lib/types";

interface ActiveMedia {
  type: MediaType;
  id: number | string;
}

interface OverlayApi {
  openSettings: () => void;
  openSearch: () => void;
  openMedia: (type: MediaType, id: number | string) => void;
  close: () => void;
}

const OverlayContext = createContext<OverlayApi | null>(null);

export function useOverlay(): OverlayApi {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside <OverlayProvider>");
  return ctx;
}

const SETTINGS_PARAM = "settings";
const SEARCH_PARAM = "search";
const MEDIA_PARAM = "media";

function parseMediaParam(val: string | null): ActiveMedia | null {
  if (!val) return null;
  if (val.startsWith("series-")) {
    return { type: "tv", id: val.replace("series-", "") };
  }
  if (val.startsWith("tv-")) {
    return { type: "tv", id: val.replace("tv-", "") };
  }
  if (val.startsWith("movie-")) {
    return { type: "movie", id: val.replace("movie-", "") };
  }
  const parts = val.split(/[:-]/);
  if (parts.length >= 2 && (parts[0] === "movie" || parts[0] === "tv")) {
    return { type: parts[0] as MediaType, id: parts.slice(1).join("-") };
  }
  return null;
}

function writeUrl(param: string, value: string | null, mode: "push" | "replace") {
  const params = new URLSearchParams(window.location.search);
  if (value !== null) {
    // Clear other overlay params when opening one
    params.delete(SETTINGS_PARAM);
    params.delete(SEARCH_PARAM);
    params.delete(MEDIA_PARAM);
    params.set(param, value);
  } else {
    params.delete(param);
  }

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);
  const pushedRef = useRef(false);

  // Restore from the URL on first paint
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSettingsOpen(params.has(SETTINGS_PARAM));
    setSearchOpen(params.has(SEARCH_PARAM));
    setActiveMedia(parseMediaParam(params.get(MEDIA_PARAM)));
  }, []);

  // Back and Forward move through overlay state
  useEffect(() => {
    const onPopState = () => {
      pushedRef.current = false;
      const params = new URLSearchParams(window.location.search);
      setSettingsOpen(params.has(SETTINGS_PARAM));
      setSearchOpen(params.has(SEARCH_PARAM));
      setActiveMedia(parseMediaParam(params.get(MEDIA_PARAM)));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const close = useCallback(() => {
    const wasOpen = settingsOpen || searchOpen || activeMedia !== null;
    setSettingsOpen(false);
    setSearchOpen(false);
    setActiveMedia(null);
    pushedRef.current = false;
    if (wasOpen) {
      const params = new URLSearchParams(window.location.search);
      params.delete(SETTINGS_PARAM);
      params.delete(SEARCH_PARAM);
      params.delete(MEDIA_PARAM);
      const query = params.toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.replaceState(null, "", url);
    }
  }, [settingsOpen, searchOpen, activeMedia]);

  const api = useMemo<OverlayApi>(
    () => ({
      openSettings: () => {
        setActiveMedia(null);
        setSearchOpen(false);
        setSettingsOpen(true);
        writeUrl(SETTINGS_PARAM, "1", "push");
        pushedRef.current = true;
      },
      openSearch: () => {
        setActiveMedia(null);
        setSettingsOpen(false);
        setSearchOpen(true);
        writeUrl(SEARCH_PARAM, "1", "push");
        pushedRef.current = true;
      },
      openMedia: (type: MediaType, id: number | string) => {
        setSettingsOpen(false);
        setSearchOpen(false);
        setActiveMedia({ type, id });
        const mediaSlug = type === "tv" ? `series-${id}` : `movie-${id}`;
        writeUrl(MEDIA_PARAM, mediaSlug, "push");
        pushedRef.current = true;
      },
      close,
    }),
    [close],
  );

  return (
    <OverlayContext.Provider value={api}>
      <div className="flex min-h-dvh flex-col">
        {children}
      </div>
      <SettingsModal open={settingsOpen} onClose={close} />
      <SearchModal open={searchOpen} onClose={close} />
      <AnimatePresence>
        {activeMedia && (
          <MediaDrawer
            media={activeMedia}
            onClose={close}
            onSelectMedia={(type, id) => api.openMedia(type, id)}
          />
        )}
      </AnimatePresence>
    </OverlayContext.Provider>
  );
}
