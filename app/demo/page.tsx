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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f5c542] text-lg animate-pulse">
          Loading live demo...
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4">
        <div className="text-red-400 text-lg">{error ?? "Demo unavailable"}</div>
        <Link href="/" className="text-[#f5c542] underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#f5c542] font-black text-xl tracking-tight">
          BagsBracket
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
            Home
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Live demo banner */}
        <div className="mb-8 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <p className="text-green-400 text-sm font-medium">
            This is a live demo — real Bags.fm tokens, real trading data from Dexscreener.
            Seeded fresh on every page load.
          </p>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
          <p className="text-white/40 text-sm mt-1">
            Round {tournament.currentRound} · {tournament.size} tokens · Winner decided by 24h trading volume on Bags.fm
          </p>
        </div>

        {/* Bracket + Leaderboard */}
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <Bracket tournament={tournament} onVote={handleVote} />
          </div>
          <div className="xl:w-72 shrink-0">
            <Leaderboard tournament={tournament} />
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <HowItWorks />
        </div>
      </main>
    </div>
  );
}
