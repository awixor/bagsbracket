const STEPS = [
  {
    icon: "🏆",
    title: "Enter Your Token",
    body: "Token creators submit their Bags.fm mint address to join a bracket. Every 8 approved tokens trigger a new tournament — multiple can run at the same time.",
  },
  {
    icon: "⚡",
    title: "Compete Head-to-Head",
    body: "Tokens face off in 24-hour matches. The winner is decided by a composite score: 85% trading volume growth on Bags.fm and 15% community votes.",
  },
  {
    icon: "🗳️",
    title: "Vote & Trade to Win",
    body: "Connect your wallet to vote once per match. Votes have real influence — a strong vote advantage can flip a close match. Trade on Bags.fm to boost your token's volume score.",
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
