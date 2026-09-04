"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Captions, MonitorPlay, Palette, Server, UserRound } from "lucide-react";

import Modal from "@/components/overlay/Modal";
import {
  AppearancePanel,
  PlaybackPanel,
  ProfilePanel,
  ServersPanel,
  SubtitlesPanel,
} from "@/components/settings/panels";
import type { StreamProviderConfig } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { useAppReducedMotion } from "@/lib/useMotionPreference";

const TABS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "playback", label: "Playback", icon: MonitorPlay },
  { id: "servers", label: "Servers", icon: Server },
  { id: "subtitles", label: "Subtitles", icon: Captions },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("profile");
  const [servers, setServers] = useState<StreamProviderConfig[]>([]);
  const reduce = useAppReducedMotion();

  // Server identity comes from the environment, so it is fetched, not bundled.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/servers")
      .then((res) => res.json() as Promise<{ servers: StreamProviderConfig[] }>)
      .then((data) => {
        if (!cancelled) setServers(data.servers ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} label="Settings" size="lg">
      <div className="px-5 pb-7 pt-6 sm:px-7">
        <h2 className="text-headline-md text-white">Settings</h2>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="rail rail-hide mt-5 flex gap-1 overflow-x-auto border-b border-white/10 pb-px"
        >
          {TABS.map((item) => {
            const active = item.id === tab;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                role="tab"
                id={`settings-tab-${item.id}`}
                aria-selected={active}
                aria-controls={`settings-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-label-md transition-colors duration-200",
                  active ? "text-white" : "text-white/60 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="settings-modal-tab"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={
                      reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Keyed so switching tabs replays the entrance; CSS so a dropped frame
            can never leave a panel hidden. */}
        <div
          key={tab}
          id={`settings-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${tab}`}
          data-reveal="shown"
          className="mt-6"
        >
          {tab === "profile" && <ProfilePanel />}
          {tab === "appearance" && <AppearancePanel />}
          {tab === "playback" && <PlaybackPanel />}
          {tab === "servers" && <ServersPanel providers={servers} />}
          {tab === "subtitles" && <SubtitlesPanel />}
        </div>
      </div>
    </Modal>
  );
}
