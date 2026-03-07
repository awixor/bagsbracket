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
  if (all.find((r) => r.mint === reg.mint)) {
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
// Tournament persistence
// ---------------------------------------------------------------------------

const TOURNAMENT_KEY = "active_tournament";

export async function getActiveTournament(): Promise<Tournament | null> {
  return kv.get<Tournament>(TOURNAMENT_KEY);
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  await kv.set(TOURNAMENT_KEY, tournament);
}

export async function updateTournament(
  updater: (t: Tournament) => Tournament,
): Promise<Tournament | null> {
  const current = await getActiveTournament();
  if (!current) return null;
  const updated = updater(current);
  await kv.set(TOURNAMENT_KEY, updated);
  return updated;
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
