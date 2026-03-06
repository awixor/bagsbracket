import { NextRequest, NextResponse } from "next/server";
import { getAllRegistrations, updateRegistrationStatus } from "@/lib/kv";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const registrations = await getAllRegistrations();
  return NextResponse.json({ success: true, registrations });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await updateRegistrationStatus(id, status);
  return NextResponse.json({ success: true });
}
