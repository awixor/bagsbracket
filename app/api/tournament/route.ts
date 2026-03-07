import { NextResponse } from "next/server";
import { getActiveTournament, saveTournament } from "@/lib/kv";
import { SEED_TOURNAMENT } from "@/data/seed";

export async function GET() {
  const tournament = await getActiveTournament().catch(() => null);
  return NextResponse.json(tournament ?? SEED_TOURNAMENT);
}

export async function POST(request: Request) {
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

  const tournament = await getActiveTournament().catch(() => null);
  const state = tournament ?? SEED_TOURNAMENT;

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

  if (tournament) await saveTournament(updated);
  return NextResponse.json({ success: true });
}
