import { NextRequest, NextResponse } from "next/server";
import { getTournamentById, saveTournament, archiveTournament, removeTournamentFromActive } from "@/lib/kv";
import { resolveMatch, advanceRound, getTotalRounds } from "@/lib/tournament";
import { getTokens } from "@/lib/bags";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { tournamentId } = body as { tournamentId?: string };

  if (!tournamentId) {
    return NextResponse.json({ error: "Missing tournamentId." }, { status: 400 });
  }

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  }
  if (tournament.status !== "active") {
    return NextResponse.json(
      { error: "Tournament is not active." },
      { status: 400 },
    );
  }

  const roundMatches = tournament.matches.filter(
    (m) => m.round === tournament.currentRound,
  );
  const unresolved = roundMatches.filter((m) => !m.winnerId);

  if (unresolved.length === 0) {
    return NextResponse.json(
      { error: "All matches in this round are already resolved." },
      { status: 400 },
    );
  }

  // Re-fetch live volumes for all tokens in unresolved matches
  const unresolvedMints = unresolved.flatMap((m) => [m.tokenA.mint, m.tokenB.mint]);
  const uniqueMints = [...new Set(unresolvedMints)];
  const liveTokens = await getTokens(uniqueMints).catch(() => []);

  // Resolve all unresolved matches using fresh volumes
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
    return NextResponse.json({ status: "completed" });
  }

  // Advance to next round
  const nextMatches = advanceRound(updatedTournament);
  await saveTournament({
    ...updatedTournament,
    matches: [...updatedMatches, ...nextMatches],
    currentRound: tournament.currentRound + 1,
  });

  return NextResponse.json({
    status: "advanced",
    nextRound: tournament.currentRound + 1,
  });
}
