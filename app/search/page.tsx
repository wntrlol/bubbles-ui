import type { Metadata } from "next";
import { Suspense } from "react";

import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-page px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
          <h1 className="text-headline-lg text-white">Search</h1>
          <div className="glass mt-6 h-14 animate-pulse rounded-full" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
