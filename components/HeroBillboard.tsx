"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Play, Star } from "lucide-react";

import PosterArt from "@/components/PosterArt";
import { useAmbient } from "@/lib/ambient";
import { useIsInWatchlist, useLibraryStore } from "@/lib/store/useLibraryStore";
import { useHydrated } from "@/lib/store/usePlayerStore";
import type { MediaSummary } from "@/lib/types";
import { cn, formatRuntime, hueFromSeed, rating, truncate, yearOf } from "@/lib/utils";

interface HeroBillboardProps {
  items: MediaSummary[];
  /** Runtime in minutes, when the caller has detail-level data for the lead title. */
  leadRuntime?: number | null;
}

/**
 * The billboard carries the page's headline and primary CTA, so none of it is
 * gated behind an entrance animation. A staggered reveal holds delayed elements
 * at their hidden state, which means a stalled animation clock can paint the
 * title while leaving the buttons invisible. Motion here lives in the backdrop
 * fade and the ambient tint instead, neither of which can hide content.
 */
export default function HeroBillboard({ items, leadRuntime }: HeroBillboardProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hydrated = useHydrated();
  const toggleWatchlist = useLibraryStore((s) => s.toggleWatchlist);

  // Auto-advance every 15 seconds, pausing when user hovers or interacts
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const count = Math.min(items.length, 5);
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 15000);
    return () => clearInterval(timer);
  }, [index, isPaused, items.length]);

  const featured = items[index];
  const saved = useIsInWatchlist(featured?.id ?? 0, featured?.mediaType ?? "movie");

  // Spill the artwork's hue into the page canvas.
  useAmbient(featured ? hueFromSeed(featured.title) : null);

  if (!featured) return null;

  const year = yearOf(featured.releaseDate);
  const releaseYearNum = year ? parseInt(year, 10) : 0;
  // Recent high-definition productions are labeled 4K, earlier/standard titles are labeled HD
  const is4K = releaseYearNum >= 2021;
  const score = rating(featured.voteAverage);
  const runtime = index === 0 ? formatRuntime(leadRuntime) : null;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[82vh] w-full overflow-hidden lg:min-h-[88vh]"
    >
      {/*
        Artwork and its scrims share one masked layer, so they fade out together
        and the page's own background carries on underneath. Covering the bottom
        with an opaque colour instead would paint over the ambient backdrop and
        leave a hard edge where the section ends.
      */}
      <div aria-hidden className="hero-visual absolute inset-0">
        {/* Keyed so switching titles replays the fade rather than cutting. */}
        <div key={featured.id} className="absolute inset-0 hero-fade">
          <PosterArt
            path={featured.backdropPath}
            title={featured.title}
            variant="backdrop"
            imageSize="original"
            sizes="100vw"
            priority
            showLabel={false}
            className="object-cover object-top sm:object-center"
          />
        </div>

        {/* Darkening only, never reaching opaque: the mask owns the fade out. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 10%, rgba(0,0,0,0.5) 34%, "
              + "rgba(0,0,0,0.18) 58%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 42%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative flex min-h-[82vh] w-full flex-col justify-end px-8 pb-20 pt-24 sm:px-12 lg:min-h-[88vh] lg:px-16 lg:pb-24">
        <div key={featured.id} className="max-w-xl">
          <h1 className="text-display text-white">
            {featured.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {is4K ? (
              <span className="rounded bg-white/15 px-2 py-0.5 text-label-sm font-semibold text-white">
                4K
              </span>
            ) : (
              <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-label-sm font-semibold text-white/90">
                HD
              </span>
            )}
            {year && <Meta>{year}</Meta>}
            {score && (
              <Meta>
                <Star className="size-3.5 fill-white text-white" />
                {score}
              </Meta>
            )}
            {runtime && <Meta>{runtime}</Meta>}
            <Meta>{featured.mediaType === "movie" ? "Film" : "Series"}</Meta>
          </div>

          {featured.overview && (
            <p className="mt-5 max-w-lg text-body-lg leading-relaxed text-white/65">
              {truncate(featured.overview, 165)}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/watch/${featured.mediaType}/${featured.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-label-md font-semibold text-on-primary transition-[background-color,transform] duration-200 hover:bg-primary-hover active:scale-[0.98]"
            >
              <Play className="size-4.5 fill-current" />
              Watch Now
            </Link>

            <button
              type="button"
              onClick={() => toggleWatchlist(featured)}
              aria-pressed={hydrated ? saved : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-label-md text-white backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white/20 active:scale-[0.98]"
            >
              {hydrated && saved ? (
                <>
                  <BookmarkCheck className="size-4.5 text-primary" />
                  In My List
                </>
              ) : (
                <>
                  <Bookmark className="size-4.5" />
                  Watchlist
                </>
              )}
            </button>
          </div>
        </div>

        {items.length > 1 && (
          <div className="mt-10 flex items-center gap-2" role="tablist" aria-label="Featured titles">
            {items.slice(0, 5).map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={i === index}
                aria-label={item.title}
                onClick={() => setIndex(i)}
                className="group/dot py-2"
              >
                <span
                  className={cn(
                    "block h-[3px] rounded-full transition-[width,background-color] duration-500",
                    i === index ? "w-12 bg-primary" : "w-6 bg-white/30 group-hover/dot:bg-white/60",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-label-sm text-white/80 backdrop-blur-sm">
      {children}
    </span>
  );
}
