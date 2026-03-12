"use client";

import Image from "next/image";
import Link from "next/link";
import type { Tournament, Token } from "@/types";

function getWinner(tournament: Tournament): Token | null {
  if (tournament.status !== "completed") return null;
  const totalRounds = Math.log2(tournament.size);
  const finalMatch = tournament.matches.find((m) => m.round === totalRounds);
  if (!finalMatch?.winnerId) return null;
  return finalMatch.winnerId === finalMatch.tokenA.mint
    ? finalMatch.tokenA
    : finalMatch.tokenB;
}

function getParticipants(tournament: Tournament): Token[] {
  const round1 = tournament.matches.filter((m) => m.round === 1);
  return round1.flatMap((m) => [m.tokenA, m.tokenB]);
}

function Avatar({ src, alt, size }: { src?: string; alt: string; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#141414] bg-white/10"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-white/50">
          {alt.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function MiniCard({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === "active";
  const winner = getWinner(tournament);
  const totalRounds = Math.log2(tournament.size);
  const participants = getParticipants(tournament);

  return (
    <Link
      href={`/bracket/${tournament.id}`}
      className={`group flex gap-3 rounded-xl border p-3 transition-colors ${
        isActive
          ? "border-[#f5c542]/30 bg-[#f5c542]/5 hover:border-[#f5c542]/50"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      {/* Left: winner avatar + name */}
      <div className="flex shrink-0 flex-col items-center gap-1.5" style={{ width: 56 }}>
        <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
          {winner?.logo ? (
            <Image
              src={winner.logo}
              alt={winner.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base">
              {isActive ? "⚡" : "🏆"}
            </div>
          )}
        </div>
        {winner && (
          <span className="w-full truncate text-center text-[10px] font-bold text-[#f5c542]">
            {winner.symbol}
          </span>
        )}
        {isActive && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
            <span className="h-1 w-1 animate-pulse rounded-full bg-green-400" />
            LIVE
          </span>
        )}
      </div>

      {/* Right: bracket details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        {/* Name */}
        <div>
          <div className="truncate text-sm font-bold text-white">
            {tournament.name}
          </div>
          <div className="text-[10px] text-white/30">
            {isActive
              ? `Round ${tournament.currentRound} of ${totalRounds}`
              : `${totalRounds} rounds · ${tournament.size} tokens`}
          </div>
        </div>

        {/* Token avatars */}
        {participants.length > 0 && (
          <div className="flex">
            {participants.map((token, i) => (
              <div key={token.mint} style={{ marginLeft: i === 0 ? 0 : -5, zIndex: i }}>
                <Avatar src={token.logo} alt={token.symbol} size={22} />
              </div>
            ))}
          </div>
        )}

        {/* Round progress (live) or result (completed) */}
        {isActive && (
          <div className="flex gap-1">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < tournament.currentRound - 1
                    ? "bg-[#f5c542]"
                    : i === tournament.currentRound - 1
                      ? "bg-[#f5c542]/50"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>
        )}
        {!isActive && winner && (
          <div className="text-[10px] text-white/40">
            Won by <span className="font-bold text-white/60">{winner.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function TournamentGrid({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  if (tournaments.length === 0) return null;

  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {tournaments.map((t) => (
        <MiniCard key={t.id} tournament={t} />
      ))}
    </div>
  );
}
