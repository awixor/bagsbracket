import Link from "next/link";
import Image from "next/image";
import WalletButton from "@/components/WalletButton";
import HowItWorks from "@/components/HowItWorks";
import QueueStatus from "@/components/QueueStatus";
import { getActiveTournament } from "@/lib/kv";

export default async function Home() {
  const tournament = await getActiveTournament().catch(() => null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Image src="/logo.png" alt="BagsBracket" width={40} height={40} />
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            Demo
          </Link>
          <Link
            href="/register"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            Register
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
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
          <Link
            href="/demo"
            className="inline-block rounded-2xl bg-[#f5c542] px-8 py-4 text-lg font-black text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
          >
            View Live Demo →
          </Link>
        </div>

        {/* Next tournament queue */}
        <QueueStatus />

        {/* Active tournament card */}
        {tournament && (
          <div className="w-full max-w-lg rounded-2xl border border-[#f5c542]/30 bg-[#f5c542]/5 p-6 text-left">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="mb-1 text-xs font-bold tracking-widest text-[#f5c542] uppercase">
                  Active Tournament
                </div>
                <h2 className="text-xl font-black text-white">
                  {tournament.name}
                </h2>
              </div>
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                LIVE
              </span>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-[#f5c542]">
                  {tournament.size}
                </div>
                <div className="text-xs text-white/40">Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  Round {tournament.currentRound}
                </div>
                <div className="text-xs text-white/40">Current</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {
                    tournament.matches.filter(
                      (m) => !m.winnerId && m.round === tournament.currentRound,
                    ).length
                  }
                </div>
                <div className="text-xs text-white/40">Active Matches</div>
              </div>
            </div>

            <Link
              href={`/bracket/${tournament.id}`}
              className="block w-full rounded-xl bg-[#f5c542] py-3 text-center text-lg font-black text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
            >
              View Bracket & Vote
            </Link>
          </div>
        )}

        {/* How it works */}
        <div className="w-full max-w-2xl">
          <HowItWorks />
        </div>

        {/* Footer */}
        <p className="text-sm text-white/20">
          Powered by{" "}
          <a
            href="https://bags.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5c542]/60 transition-colors hover:text-[#f5c542]"
          >
            Bags.fm
          </a>
        </p>
      </main>
    </div>
  );
}
