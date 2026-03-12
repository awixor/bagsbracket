import Image from "next/image";
import Link from "next/link";
import type { Tournament } from "@/types";
import { getWinner } from "@/lib/tournament";

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

      <div className="mb-4 text-xs text-white/30">{tournament.name}</div>

      <div className="flex flex-col justify-center gap-2">
        <a
          href={`https://bags.fm/${winner.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-[#f5c542]/50 px-5 py-2 text-sm font-bold text-[#f5c542] transition-colors hover:bg-[#f5c542]/10"
        >
          Trade ${winner.symbol} on Bags.fm →
        </a>
        <Link
          href={`/bracket/${tournament.id}`}
          className="rounded-xl border border-white/10 px-5 py-2 text-sm font-bold text-white/50 transition-colors hover:border-white/20 hover:text-white"
        >
          View Tournament
        </Link>
      </div>
    </div>
  );
}
