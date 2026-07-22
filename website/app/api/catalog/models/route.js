import { NextResponse } from "next/server";
import { getModels } from "@/lib/catalog";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    if (!category || !brand) return NextResponse.json({ error: "category and brand required" }, { status: 400 });
    const data = await getModels(category, brand);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
