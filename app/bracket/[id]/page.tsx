import type { Metadata } from "next";
import { getTournamentById } from "@/lib/kv";
import BracketClient from "@/components/BracketClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id).catch(() => null);
  const name = tournament?.name ?? "Bracket";
  const isActive = tournament?.status === "active";

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
  return <BracketClient id={id} />;
}
