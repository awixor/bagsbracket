import { kv } from "@vercel/kv";
import type { TokenRegistration, Tournament } from "@/types";

const QUEUE_KEY = "registration_queue";

export async function getAllRegistrations(): Promise<TokenRegistration[]> {
  const data = await kv.get<TokenRegistration[]>(QUEUE_KEY);
  return data ?? [];
}

export async function getRegistrationsByStatus(
  status: TokenRegistration["status"],
): Promise<TokenRegistration[]> {
  const all = await getAllRegistrations();
  return all.filter((r) => r.status === status);
}

export async function addRegistration(reg: TokenRegistration): Promise<void> {
  const all = await getAllRegistrations();
  const existing = all.filter((r) => r.mint === reg.mint);

  for (const r of existing) {
    if (r.status === "rejected") continue;
    if (r.tournamentId) {
      const tournament = await getTournamentById(r.tournamentId);
      if (tournament?.status === "completed") continue;
      throw new Error("Token in active tournament");
    }
    throw new Error("Token already registered");
  }

  await kv.set(QUEUE_KEY, [...all, reg]);
}

export async function updateRegistrationStatus(
  id: string,
  status: TokenRegistration["status"],
): Promise<void> {
  const all = await getAllRegistrations();
  const updated = all.map((r) =>
    r.id === id ? { ...r, status, reviewedAt: new Date().toISOString() } : r,
  );
  await kv.set(QUEUE_KEY, updated);
}

export async function getApprovedCount(): Promise<number> {
  const approved = await getRegistrationsByStatus("approved");
  return approved.filter((r) => !r.tournamentId).length;
}

// ---------------------------------------------------------------------------
// Tournament persistence — multi-tournament support
// ---------------------------------------------------------------------------

const tournamentKey = (id: string) => `tournament:${id}`;
const ACTIVE_IDS_KEY = "active_tournament_ids";

export async function getActiveTournamentIds(): Promise<string[]> {
  const data = await kv.get<string[]>(ACTIVE_IDS_KEY);
  return data ?? [];
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | null> {
  return kv.get<Tournament>(tournamentKey(id));
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  await kv.set(tournamentKey(tournament.id), tournament);
  // Keep active IDs list in sync
  if (tournament.status === "active") {
    const ids = await getActiveTournamentIds();
    if (!ids.includes(tournament.id)) {
      await kv.set(ACTIVE_IDS_KEY, [...ids, tournament.id]);
    }
  }
}

export async function removeTournamentFromActive(id: string): Promise<void> {
  const ids = await getActiveTournamentIds();
  await kv.set(
    ACTIVE_IDS_KEY,
    ids.filter((i) => i !== id),
  );
}

export async function getActiveTournaments(): Promise<Tournament[]> {
  const ids = await getActiveTournamentIds();
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map((id) => getTournamentById(id)));
  return results.filter((t): t is Tournament => t !== null);
}

// Backward-compat helper: returns first active tournament (used by homepage fallback)
export async function getActiveTournament(): Promise<Tournament | null> {
  const all = await getActiveTournaments();
  return all[0] ?? null;
}

// ---------------------------------------------------------------------------
// Tournament archive
// ---------------------------------------------------------------------------

const ARCHIVE_KEY = "tournaments_archive";

export async function getArchivedTournaments(): Promise<Tournament[]> {
  const data = await kv.get<Tournament[]>(ARCHIVE_KEY);
  return data ?? [];
}

export async function archiveTournament(tournament: Tournament): Promise<void> {
  const archive = await getArchivedTournaments();
  if (archive.find((t) => t.id === tournament.id)) return; // already archived
  await kv.set(ARCHIVE_KEY, [tournament, ...archive]);
}

// ---------------------------------------------------------------------------
// Vote deduplication
// ---------------------------------------------------------------------------

export async function hasVoted(
  matchId: string,
  walletAddress: string,
): Promise<boolean> {
  const key = `match_votes:${matchId}`;
  return (await kv.sismember(key, walletAddress)) === 1;
}

export async function recordVote(
  matchId: string,
  walletAddress: string,
): Promise<void> {
  const key = `match_votes:${matchId}`;
  await kv.sadd(key, walletAddress);
}

export async function markRegistrationsLaunched(
  ids: string[],
  tournamentId: string,
): Promise<void> {
  const all = await getAllRegistrations();
  const updated = all.map((r) =>
    ids.includes(r.id) ? { ...r, tournamentId } : r,
  );
  await kv.set(QUEUE_KEY, updated);
}
