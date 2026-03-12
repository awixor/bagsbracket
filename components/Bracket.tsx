"use client";

import { useState } from "react";
import type { Tournament, Match } from "@/types";
import MatchCard from "./MatchCard";
import Image from "next/image";
import { getRoundName } from "@/lib/tournament";

interface BracketProps {
  tournament: Tournament;
  onVote?: (matchId: string, tokenMint: string) => Promise<void>;
}

// Desktop bracket column
function BracketColumn({
  matches,
  round,
  currentRound,
  totalRounds,
  placeholderCount,
  onVote,
}: {
  matches: Match[];
  round: number;
  currentRound: number;
  totalRounds: number;
  placeholderCount: number;
  onVote?: (matchId: string, tokenMint: string) => Promise<void>;
}) {
  const isActive = round === currentRound;
  const isEmpty = matches.length === 0;

  return (
    <div className="flex min-w-65 flex-1 flex-col justify-around">
      <div className="mb-4 text-center">
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold tracking-wider uppercase ${
            isActive
              ? "bg-[#f5c542]/20 text-[#f5c542]"
              : "bg-white/5 text-white/40"
          }`}
        >
          {getRoundName(round, totalRounds)}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-around gap-4">
        {isEmpty
          ? Array.from({ length: placeholderCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-black/10 p-6 text-center text-xs text-white/20"
              >
                TBD
              </div>
            ))
          : matches.map((match) => (
              <div
                key={match.id}
                className={`rounded-2xl p-3 transition-all ${
                  isActive
                    ? "border border-[#f5c542]/30 bg-black/40"
                    : "border border-white/10 bg-black/20"
                }`}
              >
                <MatchCard match={match} isActive={isActive} onVote={onVote} />
              </div>
            ))}
      </div>
    </div>
  );
}

// Winner banner
function WinnerBanner({ tournament }: { tournament: Tournament }) {
  if (tournament.status !== "completed") return null;
  const finalMatch = tournament.matches.find(
    (m) => m.round === Math.log2(tournament.size),
  );
  if (!finalMatch?.winnerId) return null;

  const winner =
    finalMatch.winnerId === finalMatch.tokenA.mint
      ? finalMatch.tokenA
      : finalMatch.tokenB;

  return (
    <div className="mb-8 rounded-2xl border border-[#f5c542] bg-[#f5c542]/10 px-4 py-8 text-center">
      <div className="mb-2 text-sm font-bold tracking-widest text-[#f5c542] uppercase">
        Tournament Champion
      </div>
      <div className="flex items-center justify-center gap-4">
        {winner.logo && (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#f5c542]">
            <Image
              src={winner.logo}
              alt={winner.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <div className="text-3xl font-black text-white">{winner.name}</div>
          <div className="text-[#f5c542]">${winner.symbol}</div>
        </div>
      </div>
    </div>
  );
}

export default function Bracket({ tournament, onVote }: BracketProps) {
  const totalRounds = Math.log2(tournament.size);
  const [mobileRound, setMobileRound] = useState(tournament.currentRound);

  // Group matches by round
  const roundMap: Record<number, Match[]> = {};
  for (const match of tournament.matches) {
    if (!roundMap[match.round]) roundMap[match.round] = [];
    roundMap[match.round].push(match);
  }

  // Always render all rounds so future rounds show as placeholder columns
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <WinnerBanner tournament={tournament} />

      {/* Desktop: side-by-side columns */}
      <div className="hidden min-h-175 items-stretch gap-4 overflow-x-auto pb-4 md:flex">
        {rounds.map((round) => (
          <BracketColumn
            key={round}
            matches={roundMap[round] ?? []}
            round={round}
            currentRound={tournament.currentRound}
            totalRounds={totalRounds}
            placeholderCount={tournament.size / Math.pow(2, round)}
            onVote={onVote}
          />
        ))}
      </div>

      {/* Mobile: tabs per round */}
      <div className="md:hidden">
        {/* Round tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => setMobileRound(round)}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-all ${
                mobileRound === round
                  ? "bg-[#f5c542] text-[#0a0a0a]"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {getRoundName(round, totalRounds)}
            </button>
          ))}
        </div>

        {/* Active round matches */}
        <div className="flex flex-col gap-4">
          {(roundMap[mobileRound] ?? []).map((match) => (
            <div
              key={match.id}
              className={`rounded-2xl border p-3 ${
                mobileRound === tournament.currentRound
                  ? "border-[#f5c542]/30 bg-black/40"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <MatchCard
                match={match}
                isActive={mobileRound === tournament.currentRound}
                onVote={onVote}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
