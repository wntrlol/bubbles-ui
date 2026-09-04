import type { Metadata } from "next";

import MyListClient from "@/components/MyListClient";

export const metadata: Metadata = { title: "My List" };

export default function MyListPage() {
  return <MyListClient />;
}
