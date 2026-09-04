import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import MediaRow from "@/components/MediaRow";
import PosterArt from "@/components/PosterArt";
import WatchExperience from "@/components/player/WatchExperience";
import WatchlistButton from "@/components/WatchlistButton";
import { getStreamProviders } from "@/lib/providers";
import { getDetails, getSeason } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";
import { formatRuntime, rating, yearOf } from "@/lib/utils";

interface WatchPageProps {
  params: Promise<{ type: string; id: string }>;
}

const isMediaType = (value: string): value is MediaType => value === "movie" || value === "tv";

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { type, id } = await params;
  if (!isMediaType(type)) return { title: "Not found" };

  const details = await getDetails(type, id);
  return {
    title: details.title,
    description: details.overview.slice(0, 160) || undefined,
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, id } = await params;
  if (!isMediaType(type)) notFound();

  const details = await getDetails(type, id);
  const providers = getStreamProviders();
  const initialSeason =
    type === "tv" && details.seasons.length > 0
      ? await getSeason(id, details.seasons[0].seasonNumber)
      : null;

  const year = yearOf(details.releaseDate);
  const score = rating(details.voteAverage);
  const runtime = formatRuntime(details.runtime);

  return (
    <div className="pb-16 pt-24 lg:pt-28">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <WatchExperience details={details} providers={providers} initialSeason={initialSeason} />

        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-badge-4k px-2 py-0.5 text-label-sm font-semibold text-white">
                4K
              </span>
              {year && <Chip>{year}</Chip>}
              {runtime && <Chip>{runtime}</Chip>}
              {score && (
                <Chip>
                  <Star className="size-3.5 fill-primary text-primary" />
                  {score}
                </Chip>
              )}
              {details.status && <Chip>{details.status}</Chip>}
              {type === "tv" && details.numberOfSeasons && (
                <Chip>
                  {details.numberOfSeasons} season{details.numberOfSeasons > 1 ? "s" : ""}
                </Chip>
              )}
            </div>

            <h1 className="mt-4 text-headline-lg text-white">{details.title}</h1>
            {details.tagline && (
              <p className="mt-2 text-body-lg italic text-secondary">{details.tagline}</p>
            )}

            {details.genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <li
                    key={genre.id}
                    className="rounded-full border border-secondary/40 bg-secondary/15 px-3 py-1 text-label-sm text-secondary"
                  >
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}

            {details.overview && (
              <p className="mt-5 max-w-2xl text-body-lg text-white/70">{details.overview}</p>
            )}

            <div className="mt-6">
              <WatchlistButton media={details} />
            </div>
          </div>

          {details.cast.length > 0 && (
            <aside className="glass rounded-2xl p-5">
              <h2 className="text-label-sm uppercase tracking-[0.14em] text-secondary">Cast</h2>
              <ul className="mt-4 space-y-3.5">
                {details.cast.slice(0, 8).map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                      <PosterArt path={member.profilePath} title={member.name} sizes="40px" showLabel={false} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-label-md text-white">{member.name}</span>
                      {member.character && (
                        <span className="block truncate text-label-sm text-muted">
                          {member.character}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </section>
      </div>

      {details.related.length > 0 && (
        <div className="mt-10">
          <MediaRow title="More like this" items={details.related} />
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-white/5 px-3 py-1 text-label-sm text-white/85">
      {children}
    </span>
  );
}
