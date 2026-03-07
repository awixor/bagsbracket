"use client";

import { useState } from "react";
import Image from "next/image";
import type { TokenRegistration } from "@/types";

const TOURNAMENT_SIZE = 8;

function StatusBadge({ status }: { status: TokenRegistration["status"] }) {
  const styles = {
    pending: "bg-white/10 text-white/50",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function RegistrationRow({
  reg,
  onApprove,
  onReject,
}: {
  reg: TokenRegistration;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      {reg.logo ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10">
          <Image
            src={reg.logo}
            alt={reg.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-[#f5c542]">
          {reg.symbol.slice(0, 2)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{reg.name}</span>
          <span className="text-xs text-white/40">${reg.symbol}</span>
          <StatusBadge status={reg.status} />
        </div>
        <div className="mt-0.5 truncate font-mono text-xs text-white/30">
          {reg.mint}
        </div>
        <div className="mt-0.5 text-xs text-white/30">
          {new Date(reg.submittedAt).toLocaleString()}
        </div>
      </div>

      {reg.status === "pending" && (
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onApprove(reg.id)}
            className="cursor-pointer rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400 transition-colors hover:bg-green-500/30"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(reg.id)}
            className="cursor-pointer rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/30"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [registrations, setRegistrations] = useState<TokenRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin", {
      headers: { "x-admin-secret": secret },
    });

    if (res.status === 401) {
      setError("Invalid admin secret.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setRegistrations(data.registrations ?? []);
    setAuthed(true);
    setLoading(false);
  }

  async function handleLaunch() {
    setLaunching(true);
    setLaunchResult(null);
    const res = await fetch("/api/admin/launch", {
      method: "POST",
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    setLaunchResult({
      ok: res.ok,
      message: res.ok
        ? `Tournament launched! ID: ${data.tournamentId}`
        : data.error ?? "Launch failed.",
    });
    setLaunching(false);
  }

  async function handleReview(id: string, status: "approved" | "rejected") {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return;
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, reviewedAt: new Date().toISOString() }
          : r,
      ),
    );
  }

  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter(
    (r) => r.status === "approved" && !r.tournamentId,
  );
  const rejected = registrations.filter((r) => r.status === "rejected");

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="mb-6 text-xl font-black text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5c542]/50"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !secret}
              className="cursor-pointer rounded-xl bg-[#f5c542] py-3 font-bold text-[#0a0a0a] disabled:opacity-40"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="BagsBracket" width={36} height={36} />
          <span className="text-sm font-bold text-white/40">Admin</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Queue counter */}
        <div className="mb-8 rounded-xl border border-[#f5c542]/30 bg-[#f5c542]/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[#f5c542]">
              {approved.length} / {TOURNAMENT_SIZE} approved tokens
            </div>
            {approved.length >= TOURNAMENT_SIZE && (
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="cursor-pointer rounded-lg bg-[#f5c542] px-4 py-1.5 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5c542]/90 disabled:opacity-50"
              >
                {launching ? "Launching..." : "Launch Tournament"}
              </button>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#f5c542] transition-all duration-500"
              style={{
                width: `${Math.min((approved.length / TOURNAMENT_SIZE) * 100, 100)}%`,
              }}
            />
          </div>
          {launchResult && (
            <p
              className={`mt-2 text-sm font-medium ${launchResult.ok ? "text-green-400" : "text-red-400"}`}
            >
              {launchResult.message}
            </p>
          )}
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold tracking-widest text-white/40 uppercase">
              Pending ({pending.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((r) => (
                <RegistrationRow
                  key={r.id}
                  reg={r}
                  onApprove={(id) => handleReview(id, "approved")}
                  onReject={(id) => handleReview(id, "rejected")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold tracking-widest text-white/40 uppercase">
              Approved ({approved.length})
            </h2>
            <div className="flex flex-col gap-3">
              {approved.map((r) => (
                <RegistrationRow
                  key={r.id}
                  reg={r}
                  onApprove={() => {}}
                  onReject={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold tracking-widest text-white/40 uppercase">
              Rejected ({rejected.length})
            </h2>
            <div className="flex flex-col gap-3">
              {rejected.map((r) => (
                <RegistrationRow
                  key={r.id}
                  reg={r}
                  onApprove={() => {}}
                  onReject={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {registrations.length === 0 && (
          <p className="text-center text-white/30">No registrations yet.</p>
        )}
      </main>
    </div>
  );
}
