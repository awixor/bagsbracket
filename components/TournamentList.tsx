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

function TournamentRow({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === "active";
  const winner = getWinner(tournament);
  const totalRounds = Math.log2(tournament.size);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">{tournament.name}</h2>
          <p className="mt-0.5 text-xs text-white/40">
            {new Date(tournament.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        {isActive ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            LIVE
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/40">
            COMPLETED
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-black/30 py-2">
          <div className="text-lg font-black text-[#f5c542]">{tournament.size}</div>
          <div className="text-xs text-white/40">Tokens</div>
        </div>
        <div className="rounded-lg bg-black/30 py-2">
          <div className="text-lg font-black text-white">
            {isActive ? `R${tournament.currentRound}` : `${totalRounds} Rounds`}
          </div>
          <div className="text-xs text-white/40">
            {isActive ? "Current" : "Total"}
          </div>
        </div>
        <div className="rounded-lg bg-black/30 py-2">
          <div className="text-lg font-black text-white">
            {tournament.matches.filter((m) => m.winnerId).length}
          </div>
          <div className="text-xs text-white/40">Matches</div>
        </div>
      </div>

      {/* Champion (completed only) */}
      {winner && (
        <div className="flex items-center gap-3 rounded-xl border border-[#f5c542]/30 bg-[#f5c542]/5 px-4 py-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#f5c542]/50">
            {winner.logo ? (
              <Image
                src={winner.logo}
                alt={winner.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-black text-[#f5c542]">
                {winner.symbol.slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-[#f5c542] uppercase">
              Champion
            </div>
            <div className="font-black text-white">
              {winner.name}{" "}
              <span className="text-sm font-normal text-white/40">${winner.symbol}</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/bracket/${tournament.id}`}
        className={`block w-full rounded-xl py-2.5 text-center text-sm font-black transition-colors ${
          isActive
            ? "bg-[#f5c542] text-[#0a0a0a] hover:bg-[#f5c542]/90"
            : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white"
        }`}
      >
        {isActive ? "View Bracket & Vote" : "View Final Bracket"}
      </Link>
    </div>
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
