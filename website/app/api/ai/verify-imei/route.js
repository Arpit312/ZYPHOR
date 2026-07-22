import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      valid: false,
      maintenance: true,
      message: "🛠️ ZYPHOR AI IMEI & CEIR Verification service is currently under scheduled maintenance. Please check back soon!",
      ceirStatus: "grey"
    },
    { status: 503 } // 503 Service Unavailable / Maintenance
  );
}

export async function GET() {
  return NextResponse.json(
    {
      maintenance: true,
      message: "🛠️ ZYPHOR AI IMEI Verification service is under scheduled maintenance."
    },
    { status: 503 }
  );
}
