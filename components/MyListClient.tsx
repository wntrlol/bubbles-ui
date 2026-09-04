"use client";

import Link from "next/link";
import { Bookmark, History, Play, Trash2, X } from "lucide-react";

import PosterArt from "@/components/PosterArt";
import CatalogGrid from "@/components/CatalogGrid";
import {
  useLibraryStore,
  type HistoryEntry,
  type LibraryEntry,
} from "@/lib/store/useLibraryStore";
import { useHydrated } from "@/lib/store/usePlayerStore";
import type { MediaSummary } from "@/lib/types";
import { formatTimecode, yearOf } from "@/lib/utils";

function toSummary(entry: LibraryEntry): MediaSummary {
  return {
    id: entry.id,
    mediaType: entry.mediaType,
    title: entry.title,
    overview: "",
    posterPath: entry.posterPath,
    backdropPath: entry.backdropPath,
    releaseDate: entry.releaseDate,
    voteAverage: entry.voteAverage,
    genreIds: [],
  };
}

export default function MyListClient() {
  const hydrated = useHydrated();
  const watchlist = useLibraryStore((s) => s.watchlist);
  const history = useLibraryStore((s) => s.history);
  const clearWatchlist = useLibraryStore((s) => s.clearWatchlist);
  const clearHistory = useLibraryStore((s) => s.clearHistory);

  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <header className="mb-8">
        <h1 className="text-headline-lg text-white">My List</h1>
        <p className="mt-2 max-w-2xl text-body-md text-muted">
          Saved titles and playback progress, stored locally in this browser.
        </p>
      </header>

      <section id="history" className="mb-14 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2.5 text-headline-md text-white">
            <History className="size-5 text-secondary" />
            Continue Watching
          </h2>
          {hydrated && history.length > 0 && (
            <ClearButton onClick={clearHistory} label="Clear history" />
          )}
        </div>

        {!hydrated ? (
          <RowSkeleton />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<History className="size-6" />}
            title="Nothing in progress"
            body="Titles you start appear here with a resume point."
            cta={{ href: "/movies", label: "Browse movies" }}
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((entry) => (
              <HistoryCard key={`${entry.mediaType}-${entry.id}`} entry={entry} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2.5 text-headline-md text-white">
            <Bookmark className="size-5 text-secondary" />
            Watchlist
          </h2>
          {hydrated && watchlist.length > 0 && (
            <ClearButton onClick={clearWatchlist} label="Clear watchlist" />
          )}
        </div>

        {!hydrated ? (
          <RowSkeleton />
        ) : watchlist.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="size-6" />}
            title="Your watchlist is empty"
            body="Use the bookmark control on any card to save it here."
            cta={{ href: "/tv", label: "Browse series" }}
          />
        ) : (
          <CatalogGrid items={watchlist.map(toSummary)} />
        )}
      </section>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const remove = useLibraryStore((s) => s.removeFromHistory);
  const pct = Math.min(100, Math.round(entry.progress * 100));
  const episodeLabel =
    entry.season && entry.episode ? `S${entry.season} · E${entry.episode}` : null;

  return (
    <li className="glass group relative flex gap-4 overflow-hidden rounded-xl p-3 transition-colors hover:border-primary/25">
      <Link
        href={`/watch/${entry.mediaType}/${entry.id}`}
        className="relative aspect-2/3 w-20 shrink-0 overflow-hidden rounded-lg"
      >
        <PosterArt path={entry.posterPath} title={entry.title} sizes="80px" showLabel={false} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-title-lg text-white">
            <Link href={`/watch/${entry.mediaType}/${entry.id}`}>{entry.title}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-label-sm text-muted">
            {yearOf(entry.releaseDate) && <span>{yearOf(entry.releaseDate)}</span>}
            {episodeLabel && <span className="text-secondary">{episodeLabel}</span>}
            <span>
              {formatTimecode(entry.positionSeconds)}
              {entry.durationSeconds > 0 && ` / ${formatTimecode(entry.durationSeconds)}`}
            </span>
          </p>
        </div>

        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href={`/watch/${entry.mediaType}/${entry.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-label-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              <Play className="size-3.5 fill-current" />
              {pct > 0 ? "Resume" : "Play"}
            </Link>
            <span className="text-label-sm text-muted">{pct}% watched</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => remove(entry.id, entry.mediaType)}
        aria-label={`Remove ${entry.title} from history`}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted opacity-0 transition-opacity hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

function ClearButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-outline px-3.5 py-1.5 text-label-sm text-muted transition-colors hover:border-outline-strong hover:text-white"
    >
      <Trash2 className="size-3.5" />
      {label}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="glass flex flex-col items-center rounded-xl px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-white/5 text-secondary">
        {icon}
      </span>
      <h3 className="mt-4 text-title-lg text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body-md text-muted">{body}</p>
      <Link
        href={cta.href}
        className="mt-6 rounded-full bg-primary px-6 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-hover"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl border border-outline bg-white/[0.03]" />
      ))}
    </div>
  );
}
