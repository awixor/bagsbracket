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
      <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6 text-center">
        How it works
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {STEPS.map(({ icon, title, body }, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-xl p-5 bg-white/5 flex flex-col gap-3"
          >
            <div className="text-3xl">{icon}</div>
            <div>
              <div className="font-bold text-white mb-1">{title}</div>
              <div className="text-white/40 text-sm leading-relaxed">{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
