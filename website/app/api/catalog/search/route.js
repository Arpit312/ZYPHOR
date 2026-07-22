import { NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/catalog";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const results = await searchSuggestions(q);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
