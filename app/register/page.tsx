"use client";

import { useState } from "react";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";

type TokenPreview = {
  name: string;
  symbol: string;
  logo: string;
  holders: number;
};

type Step =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "verified"; token: TokenPreview; mint: string }
  | { kind: "submitting" }
  | { kind: "submitted" }
  | { kind: "error"; message: string };

async function fetchTokenPreview(mint: string): Promise<TokenPreview | null> {
  const res = await fetch(
    `https://api.dexscreener.com/tokens/v1/solana/${mint}`,
  );
  if (!res.ok) return null;
  const pairs: Array<{
    baseToken: { name: string; symbol: string };
    info?: { imageUrl?: string };
  }> = await res.json();
  if (!pairs.length) return null;
  const pair = pairs[0];
  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    logo: pair.info?.imageUrl ?? "",
    holders: 0,
  };
}

export default function RegisterPage() {
  const [mint, setMint] = useState("");
  const [step, setStep] = useState<Step>({ kind: "form" });

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed) return;
    setStep({ kind: "loading" });

    const token = await fetchTokenPreview(trimmed).catch(() => null);
    if (!token) {
      setStep({
        kind: "error",
        message:
          "Token not found. Make sure this is a valid Bags.fm token mint address.",
      });
      return;
    }
    setStep({ kind: "verified", token, mint: trimmed });
  }

  async function handleSubmit(verifiedMint: string) {
    setStep({ kind: "submitting" });
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint: verifiedMint }),
    });
    const data = await res.json();
    if (res.ok) {
      setStep({ kind: "submitted" });
    } else {
      setStep({
        kind: "error",
        message: data.error ?? "Something went wrong.",
      });
    }
  }

  function reset() {
    setMint("");
    setStep({ kind: "form" });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />

      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8">
          {step.kind === "form" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-black text-white">
                  Enter Your Token
                </h1>
                <p className="mt-1 text-sm text-white/40">
                  Join the next BagsBracket tournament
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/70">
                  Token Mint Address
                </label>
                <input
                  type="text"
                  value={mint}
                  onChange={(e) => setMint(e.target.value)}
                  placeholder="Paste your Bags.fm token mint..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5c542]/50 focus:ring-1 focus:ring-[#f5c542]/30"
                />
              </div>

              <button
                type="submit"
                disabled={!mint.trim()}
                className="cursor-pointer rounded-xl bg-[#f5c542] py-3 font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Verify &amp; Submit →
              </button>
            </form>
          )}

          {(step.kind === "loading" || step.kind === "submitting") && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#f5c542]" />
              <p className="text-sm text-white/40">
                {step.kind === "loading"
                  ? "Verifying token on Bags.fm..."
                  : "Submitting..."}
              </p>
            </div>
          )}

          {step.kind === "verified" && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-1 text-xs font-bold tracking-widest text-green-400 uppercase">
                  Token verified on Bags.fm
                </div>
                <h1 className="text-2xl font-black text-white">
                  Confirm Submission
                </h1>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                {step.token.logo ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10">
                    <Image
                      src={step.token.logo}
                      alt={step.token.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-black text-[#f5c542]">
                    {step.token.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white">{step.token.name}</div>
                  <div className="text-sm text-white/40">
                    ${step.token.symbol}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSubmit(step.mint)}
                  className="cursor-pointer rounded-xl bg-[#f5c542] py-3 font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
                >
                  Submit for Review →
                </button>
                <button
                  onClick={reset}
                  className="cursor-pointer rounded-xl border border-white/10 py-3 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step.kind === "submitted" && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="text-5xl">🎉</div>
              <div>
                <h1 className="text-2xl font-black text-white">You&apos;re In!</h1>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  Your token has been approved and will enter the next
                  tournament automatically.
                </p>
              </div>
              <button
                onClick={reset}
                className="cursor-pointer rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                Submit another token
              </button>
            </div>
          )}

          {step.kind === "error" && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-black text-white">
                  Submission Failed
                </h1>
                <p className="mt-2 text-sm text-red-400">{step.message}</p>
              </div>
              <button
                onClick={reset}
                className="cursor-pointer rounded-xl bg-[#f5c542] py-3 font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
