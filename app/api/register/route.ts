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

    // Verify token exists on Bags.fm by checking the pool endpoint
    const bagsRes = await fetch(
      `https://public-api-v2.bags.fm/api/v1/bags-pool-by-token-mint/${mint}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(process.env.BAGS_API_KEY
            ? { "x-api-key": process.env.BAGS_API_KEY }
            : {}),
        },
      },
    );

    if (!bagsRes.ok) {
      return NextResponse.json(
        {
          error:
            "Token not found on Bags.fm. Make sure this is a valid Bags.fm token.",
        },
        { status: 404 },
      );
    }

    // Fetch token metadata from Dexscreener for name/symbol/logo/holders
    const tokens = await getTokens([mint]).catch(() => []);
    const token = tokens[0];

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
        { error: "This token is already in the queue." },
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
