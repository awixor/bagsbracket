"use client";

import { useState } from "react";
import Image from "next/image";
import type { Match } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";

interface MatchCardProps {
  match: Match;
  isActive?: boolean;
  onVote?: (matchId: string, tokenMint: string) => Promise<void>;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(2)}`;
}

function VolumeBar({ volumeA, volumeB }: { volumeA: number; volumeB: number }) {
  const total = volumeA + volumeB;
  if (total === 0) return null;
  const pctA = Math.round((volumeA / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      <div
        className="bg-[#f5c542] transition-all duration-500"
        style={{ width: `${pctA}%` }}
      />
      <div
        className="bg-white/30 transition-all duration-500"
        style={{ width: `${pctB}%` }}
      />
    </div>
  );
}

function TokenSide({
  token,
  volume,
  votes,
  isWinner,
  isActive,
  onVote,
  matchId,
  side,
}: {
  token: Match["tokenA"];
  volume: number;
  votes: number;
  isWinner: boolean;
  isActive: boolean;
  onVote?: (matchId: string, mint: string) => Promise<void>;
  matchId: string;
  side: "A" | "B";
}) {
  const [voting, setVoting] = useState(false);
  const tradeUrl = `https://bags.fm/token/${token.mint}`;

  async function handleVote() {
    if (!onVote) return;
    setVoting(true);
    try {
      await onVote(matchId, token.mint);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div
      className={`
        flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all
        ${isWinner ? "bg-[#f5c542]/15 border border-[#f5c542]" : "bg-white/5 border border-white/10"}
      `}
    >
      {/* Logo */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10">
        {token.logo ? (
          <Image src={token.logo} alt={token.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#f5c542]">
            {token.symbol.slice(0, 2)}
          </div>
        )}
      </div>

      {/* Name + Symbol */}
      <div className="text-center">
        <div className="font-bold text-white text-sm leading-tight">{token.name}</div>
        <div className="text-xs text-white/40">${token.symbol}</div>
      </div>

      {/* Volume */}
      <div className="text-center">
        <div className="text-[#f5c542] font-bold text-lg">{formatVolume(volume)}</div>
        <div className="text-white/40 text-xs">volume</div>
      </div>

      {/* Votes */}
      <div className="text-white/60 text-xs">{votes} votes</div>

      {isWinner && (
        <span className="text-xs font-bold text-[#f5c542] bg-[#f5c542]/20 px-2 py-0.5 rounded-full">
          WINNER
        </span>
      )}

      {/* Actions */}
      {isActive && (
        <div className="flex flex-col gap-1 w-full mt-1">
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-1.5 rounded-lg bg-[#f5c542] text-[#0a0a0a] font-bold text-xs hover:bg-[#f5c542]/90 transition-colors"
          >
            Trade
          </a>
          {onVote && (
            <button
              onClick={handleVote}
              disabled={voting}
              className="py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-medium hover:border-[#f5c542]/50 hover:text-[#f5c542] transition-colors disabled:opacity-50"
            >
              {voting ? "Voting..." : "Vote"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MatchCard({ match, isActive = false, onVote }: MatchCardProps) {
  const { connected } = useWallet();
  const isCompleted = !!match.winnerId;

  const handleVote = connected && isActive && onVote
    ? (matchId: string, mint: string) => onVote(matchId, mint)
    : undefined;

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Round label */}
      {isActive && (
        <div className="text-center text-xs text-[#f5c542] font-semibold uppercase tracking-wider">
          Round {match.round} · Live
        </div>
      )}

      {/* Match */}
      <div className="flex gap-2 items-stretch">
        <TokenSide
          token={match.tokenA}
          volume={match.volumeA}
          votes={match.votesA}
          isWinner={match.winnerId === match.tokenA.mint}
          isActive={isActive && !isCompleted}
          onVote={handleVote}
          matchId={match.id}
          side="A"
        />

        <div className="flex flex-col items-center justify-center gap-1 px-1">
          <span className="text-white/30 text-xs font-bold">VS</span>
        </div>

        <TokenSide
          token={match.tokenB}
          volume={match.volumeB}
          votes={match.votesB}
          isWinner={match.winnerId === match.tokenB.mint}
          isActive={isActive && !isCompleted}
          onVote={handleVote}
          matchId={match.id}
          side="B"
        />
      </div>

      {/* Volume bar */}
      <VolumeBar volumeA={match.volumeA} volumeB={match.volumeB} />

      <div className="flex justify-between text-xs text-white/30">
        <span>{match.tokenA.symbol}</span>
        <span>volume split</span>
        <span>{match.tokenB.symbol}</span>
      </div>
    </div>
  );
}
