"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { tmdbImage } from "@/lib/tmdb-image";
import { useRevealOnView } from "@/lib/useRevealOnView";
import type { WatchProvider } from "@/lib/types";
import { cn, posterGradient } from "@/lib/utils";

interface ProviderRailProps {
  providers: WatchProvider[];
  /** Catalog route the tiles filter into. */
  basePath?: string;
}

export default function ProviderRail({ providers, basePath = "/movies" }: ProviderRailProps) {
  const railRef = useRevealOnView<HTMLUListElement>();
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setEdges({
      start: el.scrollLeft <= 8,
      end: maxScroll <= 8 || el.scrollLeft >= maxScroll - 8,
    });
  }, [railRef]);

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, railRef, providers.length]);

  const scrollBy = (direction: 1 | -1) => {
    railRef.current?.scrollBy({
      left: direction * Math.round((railRef.current.clientWidth ?? 0) * 0.8),
      behavior: "smooth",
    });
  };

  if (!providers.length) return null;

  return (
    <section className="relative py-6">
      <div className="mx-auto mb-4 flex max-w-page items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="text-headline-md text-white">Browse by Provider</h2>
        <div className="hidden items-center gap-1.5 md:flex">
          <RailButton
            direction="left"
            disabled={edges.start}
            onClick={() => scrollBy(-1)}
            label="Scroll providers backward"
          />
          <RailButton
            direction="right"
            disabled={edges.end}
            onClick={() => scrollBy(1)}
            label="Scroll providers forward"
          />
        </div>
      </div>

      <div className="relative">
        <ul
          ref={railRef}
          onScroll={measure}
          className="rail rail-hide mx-auto flex max-w-page gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
        >
          {providers.map((provider, i) => (
            <li
              key={provider.id}
              style={{ "--reveal-index": Math.min(i, 11) } as React.CSSProperties}
              className="w-[76px] shrink-0 sm:w-[84px]"
            >
              <Link
                href={`${basePath}?provider=${provider.id}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={cn(
                    "relative grid size-[68px] place-items-center overflow-hidden rounded-2xl",
                    "border border-white/10 transition-[transform,border-color,box-shadow] duration-300 sm:size-[72px]",
                    "group-hover:-translate-y-1 group-hover:border-white/25",
                    "group-hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.8)]",
                  )}
                >
                  <ProviderTile provider={provider} />
                </span>
                <span className="line-clamp-2 text-label-sm leading-tight text-white/55 transition-colors group-hover:text-white">
                  {provider.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-canvas to-transparent transition-opacity duration-300",
            edges.start && "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300",
            edges.end && "opacity-0",
          )}
        />
      </div>
    </section>
  );
}

/**
 * Real provider marks come from TMDB. When there is no logo, a monogram plate
 * stands in. Brand logos are never redrawn by hand.
 */
function ProviderTile({ provider }: { provider: WatchProvider }) {
  const src = tmdbImage(provider.logoPath, "w185");

  if (src) {
    return <Image src={src} alt="" fill sizes="72px" className="object-cover" />;
  }

  const { from, to } = posterGradient(provider.name);
  const monogram = provider.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="absolute inset-0 grid place-items-center"
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white/85">
        {monogram}
      </span>
    </span>
  );
}

function RailButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-white/12 bg-white/5 text-white",
        "transition-[background-color,border-color,transform] duration-200 hover:border-white/25 hover:bg-white/12",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-25",
      )}
    >
      <Icon className="size-4.5" />
    </button>
  );
}
