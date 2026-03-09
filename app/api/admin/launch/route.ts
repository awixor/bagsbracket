import { NextRequest, NextResponse } from "next/server";
import {
  getRegistrationsByStatus,
  saveTournament,
  markRegistrationsLaunched,
  getArchivedTournaments,
} from "@/lib/kv";
import { createTournament } from "@/lib/tournament";
import { getTokens } from "@/lib/bags";

const TOURNAMENT_SIZE = 8;

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await getRegistrationsByStatus("approved");
  const unassigned = approved.filter((r) => !r.tournamentId);

  if (unassigned.length < TOURNAMENT_SIZE) {
    return NextResponse.json(
      {
        error: `Need ${TOURNAMENT_SIZE} approved tokens, have ${unassigned.length}.`,
      },
      { status: 400 },
    );
  }

  const selected = unassigned.slice(0, TOURNAMENT_SIZE);
  const mints = selected.map((r) => r.mint);

  // Fetch live token data for seeding
  const tokens = await getTokens(mints).catch(() => []);

  // Fall back to registration metadata for any tokens not found on Dexscreener
  const enriched = selected.map((reg) => {
    const live = tokens.find((t) => t.mint === reg.mint);
    return (
      live ?? {
        mint: reg.mint,
        name: reg.name,
        symbol: reg.symbol,
        logo: reg.logo,
        volume24h: 0,
        price: 0,
        holders: reg.holders,
        marketCap: 0,
      }
    );
  });

  const archived = await getArchivedTournaments().catch(() => []);
  const season = archived.length + 1;
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const name = `Season ${season} — ${month}`;

  const tournament = createTournament(name, enriched);
  await saveTournament(tournament);
  await markRegistrationsLaunched(
    selected.map((r) => r.id),
    tournament.id,
  );

  return NextResponse.json({ success: true, tournamentId: tournament.id });
}
