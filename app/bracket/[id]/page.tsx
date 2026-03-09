"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Tournament } from "@/types";
import Bracket from "@/components/Bracket";
import Leaderboard from "@/components/Leaderboard";
import SiteHeader from "@/components/SiteHeader";
import Spinner from "@/components/Spinner";
import Link from "next/link";

const POLL_INTERVAL_MS = 60_000;

export default function BracketPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { publicKey } = useWallet();

  const fetchTournament = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournament/${id}`);
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
  }, [id]);

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
      throw new Error("Connect your wallet to vote.");
    }
    const res = await fetch(`/api/tournament/${id}`, {
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
      throw new Error(data.error ?? "Vote failed");
    }
    await fetchTournament();
  }

  if (loading) return <Spinner />;

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <div className="text-lg text-red-400">
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
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">
              {tournament.name}
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
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
            <p className="text-xs text-white/30">
              Last updated: {lastUpdated.toLocaleTimeString()} · auto-refreshes
              every 60s
            </p>
          )}
        </div>

        <Bracket tournament={tournament} onVote={handleVote} />

        <div className="mt-10">
          <Leaderboard tournament={tournament} />
        </div>
      </main>
    </div>
  );
}
