"use client";

import Link from "next/link";
import { useState } from "react";
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
  const hydrated = useHydrated();
  const toggleWatchlist = useLibraryStore((s) => s.toggleWatchlist);

  const featured = items[index];
  const saved = useIsInWatchlist(featured?.id ?? 0, featured?.mediaType ?? "movie");

  // Spill the artwork's hue into the page canvas.
  useAmbient(featured ? hueFromSeed(featured.title) : null);

  if (!featured) return null;

  const year = yearOf(featured.releaseDate);
  const score = rating(featured.voteAverage);
  const runtime = index === 0 ? formatRuntime(leadRuntime) : null;

  return (
    <section className="relative min-h-[84vh] w-full overflow-hidden lg:min-h-[90vh]">
      {/* Keyed so switching titles replays the fade rather than cutting. */}
      <div key={featured.id} className="absolute inset-0 hero-fade">
        <PosterArt
          path={featured.backdropPath}
          title={featured.title}
          variant="still"
          sizes="100vw"
          priority
          showLabel={false}
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #04120b 12%, rgba(4,18,11,0.45) 55%, rgba(4,18,11,0.15) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(4,18,11,0.94) 0%, rgba(4,18,11,0.5) 48%, transparent 82%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[84vh] max-w-page flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:min-h-[90vh] lg:pb-20">
        <div key={featured.id} className="max-w-xl">
          <h1 className="text-display text-white">
            {featured.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded bg-badge-4k px-1.5 py-0.5 text-label-sm font-semibold text-white">
              4K
            </span>
            {year && <Meta>{year}</Meta>}
            {score && (
              <Meta>
                <Star className="size-3.5 fill-primary text-primary" />
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
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-label-md text-white backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white/18 active:scale-[0.98]"
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
                    i === index ? "w-12 bg-primary" : "w-6 bg-white/25 group-hover/dot:bg-white/50",
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
