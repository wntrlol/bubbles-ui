"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Megaphone, Sparkles, Wrench } from "lucide-react";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  kind: "changelog" | "notice" | "maintenance";
  created_at: string;
}

const SEEN_KEY = "zenox.notifications.seen";
const KIND_ICON = { changelog: Sparkles, notice: Megaphone, maintenance: Wrench } as const;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(SEEN_KEY));
    } catch {
      // Private mode can throw on access; unread state simply degrades to "all new".
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;
    supabase
      .from("notifications")
      .select("id, title, body, kind, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled && data) setItems(data as Notification[]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const unread = items.filter((n) => !lastSeen || n.created_at > lastSeen).length;

  const openPanel = () => {
    setOpen((wasOpen) => {
      if (!wasOpen && items[0]) {
        // Mark everything currently listed as seen the moment the panel opens.
        try {
          localStorage.setItem(SEEN_KEY, items[0].created_at);
        } catch {
          // Ignore: unread state is a convenience, not correctness.
        }
        setLastSeen(items[0].created_at);
      }
      return !wasOpen;
    });
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={openPanel}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        <Bell className="size-4.5" />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-4 text-on-primary"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 max-h-96 w-80 overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-black/90 p-2 backdrop-blur-[40px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
          <p className="px-3 py-2 text-label-sm uppercase tracking-[0.14em] text-white/45">
            Notifications
          </p>

          {!isSupabaseConfigured ? (
            <p className="px-3 pb-3 text-label-sm leading-relaxed text-white/55">
              Connect Supabase to receive changelogs and notices. Until then there is nothing to
              show.
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 pb-3 text-label-sm text-white/55">You are all caught up.</p>
          ) : (
            <ul>
              {items.map((item) => {
                const Icon = KIND_ICON[item.kind] ?? Megaphone;
                return (
                  <li key={item.id} className="rounded-xl px-3 py-2.5 hover:bg-white/[0.05]">
                    <div className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-label-md text-white">{item.title}</p>
                        {item.body && (
                          <p className="mt-0.5 text-label-sm leading-relaxed text-white/60">
                            {item.body}
                          </p>
                        )}
                        <time
                          dateTime={item.created_at}
                          className="mt-1 block text-label-sm text-white/35"
                        >
                          {new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                          }).format(new Date(item.created_at))}
                        </time>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
