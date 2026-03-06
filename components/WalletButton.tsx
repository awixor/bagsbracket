"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with wallet adapter
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: "#f5c542",
        color: "#0a0a0a",
        borderRadius: "8px",
        fontWeight: 700,
        fontSize: "14px",
        height: "40px",
        padding: "0 16px",
      }}
    />
  );
}
