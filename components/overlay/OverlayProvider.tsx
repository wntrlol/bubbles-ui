"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import SettingsModal from "@/components/overlay/SettingsModal";

interface OverlayApi {
  openSettings: () => void;
  close: () => void;
}

const OverlayContext = createContext<OverlayApi | null>(null);

export function useOverlay(): OverlayApi {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside <OverlayProvider>");
  return ctx;
}

const PARAM = "settings";

const hasParam = (search: string) => new URLSearchParams(search).has(PARAM);

function writeUrl(open: boolean, mode: "push" | "replace") {
  const params = new URLSearchParams(window.location.search);
  if (open) params.set(PARAM, "1");
  else params.delete(PARAM);

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  // History is driven directly rather than through the router: pushing a param
  // through Next would re-run the page's server component just to open a
  // dialog. This keeps Back working without refetching the catalog.
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Whether *this* provider pushed the entry currently on screen. Landing on a
  // shared link did not, so closing there must not walk off the site.
  const pushedRef = useRef(false);

  // Restore from the URL on first paint, so a shared link opens settings.
  useEffect(() => {
    setSettingsOpen(hasParam(window.location.search));
  }, []);

  // Back and Forward move through overlay state like any other navigation.
  useEffect(() => {
    const onPopState = () => {
      pushedRef.current = false;
      setSettingsOpen(hasParam(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const close = useCallback(() => {
    setSettingsOpen(false);
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      writeUrl(false, "replace");
    }
  }, []);

  const api = useMemo<OverlayApi>(
    () => ({
      openSettings: () => {
        setSettingsOpen(true);
        writeUrl(true, "push");
        pushedRef.current = true;
      },
      close,
    }),
    [close],
  );

  return (
    <OverlayContext.Provider value={api}>
      {children}
      <SettingsModal open={settingsOpen} onClose={close} />
    </OverlayContext.Provider>
  );
}
