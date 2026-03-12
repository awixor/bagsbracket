"use client";

import { useState } from "react";
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

function TokenAvatar({ token, size = 8 }: { token: Token; size?: number }) {
  const px = size * 4;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-white/10"
      style={{ width: px, height: px }}
    >
      {token.logo ? (
        <Image
          src={token.logo}
          alt={token.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-white/60">
          {token.symbol.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function getParticipants(tournament: Tournament): Token[] {
  const round1 = tournament.matches.filter((m) => m.round === 1);
  return round1.flatMap((m) => [m.tokenA, m.tokenB]);
}

function TournamentRow({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === "active";
  const winner = getWinner(tournament);
  const totalRounds = Math.log2(tournament.size);
  const participants = getParticipants(tournament);

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
          <span>{tournament.matches.filter((m) => m.winnerId).length} matches</span>
          {isActive && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {Array.from({ length: totalRounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i < tournament.currentRound - 1
                        ? "bg-[#f5c542]"
                        : i === tournament.currentRound - 1
                          ? "bg-[#f5c542]/50"
                          : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
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
          <div className="text-left">
            <div className="text-xs font-bold tracking-widest text-[#f5c542] uppercase">
              Champion
            </div>
            <div className="font-black text-white">
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

type Filter = "all" | "live" | "past";

export default function TournamentList({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const live = tournaments.filter((t) => t.status === "active");
  const past = tournaments.filter((t) => t.status === "completed");

  const visible =
    filter === "live" ? live : filter === "past" ? past : tournaments;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: tournaments.length },
    { key: "live", label: "Live", count: live.length },
    { key: "past", label: "Past", count: past.length },
  ];

  return (
    <div className="w-full max-w-3xl">
      {/* Filter tabs */}
      <div className="mb-5 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              filter === tab.key
                ? "bg-[#f5c542] text-[#0a0a0a]"
                : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-1.5 text-xs ${filter === tab.key ? "text-[#0a0a0a]/60" : "text-white/30"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-white/30">No tournaments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((t) => (
            <TournamentRow key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
