import { NextRequest, NextResponse } from "next/server";
import { verifySharedPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pw } = await req.json();
  const ok = await verifySharedPassword(String(pw ?? ""));
  if (!ok) return new NextResponse("forbidden", { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("wh_gate", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
