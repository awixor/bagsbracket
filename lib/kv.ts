import { kv } from "@vercel/kv";
import type { TokenRegistration } from "@/types";

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
