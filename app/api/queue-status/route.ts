import { NextResponse } from "next/server";
import { getApprovedCount } from "@/lib/kv";

export async function GET() {
  const approved = await getApprovedCount();
  return NextResponse.json({ approved, total: 8 });
}
