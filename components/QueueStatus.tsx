"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TOTAL = 8;

export default function QueueStatus() {
  const [approved, setApproved] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/queue-status")
      .then((r) => r.json())
      .then((d) => setApproved(d.approved ?? 0))
      .catch(() => setApproved(0));
  }, []);

  return (
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      {approved !== null && (
        <div className="mb-3 text-right text-sm font-bold text-[#f5c542]">
          {approved} / {TOTAL} tokens registered
        </div>
      )}

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-[#f5c542] transition-all duration-500"
          style={{
            width:
              approved !== null
                ? `${Math.min((approved / TOTAL) * 100, 100)}%`
                : "0%",
          }}
        />
      </div>

      <Link
        href="/register"
        className="block w-full rounded-xl border border-[#f5c542]/50 py-3 text-center text-sm font-bold text-[#f5c542] transition-colors hover:bg-[#f5c542]/10"
      >
        Register Your Token
      </Link>
    </div>
  );
}
