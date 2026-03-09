import { NextResponse } from "next/server";
import { getTournamentById, saveTournament, hasVoted, recordVote } from "@/lib/kv";
import { SEED_TOURNAMENT } from "@/data/seed";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tournament = await getTournamentById(id).catch(() => null);
  // Fall back to seed only if the ID matches the seed tournament
  if (!tournament) {
    if (id === SEED_TOURNAMENT.id) return NextResponse.json(SEED_TOURNAMENT);
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }
  return NextResponse.json(tournament);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { matchId, tokenMint, walletAddress } = body as {
    matchId: string;
    tokenMint: string;
    walletAddress: string;
  };

  if (!matchId || !tokenMint || !walletAddress) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const tournament = await getTournamentById(id).catch(() => null);
  const state = tournament ?? (id === SEED_TOURNAMENT.id ? SEED_TOURNAMENT : null);

  if (!state) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const match = state.matches.find((m) => m.id === matchId);
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (match.winnerId) {
    return NextResponse.json(
      { error: "Match already resolved" },
      { status: 400 },
    );
  }
  if (tokenMint !== match.tokenA.mint && tokenMint !== match.tokenB.mint) {
    return NextResponse.json(
      { error: "Invalid token for this match" },
      { status: 400 },
    );
  }

  if (tournament && (await hasVoted(matchId, walletAddress))) {
    return NextResponse.json(
      { error: "You already voted in this match" },
      { status: 409 },
    );
  }

  const updated = {
    ...state,
    matches: state.matches.map((m) => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        votesA: tokenMint === m.tokenA.mint ? m.votesA + 1 : m.votesA,
        votesB: tokenMint === m.tokenB.mint ? m.votesB + 1 : m.votesB,
      };
    }),
  };

  if (tournament) {
    await saveTournament(updated);
    await recordVote(matchId, walletAddress);
  }
  return NextResponse.json({ success: true });
}
