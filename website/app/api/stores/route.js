import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      maintenance: true,
      message: "🛠️ Zyphor Experience Store Locator service is currently under scheduled maintenance."
    },
    { status: 503 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      maintenance: true,
      message: "🛠️ Zyphor Experience Store Locator service is currently under scheduled maintenance."
    },
    { status: 503 }
  );
}
