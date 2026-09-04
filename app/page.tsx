import HeroBillboard from "@/components/HeroBillboard";
import MediaRow from "@/components/MediaRow";
import ProviderRail from "@/components/ProviderRail";
import { getPopular, getTopRated, getTrending, getWatchProviders } from "@/lib/tmdb";

export const revalidate = 1800;

export default async function HomePage() {
  const [trendingMovies, trendingTv, popularTv, topRatedMovies, popularMovies, providers] =
    await Promise.all([
      getTrending("movie", "week"),
      getTrending("tv", "week"),
      getPopular("tv"),
      getTopRated("movie"),
      getPopular("movie"),
      getWatchProviders("movie"),
    ]);

  return (
    <>
      <HeroBillboard items={trendingMovies.slice(0, 5)} />

      {/* Pulled up into the hero's fade so the two read as one surface. */}
      <div className="relative -mt-24 pb-10 lg:-mt-28">
        <ProviderRail providers={providers} />

        <MediaRow title="Trending Movies" items={trendingMovies} href="/trending" priority />
        <MediaRow title="Trending Series" items={trendingTv} href="/trending" />
        <MediaRow title="Popular on Nexa" items={popularTv} href="/tv" />
        <MediaRow title="Top Rated Classics" items={topRatedMovies} href="/movies?sort=rating" />
        <MediaRow title="New in Film" items={popularMovies} href="/movies?sort=newest" />
      </div>
    </>
  );
}
