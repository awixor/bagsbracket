import type { Tournament } from "@/types";
import { getWinner, getParticipants } from "@/lib/tournament";

export function useTournamentMeta(tournament: Tournament) {
  const isActive = tournament.status === "active";
  const winner = getWinner(tournament);
  const participants = getParticipants(tournament);
  const totalRounds = Math.log2(tournament.size);
  const statusLabel = isActive ? "LIVE" : "COMPLETED";

  return { isActive, winner, participants, totalRounds, statusLabel };
}
