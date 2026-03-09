import { NextRequest, NextResponse } from "next/server";
import { addRegistration } from "@/lib/kv";
import { getTokens } from "@/lib/bags";
import type { TokenRegistration } from "@/types";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { mint } = await req.json();

    if (!mint || typeof mint !== "string") {
      return NextResponse.json(
        { error: "Invalid mint address" },
        { status: 400 },
      );
    }

    // All Bags.fm tokens have mints ending in "BAGS"
    if (!mint.endsWith("BAGS")) {
      return NextResponse.json(
        {
          error:
            "Not a Bags.fm token. Bags.fm token mints end in 'BAGS'.",
        },
        { status: 400 },
      );
    }

    // Fetch token metadata from Dexscreener — also acts as existence check
    const tokens = await getTokens([mint]).catch(() => []);
    const token = tokens[0];

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Token not found. Make sure this is a valid Bags.fm token mint address.",
        },
        { status: 404 },
      );
    }

    const registration: TokenRegistration = {
      id: uuid(),
      mint,
      name: token?.name ?? "Unknown",
      symbol: token?.symbol ?? "???",
      logo: token?.logo ?? "",
      holders: token?.holders ?? 0,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    await addRegistration(registration);

    return NextResponse.json({
      success: true,
      token: {
        name: registration.name,
        symbol: registration.symbol,
        logo: registration.logo,
        holders: registration.holders,
      },
      message: "Token submitted for review. Check back soon!",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Token already registered") {
      return NextResponse.json(
        { error: "This token is already in the review queue." },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "Token in active tournament") {
      return NextResponse.json(
        { error: "This token is currently competing in a tournament." },
        { status: 409 },
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
