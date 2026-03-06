"use client";

import Image from "next/image";
import type { Token } from "@/types";

interface TokenCardProps {
  token: Token;
  isWinner?: boolean;
  isLeading?: boolean;
  volumeInMatch?: number;
  showTradeButton?: boolean;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(2)}`;
}

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  return `$${price.toFixed(4)}`;
}

export default function TokenCard({
  token,
  isWinner = false,
  isLeading = false,
  volumeInMatch,
  showTradeButton = true,
}: TokenCardProps) {
  const tradeUrl = `https://bags.fm/token/${token.mint}`;

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-4 transition-all ${isWinner ? "border-[#f5c542] bg-[#f5c542]/10" : isLeading ? "border-[#f5c542]/50 bg-white/5" : "border-white/10 bg-white/5"} `}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-white/10">
          {token.logo ? (
            <Image
              src={token.logo}
              alt={token.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#f5c542]">
              {token.symbol.slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-bold text-white">{token.name}</div>
          <div className="text-xs text-white/50">${token.symbol}</div>
        </div>
        {isWinner && (
          <span className="ml-auto rounded-full bg-[#f5c542]/20 px-2 py-0.5 text-xs font-bold text-[#f5c542]">
            WINNER
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-black/20 p-2">
          <div className="text-xs text-white/40">24h Volume</div>
          <div className="font-semibold text-white">
            {formatVolume(volumeInMatch ?? token.volume24h)}
          </div>
        </div>
        <div className="rounded-lg bg-black/20 p-2">
          <div className="text-xs text-white/40">Price</div>
          <div className="font-semibold text-white">
            {formatPrice(token.price)}
          </div>
        </div>
        <div className="rounded-lg bg-black/20 p-2">
          <div className="text-xs text-white/40">Holders</div>
          <div className="font-semibold text-white">
            {token.holders.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-black/20 p-2">
          <div className="text-xs text-white/40">Market Cap</div>
          <div className="font-semibold text-white">
            {formatVolume(token.marketCap)}
          </div>
        </div>
      </div>

      {/* Trade CTA */}
      {showTradeButton && (
        <a
          href={tradeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full rounded-lg bg-[#f5c542] py-2 text-center text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
        >
          Trade to Support
        </a>
      )}
    </div>
  );
}
