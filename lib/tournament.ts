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
    baselineVolumeA: tokenA.volume24h,
    baselineVolumeB: tokenB.volume24h,
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

const VOLUME_FLOOR = 100; // $100 minimum baseline to prevent division by near-zero
const VOLUME_WEIGHT = 0.85;
const VOTE_WEIGHT = 0.15;

export function resolveMatch(match: Match): string {
  // Normalize both signals to a 0–1 share of the matchup, then blend
  const ratioA = match.volumeA / Math.max(match.baselineVolumeA, VOLUME_FLOOR);
  const ratioB = match.volumeB / Math.max(match.baselineVolumeB, VOLUME_FLOOR);
  const totalRatio = ratioA + ratioB;
  const volumeShareA = totalRatio > 0 ? ratioA / totalRatio : 0.5;

  const totalVotes = match.votesA + match.votesB;
  const voteShareA = totalVotes > 0 ? match.votesA / totalVotes : 0.5;

  const scoreA = VOLUME_WEIGHT * volumeShareA + VOTE_WEIGHT * voteShareA;
  const scoreB =
    VOLUME_WEIGHT * (1 - volumeShareA) + VOTE_WEIGHT * (1 - voteShareA);

  return scoreA >= scoreB ? match.tokenA.mint : match.tokenB.mint;
}

// Returns the live composite score for each token as a percentage (0–100)
export function matchScores(match: Match): { scoreA: number; scoreB: number } {
  const ratioA = match.volumeA / Math.max(match.baselineVolumeA, VOLUME_FLOOR);
  const ratioB = match.volumeB / Math.max(match.baselineVolumeB, VOLUME_FLOOR);
  const totalRatio = ratioA + ratioB;
  const volumeShareA = totalRatio > 0 ? ratioA / totalRatio : 0.5;

  const totalVotes = match.votesA + match.votesB;
  const voteShareA = totalVotes > 0 ? match.votesA / totalVotes : 0.5;

  const scoreA = VOLUME_WEIGHT * volumeShareA + VOTE_WEIGHT * voteShareA;
  return {
    scoreA: Math.round(scoreA * 100),
    scoreB: Math.round((1 - scoreA) * 100),
  };
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

export function getWinner(tournament: Tournament): Token | null {
  if (tournament.status !== "completed") return null;
  const totalRounds = Math.log2(tournament.size);
  const finalMatch = tournament.matches.find((m) => m.round === totalRounds);
  if (!finalMatch?.winnerId) return null;
  return finalMatch.winnerId === finalMatch.tokenA.mint
    ? finalMatch.tokenA
    : finalMatch.tokenB;
}

export function getParticipants(tournament: Tournament): Token[] {
  const round1 = tournament.matches.filter((m) => m.round === 1);
  return round1.flatMap((m) => [m.tokenA, m.tokenB]);
}

export function getRoundName(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round + 1;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinals";
  if (fromEnd === 3) return "Quarterfinals";
  return `Round ${round}`;
}
