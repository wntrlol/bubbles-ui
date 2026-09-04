"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import Link from "next/link";

import PosterArt from "@/components/PosterArt";
import type { MediaSummary } from "@/lib/types";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { cn, rating, yearOf } from "@/lib/utils";

interface TopTenRailProps {
  movies: MediaSummary[];
  shows: MediaSummary[];
}

/**
 * Ranked rail. The numeral is the graphic: an outlined figure sitting behind
 * and beside each poster, so position reads before the artwork does.
 */
export default function TopTenRail({ movies, shows }: TopTenRailProps) {
  const [mode, setMode] = useState<"movie" | "tv">("movie");
  const [edges, setEdges] = useState({ start: true, end: false });
  const railRef = useRevealOnView<HTMLUListElement>();

  const items = (mode === "movie" ? movies : shows).slice(0, 10);

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
  }, [measure, railRef, mode]);

  const scrollBy = (direction: 1 | -1) => {
    railRef.current?.scrollBy({
      left: direction * Math.round((railRef.current.clientWidth ?? 0) * 0.85),
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="relative py-8">
      <div className="mx-auto mb-5 flex max-w-page flex-wrap items-end justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-end gap-3">
          <h2 className="top-ten-title">TOP 10</h2>
          <p className="mb-1.5 max-w-[7rem] text-label-sm uppercase leading-tight tracking-[0.18em] text-white/45">
            Content today
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Top 10 media type"
            className="flex items-center gap-0.5 rounded-full border border-white/12 bg-white/[0.06] p-0.5"
          >
            {(["movie", "tv"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-label-sm transition-colors duration-200",
                  mode === value ? "bg-white text-black" : "text-white/60 hover:text-white",
                )}
              >
                {value === "movie" ? "Movies" : "Shows"}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-1.5 md:flex">
            <RailButton dir="left" disabled={edges.start} onClick={() => scrollBy(-1)} />
            <RailButton dir="right" disabled={edges.end} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      <ul
        ref={railRef}
        onScroll={measure}
        className="rail rail-hide mx-auto flex max-w-page snap-x gap-2 overflow-x-auto px-4 pb-3 sm:gap-4 sm:px-6"
      >
        {/* Matches the catalog rails, and gives the first numeral room to breathe. */}
        <li aria-hidden className="w-2 shrink-0 sm:w-6 lg:w-10" />

        {items.map((media, i) => (
          <li
            key={`${media.mediaType}-${media.id}`}
            style={{ "--reveal-index": Math.min(i, 9) } as React.CSSProperties}
            className="flex shrink-0 snap-start items-end"
          >
            <span aria-hidden className="top-ten-numeral">
              {i + 1}
            </span>

            <Link
              href={`/watch/${media.mediaType}/${media.id}`}
              className="group -ml-6 block w-[42vw] min-w-[145px] max-w-[215px] sm:-ml-9 sm:w-[28vw] md:w-[20vw] lg:w-[15vw] xl:w-[12.8vw] 2xl:w-[11.2vw]"
            >
              <span className="relative block aspect-2/3 overflow-hidden rounded-xl border border-white/10 transition-transform duration-300 group-hover:-translate-y-1.5">
                <PosterArt
                  path={media.posterPath}
                  title={media.title}
                  sizes="(min-width: 1280px) 215px, (min-width: 768px) 20vw, 42vw"
                  priority={i < 4}
                />
              </span>
              <span className="mt-2 block truncate text-label-md text-white">{media.title}</span>
              <span className="mt-0.5 flex items-center gap-2 text-label-sm text-white/50">
                {rating(media.voteAverage) && (
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-primary text-primary" />
                    <span className="tabular-nums">{rating(media.voteAverage)}</span>
                  </span>
                )}
                {yearOf(media.releaseDate) && (
                  <span className="tabular-nums">{yearOf(media.releaseDate)}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RailButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Scroll Top 10 ${dir === "left" ? "backward" : "forward"}`}
      className="grid size-9 place-items-center rounded-full border border-white/12 bg-white/5 text-white transition-[background-color,border-color,transform] duration-200 hover:border-white/25 hover:bg-white/12 active:scale-95 disabled:pointer-events-none disabled:opacity-25"
    >
      <Icon className="size-4.5" />
    </button>
  );
}
