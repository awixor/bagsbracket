import Link from "next/link";
import WalletButton from "@/components/WalletButton";
import { SEED_TOURNAMENT } from "@/data/seed";

export default function Home() {
  const tournament = SEED_TOURNAMENT;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="text-[#f5c542] font-black text-xl tracking-tight">
          BagsBracket
        </span>
        <WalletButton />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-10">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block bg-[#f5c542]/10 border border-[#f5c542]/30 text-[#f5c542] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Built on Bags.fm · Solana
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            March Madness
            <br />
            <span className="text-[#f5c542]">for Crypto Tokens</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">
            8 tokens enter. 1 survives. Head-to-head elimination rounds decided
            by real trading volume on Bags.fm — vote, trade, and campaign for
            your favourite token.
          </p>
        </div>

        {/* Active tournament card */}
        {tournament && (
          <div className="w-full max-w-lg border border-[#f5c542]/30 bg-[#f5c542]/5 rounded-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-[#f5c542] font-bold uppercase tracking-widest mb-1">
                  Active Tournament
                </div>
                <h2 className="text-xl font-black text-white">{tournament.name}</h2>
              </div>
              <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
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
                  {tournament.matches.filter((m) => !m.winnerId && m.round === tournament.currentRound).length}
                </div>
                <div className="text-xs text-white/40">Active Matches</div>
              </div>
            </div>

            <Link
              href={`/bracket/${tournament.id}`}
              className="block w-full text-center py-3 rounded-xl bg-[#f5c542] text-[#0a0a0a] font-black text-lg hover:bg-[#f5c542]/90 transition-colors"
            >
              View Bracket & Vote
            </Link>
          </div>
        )}

        {/* How it works */}
        <div className="w-full max-w-2xl">
          <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6">
            How it works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              {
                step: "01",
                title: "8 Tokens Enter",
                desc: "Seeded by holder count — best vs worst in each matchup.",
              },
              {
                step: "02",
                title: "Trade to Win",
                desc: "Higher 24h trading volume on Bags.fm wins the match. Campaign hard.",
              },
              {
                step: "03",
                title: "Community Votes",
                desc: "Connect wallet to cast votes. Volume wins ties.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="border border-white/10 rounded-xl p-4 bg-white/5"
              >
                <div className="text-[#f5c542] font-black text-2xl mb-2">{step}</div>
                <div className="font-bold text-white mb-1">{title}</div>
                <div className="text-white/40 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-sm">
          Powered by{" "}
          <a
            href="https://bags.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5c542]/60 hover:text-[#f5c542] transition-colors"
          >
            Bags.fm
          </a>
        </p>
      </main>
    </div>
  );
}
