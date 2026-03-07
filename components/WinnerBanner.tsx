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

export default function WinnerBanner({
  tournament,
}: {
  tournament: Tournament;
}) {
  const winner = getWinner(tournament);
  if (!winner) return null;

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#f5c542] bg-[#f5c542]/10 p-6 text-center">
      <div className="mb-3 text-xs font-bold tracking-widest text-[#f5c542] uppercase">
        🏆 Tournament Champion
      </div>

      <div className="mb-4 flex flex-col items-center gap-3">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#f5c542]">
          {winner.logo ? (
            <Image
              src={winner.logo}
              alt={winner.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f5c542]/20 text-2xl font-black text-[#f5c542]">
              {winner.symbol.slice(0, 2)}
            </div>
          )}
        </div>
        <div>
          <div className="text-2xl font-black text-white">{winner.name}</div>
          <div className="text-sm text-white/40">${winner.symbol}</div>
        </div>
      </div>

      <div className="mb-1 text-xs text-white/30">{tournament.name}</div>

      <a
        href={`https://bags.fm/${winner.mint}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-xl border border-[#f5c542]/50 px-5 py-2 text-sm font-bold text-[#f5c542] transition-colors hover:bg-[#f5c542]/10"
      >
        Trade ${winner.symbol} on Bags.fm →
      </a>
    </div>
  );
}
