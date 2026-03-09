import Link from "next/link";
import HowItWorks from "@/components/HowItWorks";
import QueueStatus from "@/components/QueueStatus";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WinnerBanner from "@/components/WinnerBanner";
import TournamentList from "@/components/TournamentList";
import { getActiveTournaments, getArchivedTournaments } from "@/lib/kv";

export default async function Home() {
  const [activeTournaments, archivedTournaments] = await Promise.all([
    getActiveTournaments().catch(() => []),
    getArchivedTournaments().catch(() => []),
  ]);
  const latestCompleted = archivedTournaments[0] ?? null;
  const allTournaments = [
    ...activeTournaments,
    ...archivedTournaments.filter((t) => !activeTournaments.find((a) => a.id === t.id)),
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-16 px-4 py-16 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-6">
          <div className="inline-block rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-4 py-1.5 text-xs font-bold tracking-widest text-[#f5c542] uppercase">
            Built on Bags.fm · Solana
          </div>
          <h1 className="text-5xl leading-none font-black tracking-tight sm:text-7xl">
            March Madness
            <br />
            <span className="text-[#f5c542]">for Crypto Tokens</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/50">
            8 tokens enter. 1 survives. Head-to-head elimination rounds decided
            by real trading volume on Bags.fm — vote, trade, and campaign for
            your favourite token.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-[#f5c542] px-8 py-4 text-lg font-black text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
            >
              Register Your Token →
            </Link>
            <Link
              href="/tournaments"
              className="rounded-2xl border border-white/20 px-8 py-4 text-lg font-black text-white transition-colors hover:border-[#f5c542]/50 hover:text-[#f5c542]"
            >
              {activeTournaments.length > 0 ? "View Live Brackets" : "View Tournaments"}
            </Link>
          </div>
        </div>

        {/* Winner spotlight — latest completed */}
        {latestCompleted && <WinnerBanner tournament={latestCompleted} />}

        {/* Tournament list */}
        {allTournaments.length > 0 && (
          <TournamentList tournaments={allTournaments} />
        )}

        {/* Queue status */}
        <QueueStatus />

        {/* How it works */}
        <div className="w-full max-w-2xl">
          <HowItWorks />
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}
