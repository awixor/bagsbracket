import Image from "next/image";
import type { Token } from "@/types";

interface TokenAvatarProps {
  token: Token;
  /** Size in tailwind units (multiplied by 4 for px). Default 8 = 32px. */
  size?: number;
}

export default function TokenAvatar({ token, size = 8 }: TokenAvatarProps) {
  const px = size * 4;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-white/10"
      style={{ width: px, height: px }}
    >
      {token.logo ? (
        <Image
          src={token.logo}
          alt={token.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-white/60">
          {token.symbol.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
