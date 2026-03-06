import { NextResponse } from "next/server";
import { SEED_TOURNAMENT } from "@/data/seed";
import type { Tournament } from "@/types";

// In-memory store for MVP (replace with Vercel KV for production persistence)
let tournamentState: Tournament = SEED_TOURNAMENT;

export async function GET() {
  return NextResponse.json(tournamentState);
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

  const match = tournamentState.matches.find((m) => m.id === matchId);
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

  // Record vote
  tournamentState = {
    ...tournamentState,
    matches: tournamentState.matches.map((m) => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        votesA: tokenMint === m.tokenA.mint ? m.votesA + 1 : m.votesA,
        votesB: tokenMint === m.tokenB.mint ? m.votesB + 1 : m.votesB,
      };
    }),
  };

  return NextResponse.json({ success: true });
}
