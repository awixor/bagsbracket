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
      className={`
        flex flex-col gap-2 p-4 rounded-xl border transition-all
        ${isWinner ? "border-[#f5c542] bg-[#f5c542]/10" : isLeading ? "border-[#f5c542]/50 bg-white/5" : "border-white/10 bg-white/5"}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {token.logo ? (
            <Image
              src={token.logo}
              alt={token.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#f5c542]">
              {token.symbol.slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white truncate">{token.name}</div>
          <div className="text-xs text-white/50">${token.symbol}</div>
        </div>
        {isWinner && (
          <span className="ml-auto text-xs font-bold text-[#f5c542] bg-[#f5c542]/20 px-2 py-0.5 rounded-full">
            WINNER
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-white/40 text-xs">24h Volume</div>
          <div className="text-white font-semibold">
            {formatVolume(volumeInMatch ?? token.volume24h)}
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-white/40 text-xs">Price</div>
          <div className="text-white font-semibold">{formatPrice(token.price)}</div>
        </div>
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-white/40 text-xs">Holders</div>
          <div className="text-white font-semibold">
            {token.holders.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-white/40 text-xs">Market Cap</div>
          <div className="text-white font-semibold">
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
          className="mt-1 w-full text-center py-2 rounded-lg bg-[#f5c542] text-[#0a0a0a] font-bold text-sm hover:bg-[#f5c542]/90 transition-colors"
        >
          Trade to Support
        </a>
      )}
    </div>
  );
}
