"use client";

import { useState } from "react";
import type { Tournament, Match } from "@/types";
import MatchCard from "./MatchCard";
import Image from "next/image";

interface BracketProps {
  tournament: Tournament;
  onVote?: (matchId: string, tokenMint: string) => Promise<void>;
}

const ROUND_NAMES: Record<number, string> = {
  1: "Quarterfinals",
  2: "Semifinals",
  3: "Final",
};

function getRoundName(round: number, totalRounds: number): string {
  const relativeRound = totalRounds - round + 1;
  return ROUND_NAMES[relativeRound] ?? `Round ${round}`;
}

// Desktop bracket column
function BracketColumn({
  matches,
  round,
  currentRound,
  totalRounds,
  onVote,
}: {
  matches: Match[];
  round: number;
  currentRound: number;
  totalRounds: number;
  onVote?: (matchId: string, tokenMint: string) => Promise<void>;
}) {
  const isActive = round === currentRound;

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
        {matches.map((match) => (
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

  const rounds = Object.keys(roundMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full">
      <WinnerBanner tournament={tournament} />

      {/* Desktop: side-by-side columns */}
      <div className="hidden items-stretch gap-4 overflow-x-auto pb-4 md:flex">
        {rounds.map((round) => (
          <BracketColumn
            key={round}
            matches={roundMap[round]}
            round={round}
            currentRound={tournament.currentRound}
            totalRounds={totalRounds}
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
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
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
