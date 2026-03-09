/**
 * Bags.fm API client
 *
 * Bags.fm public API (https://public-api-v2.bags.fm/api/v1/) covers:
 *   - Pool lookup, trade quotes, fee claiming, token launch
 *   - Auth: x-api-key header (get key at dev.bags.fm)
 *
 * Token analytics (price, volume, marketCap) come from Dexscreener,
 * which is free and public — Bags.fm has no analytics endpoints.
 */

import type { Token } from "@/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BAGS_API = "https://public-api-v2.bags.fm/api/v1";
const DEXSCREENER_API = "https://api.dexscreener.com";
const BAGS_API_KEY = process.env.BAGS_API_KEY ?? "";

function bagsHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(BAGS_API_KEY ? { "x-api-key": BAGS_API_KEY } : {}),
  };
}

// ---------------------------------------------------------------------------
// Dexscreener types (subset)
// ---------------------------------------------------------------------------

interface DexPair {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  price: { usd: string };
  volume: { h24: string; h6: string; h1: string; m5: string };
  priceChange: { h24: number };
  liquidity: { usd: string };
  marketCap: string;
  info?: { imageUrl?: string };
}

// ---------------------------------------------------------------------------
// Dexscreener — token analytics
// ---------------------------------------------------------------------------

/**
 * Fetch up to 30 token mint addresses in one call.
 * Returns the highest-liquidity pair per mint, mapped to our Token type.
 */
export async function getTokens(mints: string[]): Promise<Token[]> {
  if (mints.length === 0) return [];

  // Dexscreener accepts comma-separated addresses (max 30)
  const joined = mints.slice(0, 30).join(",");
  const res = await fetch(`${DEXSCREENER_API}/tokens/v1/solana/${joined}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Dexscreener: failed to fetch tokens");

  const pairs: DexPair[] = await res.json();

  // Group by base token address, pick highest liquidity pair per mint
  const byMint: Record<string, DexPair> = {};
  for (const pair of pairs) {
    if (pair.chainId !== "solana") continue;
    const mint = pair.baseToken.address;
    if (!mints.includes(mint)) continue;
    const existing = byMint[mint];
    const liq = parseFloat(pair.liquidity?.usd ?? "0");
    const existingLiq = parseFloat(existing?.liquidity?.usd ?? "0");
    if (!existing || liq > existingLiq) byMint[mint] = pair;
  }

  return mints
    .filter((m) => byMint[m])
    .map((mint) => dexPairToToken(byMint[mint]));
}

/**
 * Fetch a single token by mint address.
 */
export async function getToken(mint: string): Promise<Token> {
  const tokens = await getTokens([mint]);
  if (tokens.length === 0) throw new Error(`Token not found: ${mint}`);
  return tokens[0];
}

/**
 * Returns 24h volume for a token. Dexscreener only provides rolling windows
 * (m5, h1, h6, h24), so this returns h24 volume regardless of `since`.
 * For precise window volume, you'd need an on-chain indexer.
 */
export async function getTokenVolume(
  mint: string,
  // _since: Date,
): Promise<number> {
  const token = await getToken(mint);

  return token.volume24h;
}

/**
 * Search tokens on Dexscreener by name/symbol, filtered to Solana.
 */
export async function searchTokens(query: string): Promise<Token[]> {
  const res = await fetch(
    `${DEXSCREENER_API}/latest/dex/search?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) throw new Error("Dexscreener: search failed");

  const data: { pairs: DexPair[] } = await res.json();
  const solanaPairs = (data.pairs ?? []).filter((p) => p.chainId === "solana");

  // Deduplicate by base token mint, keep highest liquidity
  const byMint: Record<string, DexPair> = {};
  for (const pair of solanaPairs) {
    const mint = pair.baseToken.address;
    const liq = parseFloat(pair.liquidity?.usd ?? "0");
    const existingLiq = parseFloat(byMint[mint]?.liquidity?.usd ?? "0");
    if (!byMint[mint] || liq > existingLiq) byMint[mint] = pair;
  }

  return Object.values(byMint).map(dexPairToToken);
}

// ---------------------------------------------------------------------------
// Bags.fm API — pool & quote helpers
// ---------------------------------------------------------------------------

export interface BagsPool {
  tokenMint: string;
  meteoraPoolKey: string;
  dammV2PoolKey?: string;
}

/**
 * Fetch the Bags pool for a given token mint.
 * Endpoint: GET /bags-pool-by-token-mint/:mint
 */
export async function getBagsPool(mint: string): Promise<BagsPool | null> {
  if (!BAGS_API_KEY) return null;
  const res = await fetch(`${BAGS_API}/bags-pool-by-token-mint/${mint}`, {
    headers: bagsHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

// ---------------------------------------------------------------------------
// Bags.fm API — fee-based match scoring
// ---------------------------------------------------------------------------

export interface TokenLifetimeFees {
  mint: string;
  lifetimeFees: number; // cumulative fees in SOL; 1% of all trading volume
}

/**
 * Fetch cumulative lifetime fees for a token.
 * Since creators earn 1% of all trading volume, fees are a direct proxy for volume.
 * Endpoint: GET /token-lifetime-fees/:mint
 */
export async function getTokenLifetimeFees(
  mint: string,
): Promise<TokenLifetimeFees | null> {
  if (!BAGS_API_KEY) return null;
  const res = await fetch(`${BAGS_API}/token-lifetime-fees/${mint}`, {
    headers: bagsHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

export interface TokenClaimEvent {
  timestamp: string; // ISO date
  amount: number; // fees claimed in this event
}

/**
 * Fetch individual claim events with timestamps.
 * Use to calculate fee delta within a specific match time window.
 * Endpoint: GET /token-claim-events/:mint
 */
export async function getTokenClaimEvents(
  mint: string,
): Promise<TokenClaimEvent[]> {
  if (!BAGS_API_KEY) return [];
  const res = await fetch(`${BAGS_API}/token-claim-events/${mint}`, {
    headers: bagsHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

/**
 * Calculate fee delta (match volume proxy) for a token within a time window.
 * Higher delta = more trading activity during the match.
 */
export async function getMatchVolumeDelta(
  mint: string,
  startTime: Date,
  endTime: Date,
): Promise<number> {
  const events = await getTokenClaimEvents(mint);
  return events
    .filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= startTime.getTime() && t <= endTime.getTime();
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export interface TradeQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: unknown[];
}

/**
 * Get a swap quote from Bags.fm.
 * Endpoint: GET /trade-quote
 */
export async function getTradeQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps = 50,
): Promise<TradeQuote> {
  if (!BAGS_API_KEY) throw new Error("BAGS_API_KEY not set");
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: String(amount),
    slippageMode: "fixed",
    slippageBps: String(slippageBps),
  });
  const res = await fetch(`${BAGS_API}/trade-quote?${params}`, {
    headers: bagsHeaders(),
  });
  if (!res.ok) throw new Error("Bags: trade quote failed");
  return res.json();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function dexPairToToken(pair: DexPair): Token {
  return {
    mint: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    logo: pair.info?.imageUrl ?? "",
    volume24h: parseFloat(pair.volume?.h24 ?? "0"),
    price: parseFloat(pair.price?.usd ?? "0"),
    holders: 0, // Not available from Dexscreener; enrich separately if needed
    marketCap: parseFloat(pair.marketCap ?? "0"),
  };
}
