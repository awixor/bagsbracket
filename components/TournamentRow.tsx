"use client";

import Link from "next/link";
import type { Tournament } from "@/types";
import { useTournamentMeta } from "@/hooks/useTournamentMeta";
import TokenAvatar from "@/components/TokenAvatar";
import RoundProgress from "@/components/RoundProgress";

interface TournamentRowProps {
  tournament: Tournament;
}

export default function TournamentRow({ tournament }: TournamentRowProps) {
  const { isActive, winner, participants, totalRounds } =
    useTournamentMeta(tournament);

  return (
    <Link
      href={`/bracket/${tournament.id}`}
      className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-colors ${
        isActive
          ? "border-[#f5c542]/30 bg-[#f5c542]/5 hover:border-[#f5c542]/50"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isActive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              LIVE
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/40">
              COMPLETED
            </span>
          )}
          <h2 className="text-lg font-black text-white">{tournament.name}</h2>
        </div>
        <span className="shrink-0 text-xs text-white/30">
          {new Date(tournament.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Participants + stats row */}
      <div className="flex items-center justify-between gap-4">
        {participants.length > 0 && (
          <div className="flex shrink-0">
            {participants.map((token, i) => (
              <div
                key={token.mint}
                style={{ marginLeft: i === 0 ? 0 : -8, zIndex: i }}
              >
                <TokenAvatar token={token} size={8} />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>{tournament.size} tokens</span>
          <span>
            {tournament.matches.filter((m) => m.winnerId).length} matches
          </span>
          {isActive && (
            <div className="flex items-center gap-1.5">
              <RoundProgress
                currentRound={tournament.currentRound}
                totalRounds={totalRounds}
              />
              <span>
                Round {tournament.currentRound}/{totalRounds}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Champion (completed only) */}
      {winner && (
        <div className="flex items-center gap-3 rounded-xl border border-[#f5c542]/30 bg-[#f5c542]/5 px-4 py-3">
          <TokenAvatar token={winner} size={9} />
          <div className="w-full text-left">
            <div className="text-xs font-bold tracking-widest text-[#f5c542] uppercase">
              Champion
            </div>
            <div className="flex w-full items-center justify-between font-black">
              {winner.name}{" "}
              <span className="text-sm font-normal text-white/40">
                ${winner.symbol}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        className={`w-full rounded-xl py-2.5 text-center text-sm font-black transition-colors ${
          isActive
            ? "bg-[#f5c542] text-[#0a0a0a] group-hover:bg-[#f5c542]/90"
            : "border border-white/10 text-white/60 group-hover:border-white/20 group-hover:text-white"
        }`}
      >
        {isActive ? "View Bracket & Vote →" : "View Final Bracket"}
      </div>
    </Link>
  );
}
