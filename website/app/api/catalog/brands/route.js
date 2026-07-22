import { NextResponse } from "next/server";
import { getBrands } from "@/lib/catalog";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    if (!category) return NextResponse.json({ error: "category required" }, { status: 400 });
    const data = await getBrands(category);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
