"use client";

import Image from "next/image";
import Link from "next/link";
import WalletButton from "@/components/WalletButton";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <Link href="/">
        <Image src="/logo.png" alt="BagsBracket" width={40} height={40} />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/demo"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          Demo
        </Link>
        <Link
          href="/register"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          Register
        </Link>
        <WalletButton />
      </div>
    </header>
  );
}
