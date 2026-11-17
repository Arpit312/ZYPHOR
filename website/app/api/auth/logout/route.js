import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("zyphor_session", "", { path: "/", maxAge: 0 });
  cookieStore.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  cookieStore.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
