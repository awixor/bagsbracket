import type { Token, Match, Tournament } from "@/types";

// Example seeded tournament with hardcoded Solana meme tokens
// Used for demo / hackathon submission
const SEED_TOKENS: Token[] = [
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    logo: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cL7Um",
    volume24h: 4_200_000,
    price: 0.000021,
    holders: 842000,
    marketCap: 1_400_000_000,
  },
  {
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    name: "dogwifhat",
    symbol: "WIF",
    logo: "https://bafkreibk3covs5ltyqxa272uodhculbyfbbkznlpicture.ipfs.nftstorage.link",
    volume24h: 3_800_000,
    price: 1.23,
    holders: 620000,
    marketCap: 1_200_000_000,
  },
  {
    mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    name: "cat in a dogs world",
    symbol: "MEW",
    logo: "https://bafkreih7b3v3jatmjhkr4bqp2z3y3l3m2kl7n5a5d4b2n6q7w2q.ipfs.nftstorage.link",
    volume24h: 2_100_000,
    price: 0.0078,
    holders: 380000,
    marketCap: 780_000_000,
  },
  {
    mint: "A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump",
    name: "Fartcoin",
    symbol: "FARTCOIN",
    logo: "https://cf-ipfs.com/ipfs/QmNZGXTFQS4Pu9mKNFgKfXxHcFSY4nf7VuKnhw6kD6pCb",
    volume24h: 1_900_000,
    price: 0.65,
    holders: 290000,
    marketCap: 650_000_000,
  },
  {
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    name: "Popcat",
    symbol: "POPCAT",
    logo: "https://bafkreihpnqtqlyh6c4hgjbdlzrkkz7wkukhqafnk4r5xmqyxaomzfzp2q.ipfs.nftstorage.link",
    volume24h: 1_500_000,
    price: 0.38,
    holders: 240000,
    marketCap: 380_000_000,
  },
  {
    mint: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
    name: "Fwog",
    symbol: "FWOG",
    logo: "https://cf-ipfs.com/ipfs/QmXV1WGjdumSHCDr3pE9X3G2MbvkL1qJVPFJiCKiMhV4fE",
    volume24h: 980_000,
    price: 0.052,
    holders: 180000,
    marketCap: 52_000_000,
  },
  {
    mint: "8Ki8DpuWNxu9VsS3kQbarsCWMcFGWkzzA8pUPto9zBd5",
    name: "Lockin",
    symbol: "LOCK",
    logo: "https://cf-ipfs.com/ipfs/QmYz3nJgDkKq5cDbLxcGVo8T3m1QXhGgJMXqDKoT1aL9jP",
    volume24h: 720_000,
    price: 0.019,
    holders: 140000,
    marketCap: 19_000_000,
  },
  {
    mint: "6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx",
    name: "GOAT",
    symbol: "GOAT",
    logo: "https://bafkreiggp4k7q7nkd3pzjkm2tdqnmhfj5oi4zbvh3bkw7lnomr4xrjyqe.ipfs.nftstorage.link",
    volume24h: 540_000,
    price: 0.13,
    holders: 110000,
    marketCap: 130_000_000,
  },
];

const now = new Date("2026-03-05T00:00:00Z");
const plus24h = (d: Date) => new Date(d.getTime() + 24 * 60 * 60 * 1000);

function makeMatch(
  id: string,
  round: number,
  a: Token,
  b: Token,
  volumeA: number,
  volumeB: number,
  votesA: number,
  votesB: number,
  winnerId?: string,
): Match {
  return {
    id,
    round,
    tokenA: a,
    tokenB: b,
    startTime: now,
    endTime: plus24h(now),
    volumeA,
    volumeB,
    votesA,
    votesB,
    winnerId,
  };
}

// Quarterfinal matches (seeded 1v8, 2v7, 3v6, 4v5)
const [t1, t2, t3, t4, t5, t6, t7, t8] = SEED_TOKENS;

export const SEED_TOURNAMENT: Tournament = {
  id: "tournament-genesis-2026",
  name: "Genesis Cup — March 2026",
  size: 8,
  status: "active",
  currentRound: 2,
  createdAt: new Date("2026-03-04T00:00:00Z"),
  matches: [
    // Round 1 — completed
    makeMatch("m1", 1, t1, t8, 4_200_000, 540_000, 1240, 312, t1.mint),
    makeMatch("m2", 1, t2, t7, 3_800_000, 720_000, 980, 401, t2.mint),
    makeMatch("m3", 1, t3, t6, 2_100_000, 980_000, 760, 590, t3.mint),
    makeMatch("m4", 1, t4, t5, 1_900_000, 1_500_000, 620, 810, t5.mint),
    // Round 2 — active (semifinals)
    makeMatch("m5", 2, t1, t2, 1_820_000, 2_340_000, 0, 0),
    makeMatch("m6", 2, t3, t5, 890_000, 1_100_000, 0, 0),
  ],
};

export const EXAMPLE_TOKENS = SEED_TOKENS;
