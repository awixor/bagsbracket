import { NextResponse } from "next/server";
import { getActiveTournaments } from "@/lib/kv";

export async function GET() {
  const tournaments = await getActiveTournaments().catch(() => []);
  return NextResponse.json(tournaments);
}
