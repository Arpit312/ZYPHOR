import { NextResponse } from "next/server";
import { getMegaMenu } from "@/lib/catalog";

export async function GET() {
  try {
    const menu = await getMegaMenu();
    return NextResponse.json({ menu });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
