const STEPS = [
  {
    icon: "🏆",
    title: "Enter Your Token",
    body: "Token creators submit their Bags.fm token mint address to join the weekly bracket. First 8 tokens fill the bracket.",
  },
  {
    icon: "⚡",
    title: "Compete Head-to-Head",
    body: "Tokens face off in 24-hour matches. The winner is decided by trading volume — whichever token generates more fees on Bags.fm advances.",
  },
  {
    icon: "🎯",
    title: "Win & Get Featured",
    body: "The tournament champion gets featured on the BagsBracket homepage and earns a shareable on-chain trophy card.",
  },
];

export default function HowItWorks() {
  return (
    <div className="w-full">
      <h3 className="mb-6 text-center text-sm font-bold tracking-widest text-white/40 uppercase">
        How it works
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon, title, body }, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <div className="text-3xl">{icon}</div>
            <div>
              <div className="mb-1 font-bold text-white">{title}</div>
              <div className="text-sm leading-relaxed text-white/40">
                {body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
