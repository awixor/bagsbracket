"use client";

import type { Tournament } from "@/types";
import TournamentRow from "@/components/TournamentRow";

export default function TournamentGrid({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  if (tournaments.length === 0) return null;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      {tournaments.map((t) => (
        <TournamentRow key={t.id} tournament={t} />
      ))}
    </div>
  );
}
