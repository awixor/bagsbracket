import type { MetadataRoute } from "next";
import { getActiveTournaments, getArchivedTournaments } from "@/lib/kv";

const BASE = "https://bagsbracket.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [active, archived] = await Promise.all([
    getActiveTournaments().catch(() => []),
    getArchivedTournaments().catch(() => []),
  ]);

  const static_pages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/tournaments`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const tournamentPages: MetadataRoute.Sitemap = [...active, ...archived].map(
    (t) => ({
      url: `${BASE}/bracket/${t.id}`,
      lastModified: new Date(t.createdAt),
      changeFrequency: t.status === "active" ? "hourly" : "yearly",
      priority: t.status === "active" ? 0.9 : 0.6,
    }),
  );

  return [...static_pages, ...tournamentPages];
}
