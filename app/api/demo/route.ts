import { NextResponse } from "next/server";
import { getTokens } from "@/lib/bags";
import { createTournament } from "@/lib/tournament";
import { DEMO_TOKEN_MINTS } from "@/lib/demo-tokens";

export async function GET() {
  try {
    const tokens = await getTokens(DEMO_TOKEN_MINTS);

    if (tokens.length < 2) {
      return NextResponse.json(
        { error: "Not enough token data available" },
        { status: 503 },
      );
    }

    // Pad to nearest power of 2 if Dexscreener is missing some tokens
    const size = tokens.length >= 8 ? 8 : 4;
    const tournament = createTournament(
      "BagsBracket Live Demo",
      tokens.slice(0, size),
    );

    return NextResponse.json(tournament);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load demo" },
      { status: 500 },
    );
  }
}
