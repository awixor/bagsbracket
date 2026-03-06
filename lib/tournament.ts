import type { Token, Match, Tournament } from "@/types";
import { v4 as uuidv4 } from "uuid";

function createMatch(
  tokenA: Token,
  tokenB: Token,
  round: number,
  startTime: Date,
): Match {
  const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
  return {
    id: uuidv4(),
    round,
    tokenA,
    tokenB,
    startTime,
    endTime,
    volumeA: tokenA.volume24h,
    volumeB: tokenB.volume24h,
    votesA: 0,
    votesB: 0,
  };
}

export function seedBracket(tokens: Token[]): Match[] {
  // Sort by holder count descending, pair 1v8, 2v7, 3v6, 4v5
  const sorted = [...tokens].sort((a, b) => b.holders - a.holders);
  const matches: Match[] = [];
  const half = sorted.length / 2;
  const startTime = new Date();

  for (let i = 0; i < half; i++) {
    matches.push(
      createMatch(sorted[i], sorted[sorted.length - 1 - i], 1, startTime),
    );
  }
  return matches;
}

export function resolveMatch(match: Match): string {
  // Volume-based winner, fall back to votes if tied
  if (match.volumeA !== match.volumeB) {
    return match.volumeA > match.volumeB
      ? match.tokenA.mint
      : match.tokenB.mint;
  }
  return match.votesA >= match.votesB ? match.tokenA.mint : match.tokenB.mint;
}

export function advanceRound(tournament: Tournament): Match[] {
  const currentMatches = tournament.matches.filter(
    (m) => m.round === tournament.currentRound && m.winnerId,
  );

  if (currentMatches.length < 2) return [];

  const winners: Token[] = currentMatches.map((m) => {
    return m.winnerId === m.tokenA.mint ? m.tokenA : m.tokenB;
  });

  const nextRound = tournament.currentRound + 1;
  const nextMatches: Match[] = [];
  const startTime = new Date();

  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) {
      nextMatches.push(
        createMatch(winners[i], winners[i + 1], nextRound, startTime),
      );
    }
  }
  return nextMatches;
}

export function createTournament(name: string, tokens: Token[]): Tournament {
  const size = tokens.length as 8 | 16;
  const matches = seedBracket(tokens);
  return {
    id: uuidv4(),
    name,
    size,
    status: "active",
    matches,
    currentRound: 1,
    createdAt: new Date(),
  };
}

export function getTotalRounds(size: 8 | 16): number {
  return Math.log2(size);
}
