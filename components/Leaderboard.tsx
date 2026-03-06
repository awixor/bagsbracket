"use client";

import Image from "next/image";
import type { Tournament, Token } from "@/types";

interface LeaderboardProps {
  tournament: Tournament;
}

interface TokenEntry {
  token: Token;
  volume: number;
  won: boolean;
  round: number;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(2)}`;
}

export default function Leaderboard({ tournament }: LeaderboardProps) {
  // Collect all tokens from current round matches with their volumes
  const currentMatches = tournament.matches.filter(
    (m) => m.round === tournament.currentRound,
  );

  const entries: TokenEntry[] = [];

  for (const match of currentMatches) {
    entries.push({
      token: match.tokenA,
      volume: match.volumeA,
      won: match.winnerId === match.tokenA.mint,
      round: match.round,
    });
    entries.push({
      token: match.tokenB,
      volume: match.volumeB,
      won: match.winnerId === match.tokenB.mint,
      round: match.round,
    });
  }

  // Sort by volume descending
  entries.sort((a, b) => b.volume - a.volume);

  if (entries.length === 0) {
    return (
      <div className="text-white/40 text-center py-8">
        No active matches in this round.
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-white mb-4">
        Round {tournament.currentRound} Standings
      </h2>
      <div className="flex flex-col gap-2">
        {entries.map((entry, idx) => (
          <div
            key={entry.token.mint}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              entry.won
                ? "border-[#f5c542]/50 bg-[#f5c542]/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            {/* Rank */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                idx === 0
                  ? "bg-[#f5c542] text-[#0a0a0a]"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {idx + 1}
            </div>

            {/* Logo */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {entry.token.logo ? (
                <Image
                  src={entry.token.logo}
                  alt={entry.token.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#f5c542]">
                  {entry.token.symbol.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm truncate">
                {entry.token.name}
              </div>
              <div className="text-xs text-white/40">${entry.token.symbol}</div>
            </div>

            {/* Volume */}
            <div className="text-right">
              <div className="font-bold text-[#f5c542] text-sm">
                {formatVolume(entry.volume)}
              </div>
              <div className="text-xs text-white/40">volume</div>
            </div>

            {/* Winner badge */}
            {entry.won && (
              <span className="text-xs font-bold text-[#f5c542] bg-[#f5c542]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                W
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
