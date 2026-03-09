import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Tournaments",
  description:
    "Browse all live and past BagsBracket token elimination tournaments on Bags.fm.",
};
import SiteFooter from "@/components/SiteFooter";
import TournamentList from "@/components/TournamentList";
import { getActiveTournaments, getArchivedTournaments } from "@/lib/kv";

export default async function TournamentsPage() {
  const [active, archived] = await Promise.all([
    getActiveTournaments().catch(() => []),
    getArchivedTournaments().catch(() => []),
  ]);

  const all = [
    ...active,
    ...archived.filter((t) => !active.find((a) => a.id === t.id)),
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Tournaments</h1>
          <p className="mt-1 text-sm text-white/40">
            All live and past BagsBracket tournaments
          </p>
        </div>

        <TournamentList tournaments={all} />

        <div className="mt-12 text-center">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
