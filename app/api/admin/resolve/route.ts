import { NextRequest, NextResponse } from "next/server";
import { getActiveTournament, saveTournament } from "@/lib/kv";
import { resolveMatch, advanceRound, getTotalRounds } from "@/lib/tournament";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await getActiveTournament();
  if (!tournament) {
    return NextResponse.json({ error: "No active tournament." }, { status: 404 });
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

  // Resolve all unresolved matches in the current round
  const updatedMatches = tournament.matches.map((m) => {
    if (m.round !== tournament.currentRound || m.winnerId) return m;
    return { ...m, winnerId: resolveMatch(m) };
  });

  const updatedTournament = { ...tournament, matches: updatedMatches };

  const totalRounds = getTotalRounds(tournament.size);
  const isFinalRound = tournament.currentRound === totalRounds;

  if (isFinalRound) {
    // Tournament complete
    await saveTournament({ ...updatedTournament, status: "completed" });
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
