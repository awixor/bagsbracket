import Image from "next/image";
import Link from "next/link";
import type { Tournament, Token } from "@/types";

function getWinner(tournament: Tournament): Token | null {
  if (tournament.status !== "completed") return null;
  const totalRounds = Math.log2(tournament.size);
  const finalMatch = tournament.matches.find((m) => m.round === totalRounds);

  if (!finalMatch?.winnerId) return null;
  return finalMatch.winnerId === finalMatch.tokenA.mint
    ? finalMatch.tokenA
    : finalMatch.tokenB;
}

export default function HallOfChampions({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  const entries = tournaments
    .map((t) => ({ tournament: t, winner: getWinner(t) }))
    .filter(
      (e): e is { tournament: Tournament; winner: Token } => e.winner !== null,
    );

  console.log(tournaments);

  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-5 text-center text-xs font-bold tracking-widest text-white/40 uppercase">
        Hall of Champions
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map(({ tournament, winner }) => (
          <Link
            key={tournament.id}
            href={`/bracket/${tournament.id}`}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-colors hover:border-[#f5c542]/30 hover:bg-[#f5c542]/5"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#f5c542]/50">
              {winner.logo ? (
                <Image
                  src={winner.logo}
                  alt={winner.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f5c542]/10 text-lg font-black text-[#f5c542]">
                  {winner.symbol.slice(0, 2)}
                </div>
              )}
            </div>

            <div>
              <div className="font-black text-white">{winner.name}</div>
              <div className="text-xs text-white/40">${winner.symbol}</div>
            </div>

            <div className="mt-auto text-xs text-white/25">
              {tournament.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
