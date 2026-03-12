interface RoundProgressProps {
  currentRound: number;
  totalRounds: number;
  size?: "sm" | "md";
}

export default function RoundProgress({
  currentRound,
  totalRounds,
  size = "md",
}: RoundProgressProps) {
  const h = size === "sm" ? "h-1" : "h-1.5";
  const w = size === "sm" ? "flex-1" : "w-6";

  return (
    <div className="flex gap-1">
      {Array.from({ length: totalRounds }).map((_, i) => (
        <div
          key={i}
          className={`${h} ${w} rounded-full ${
            i < currentRound - 1
              ? "bg-[#f5c542]"
              : i === currentRound - 1
                ? "bg-[#f5c542]/50"
                : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
