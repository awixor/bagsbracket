import { NextResponse } from "next/server";
import { searchTokens } from "@/lib/bags";
import { EXAMPLE_TOKENS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // If querying from Bags.fm API
  if (query) {
    try {
      const tokens = await searchTokens(query);
      return NextResponse.json(tokens);
    } catch {
      // Fall back to seed tokens filtered by query
      const q = query.toLowerCase();
      const filtered = EXAMPLE_TOKENS.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q),
      );
      return NextResponse.json(filtered);
    }
  }

  // Return seed tokens as default list
  return NextResponse.json(EXAMPLE_TOKENS);
}
