"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Tournament } from "@/types";
import Bracket from "@/components/Bracket";
import Leaderboard from "@/components/Leaderboard";
import HowItWorks from "@/components/HowItWorks";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

export default function DemoPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();

  const fetchDemo = useCallback(async () => {
    try {
      const res = await fetch("/api/demo");
      if (!res.ok) throw new Error("Failed to load demo data");
      const data = await res.json();
      // Rehydrate dates
      data.matches = data.matches.map((m: Tournament["matches"][0]) => ({
        ...m,
        startTime: new Date(m.startTime),
        endTime: new Date(m.endTime),
      }));
      data.createdAt = new Date(data.createdAt);
      setTournament(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemo();
  }, [fetchDemo]);

  async function handleVote(matchId: string, tokenMint: string) {
    if (!publicKey) {
      alert("Connect your wallet to vote.");
      return;
    }
    alert(`Vote recorded for ${tokenMint.slice(0, 8)}... (demo mode)`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse text-lg text-[#f5c542]">
          Loading live demo...
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <div className="text-lg text-red-400">
          {error ?? "Demo unavailable"}
        </div>
        <Link href="/" className="text-[#f5c542] underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-[#f5c542]"
        >
          BagsBracket
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            Home
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Live demo banner */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-400" />
          <p className="text-sm font-medium text-green-400">
            This is a live demo — real Bags.fm tokens, real trading data from
            Dexscreener. Seeded fresh on every page load.
          </p>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
          <p className="mt-1 text-sm text-white/40">
            Round {tournament.currentRound} · {tournament.size} tokens · Winner
            decided by 24h trading volume on Bags.fm
          </p>
        </div>

        {/* Bracket */}
        <Bracket tournament={tournament} onVote={handleVote} />

        {/* Leaderboard */}
        <div className="mt-10">
          <Leaderboard tournament={tournament} />
        </div>

        {/* How it works */}
        <div className="mt-16">
          <HowItWorks />
        </div>
      </main>
    </div>
  );
}
