import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BagsBracket — Token Elimination Tournament on Bags.fm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#f5c542",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Built on Bags.fm · Solana
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          BagsBracket
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          March Madness for Crypto Tokens — head-to-head elimination decided by
          real trading volume
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "12px 32px",
            background: "#f5c542",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 700,
            color: "#0a0a0a",
          }}
        >
          bagsbracket.xyz
        </div>
      </div>
    ),
    size,
  );
}
