export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTournamentById } from "@/lib/kv";
import { TournamentStatus } from "@/lib/routes";
import BracketClient from "@/components/BracketClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id).catch(() => null);
  const name = tournament?.name ?? "Bracket";
  const isActive = tournament?.status === TournamentStatus.ACTIVE;

  return {
    title: name,
    description: `${isActive ? "Live: " : ""}${name} — token elimination bracket on BagsBracket. Vote and trade on Bags.fm to advance your token.`,
    openGraph: {
      title: `${name} | BagsBracket`,
      description: `${isActive ? "🔴 Live now — " : ""}Head-to-head token elimination bracket on Bags.fm. Voting open.`,
    },
  };
}

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData = await getTournamentById(id).catch(() => null);
  if (!initialData) notFound();

  return <BracketClient id={id} initialData={initialData} />;
}