"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Match, Tournament } from "@/types";
import { api, TournamentStatus } from "@/lib/routes";
import Bracket from "@/components/Bracket";
import Leaderboard from "@/components/Leaderboard";
import SiteHeader from "@/components/SiteHeader";

const POLL_INTERVAL_MS = 60_000;

function rehydrateDates(data: Tournament): Tournament {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    matches: data.matches.map((m: Match) => ({
      ...m,
      startTime: new Date(m.startTime),
      endTime: new Date(m.endTime),
    })),
  };
}

export default function BracketClient({
  id,
  initialData,
}: {
  id: string;
  initialData: Tournament;
}) {
  const [tournament, setTournament] = useState<Tournament>(
    rehydrateDates(initialData),
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { publicKey } = useWallet();

  const fetchTournament = useCallback(async () => {
    const res = await fetch(api.tournament(id));
    if (!res.ok) return;
    const data = await res.json();
    setTournament(rehydrateDates(data));
    setLastUpdated(new Date());
  }, [id]);

  useEffect(() => {
    if (tournament.status !== TournamentStatus.ACTIVE) return;
    const intervalId = setInterval(fetchTournament, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [tournament.status, fetchTournament]);

  const handleVote = useCallback(
    async (matchId: string, tokenMint: string) => {
      if (!publicKey) throw new Error("Connect your wallet to vote.");
      const res = await fetch(api.tournament(id), {
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
    },
    [id, publicKey, fetchTournament],
  );

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
                tournament.status === TournamentStatus.ACTIVE
                  ? "bg-green-500/20 text-green-400"
                  : tournament.status === TournamentStatus.COMPLETED
                    ? "bg-[#f5c542]/20 text-[#f5c542]"
                    : "bg-white/10 text-white/50"
              }`}
            >
              {tournament.status}
            </span>
          </div>
          <p className="text-xs text-white/30">
            Last updated: {lastUpdated.toLocaleTimeString()} · auto-refreshes
            every 60s
          </p>
        </div>

        <Bracket tournament={tournament} onVote={handleVote} />

        <div className="mt-10">
          <Leaderboard tournament={tournament} />
        </div>
      </main>
    </div>
  );
}
