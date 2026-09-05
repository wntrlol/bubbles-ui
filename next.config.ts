import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the user profile directory
  // otherwise wins root detection and skews build traces.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/search",
        destination: "/?search=1",
        permanent: false,
      },
      {
        source: "/watch/:type/:id",
        destination: "/?media=:type-:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
