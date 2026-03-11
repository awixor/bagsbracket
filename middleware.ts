import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
