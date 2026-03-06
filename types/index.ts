export type Token = {
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  volume24h: number;
  price: number;
  holders: number;
  marketCap: number;
};

export type Match = {
  id: string;
  round: number;
  tokenA: Token;
  tokenB: Token;
  startTime: Date;
  endTime: Date;
  winnerId?: string;
  volumeA: number;
  volumeB: number;
  votesA: number;
  votesB: number;
};

export type Tournament = {
  id: string;
  name: string;
  size: 8 | 16;
  status: "registration" | "active" | "completed";
  matches: Match[];
  currentRound: number;
  createdAt: Date;
};

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type TokenRegistration = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  holders: number;
  submittedAt: string;
  submittedBy?: string;
  status: RegistrationStatus;
  reviewedAt?: string;
  tournamentId?: string;
};
