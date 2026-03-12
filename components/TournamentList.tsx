"use client";

import { useState } from "react";
import type { Tournament } from "@/types";
import TournamentRow from "@/components/TournamentRow";

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
