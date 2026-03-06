"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Tournament } from "@/types";
import Bracket from "@/components/Bracket";
import Leaderboard from "@/components/Leaderboard";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

const POLL_INTERVAL_MS = 60_000;

export default function BracketPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { publicKey } = useWallet();

  const fetchTournament = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament");
      if (!res.ok) throw new Error("Failed to load tournament");
      const data = await res.json();
      // Rehydrate dates
      data.matches = data.matches.map((m: Tournament["matches"][0]) => ({
        ...m,
        startTime: new Date(m.startTime),
        endTime: new Date(m.endTime),
      }));
      data.createdAt = new Date(data.createdAt);
      setTournament(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  // Poll every 60s during active tournament
  useEffect(() => {
    if (tournament?.status !== "active") return;
    const id = setInterval(fetchTournament, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tournament?.status, fetchTournament]);

  async function handleVote(matchId: string, tokenMint: string) {
    if (!publicKey) {
      alert("Connect your wallet to vote.");
      return;
    }
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        tokenMint,
        walletAddress: publicKey.toBase58(),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Vote failed");
      return;
    }
    await fetchTournament();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f5c542] text-lg animate-pulse">
          Loading bracket...
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4">
        <div className="text-red-400 text-lg">
          {error ?? "Tournament not found"}
        </div>
        <Link href="/" className="text-[#f5c542] underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-[#f5c542] font-black text-xl tracking-tight"
        >
          BagsBracket
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/demo" className="text-white/50 text-sm hover:text-white transition-colors">
            Demo
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white">
              {tournament.name}
            </h1>
            <span
              className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                tournament.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : tournament.status === "completed"
                    ? "bg-[#f5c542]/20 text-[#f5c542]"
                    : "bg-white/10 text-white/50"
              }`}
            >
              {tournament.status}
            </span>
          </div>
          {lastUpdated && (
            <p className="text-white/30 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()} · auto-refreshes
              every 60s
            </p>
          )}
        </div>

        {/* Main layout: bracket + leaderboard */}
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <Bracket tournament={tournament} onVote={handleVote} />
          </div>
          <div className="xl:w-72 shrink-0">
            <Leaderboard tournament={tournament} />
          </div>
        </div>
      </main>
    </div>
  );
}
