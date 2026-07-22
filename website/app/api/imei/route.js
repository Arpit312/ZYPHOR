import { NextResponse } from "next/server";
export async function POST(req) {
  const url = new URL(req.url);
  url.pathname = "/api/imei/check";
  return NextResponse.redirect(url, 307);
}
