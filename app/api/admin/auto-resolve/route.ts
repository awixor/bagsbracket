import { NextRequest, NextResponse } from "next/server";
import {
  getActiveTournaments,
  getTournamentById,
  saveTournament,
  archiveTournament,
  removeTournamentFromActive,
} from "@/lib/kv";
import { resolveMatch, advanceRound, getTotalRounds } from "@/lib/tournament";
import { getTokens } from "@/lib/bags";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tournaments = await getActiveTournaments();

  if (tournaments.length === 0) {
    return NextResponse.json({ message: "No active tournaments." });
  }

  const results: Record<string, string> = {};

  for (const tournament of tournaments) {
    const roundMatches = tournament.matches.filter(
      (m) => m.round === tournament.currentRound,
    );
    const unresolved = roundMatches.filter((m) => !m.winnerId);

    if (unresolved.length === 0) {
      results[tournament.id] = "already_resolved";
      continue;
    }

    // Only resolve if all unresolved matches in this round have passed their endTime
    const allDue = unresolved.every((m) => new Date(m.endTime) <= now);
    if (!allDue) {
      results[tournament.id] = "not_due_yet";
      continue;
    }

    // Re-fetch live volumes for tokens in unresolved matches
    const unresolvedMints = unresolved.flatMap((m) => [
      m.tokenA.mint,
      m.tokenB.mint,
    ]);
    const uniqueMints = [...new Set(unresolvedMints)];
    const liveTokens = await getTokens(uniqueMints).catch(() => []);

    const updatedMatches = tournament.matches.map((m) => {
      if (m.round !== tournament.currentRound || m.winnerId) return m;
      const liveA = liveTokens.find((t) => t.mint === m.tokenA.mint);
      const liveB = liveTokens.find((t) => t.mint === m.tokenB.mint);
      const refreshed = {
        ...m,
        volumeA: liveA?.volume24h ?? m.volumeA,
        volumeB: liveB?.volume24h ?? m.volumeB,
      };
      return { ...refreshed, winnerId: resolveMatch(refreshed) };
    });

    const updatedTournament = { ...tournament, matches: updatedMatches };
    const totalRounds = getTotalRounds(tournament.size);
    const isFinalRound = tournament.currentRound === totalRounds;

    if (isFinalRound) {
      const completed = { ...updatedTournament, status: "completed" as const };
      await saveTournament(completed);
      await archiveTournament(completed);
      await removeTournamentFromActive(tournament.id);
      results[tournament.id] = "completed";
    } else {
      const nextMatches = advanceRound(updatedTournament);
      await saveTournament({
        ...updatedTournament,
        matches: [...updatedMatches, ...nextMatches],
        currentRound: tournament.currentRound + 1,
      });
      results[tournament.id] = `advanced_to_round_${tournament.currentRound + 1}`;
    }
  }

  return NextResponse.json({ results });
}
