// API route builders — avoids raw string literals scattered across the codebase
export const api = {
  tournament: (id: string) => `/api/tournament/${id}`,
};

// Tournament status constants — matches Tournament["status"] union in types/index.ts
export const TournamentStatus = {
  REGISTRATION: "registration",
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;
