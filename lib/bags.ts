import type { Token } from "@/types";

const BAGS_API = "https://api.bags.fm";

export async function getToken(mint: string): Promise<Token> {
  const res = await fetch(`${BAGS_API}/token/${mint}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to fetch token ${mint}`);
  return res.json();
}

export async function getTokenVolume(
  mint: string,
  since: Date,
): Promise<number> {
  const res = await fetch(
    `${BAGS_API}/token/${mint}/volume?since=${since.toISOString()}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) throw new Error(`Failed to fetch volume for ${mint}`);
  const data = await res.json();
  return data.volume;
}

export async function searchTokens(query: string): Promise<Token[]> {
  const res = await fetch(
    `${BAGS_API}/tokens/search?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) throw new Error("Failed to search tokens");
  return res.json();
}

export async function getTopTokens(limit = 8): Promise<Token[]> {
  const res = await fetch(`${BAGS_API}/tokens/top?limit=${limit}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch top tokens");
  return res.json();
}
