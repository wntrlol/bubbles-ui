import ForYouRail from "@/components/ForYouRail";
import HeroBillboard from "@/components/HeroBillboard";
import MediaRow from "@/components/MediaRow";
import ProviderRail from "@/components/ProviderRail";
import TopTenRail from "@/components/TopTenRail";
import { discover, getPopular, getTopRated, getTrending, getWatchProviders } from "@/lib/tmdb";

export const revalidate = 1800;

/** Genre rails, sourced from TMDB's own genre ids. */
const GENRE_RAILS = [
  { id: 28, title: "Action Movies", type: "movie" as const },
  { id: 35, title: "Comedy Movies", type: "movie" as const },
  { id: 878, title: "Science Fiction", type: "movie" as const },
  { id: 27, title: "Horror", type: "movie" as const },
  { id: 10765, title: "Sci-Fi & Fantasy Series", type: "tv" as const },
  { id: 80, title: "Crime Series", type: "tv" as const },
];

export default async function HomePage() {
  const [trendingMovies, trendingTv, popularTv, topRatedMovies, providers, ...genreRails] =
    await Promise.all([
      getTrending("movie", "week"),
      getTrending("tv", "week"),
      getPopular("tv"),
      getTopRated("movie"),
      getWatchProviders("movie"),
      ...GENRE_RAILS.map((rail) =>
        discover({ type: rail.type, genreId: rail.id, sort: "popularity" }),
      ),
    ]);

  return (
    <>
      <HeroBillboard items={trendingMovies.slice(0, 5)} />

      {/* Pulled into the hero's fade so the two read as one surface. */}
      <div className="relative -mt-14 pb-10 lg:-mt-16">
        <ProviderRail providers={providers} />

        <TopTenRail movies={trendingMovies} shows={trendingTv} />

        <ForYouRail />

        <MediaRow title="Trending Movies" items={trendingMovies} href="/trending" />
        <MediaRow title="Trending Series" items={trendingTv} href="/trending" />

        {GENRE_RAILS.map((rail, i) => (
          <MediaRow
            key={rail.id}
            title={rail.title}
            items={genreRails[i].results}
            href={`/${rail.type === "movie" ? "movies" : "tv"}?genre=${rail.id}`}
          />
        ))}

        <MediaRow title="Popular Series" items={popularTv} href="/tv" />
        <MediaRow title="Top Rated" items={topRatedMovies} href="/movies?sort=rating" />
      </div>
    </>
  );
}
