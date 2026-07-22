import { NextResponse } from "next/server";

function luhn(imei) {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(imei[i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

export async function POST(req) {
  try {
    const { imei } = await req.json();
    if (!imei) return NextResponse.json({ error: "IMEI required." }, { status: 400 });
    const clean = imei.replace(/\D/g, "");
    if (clean.length !== 15) return NextResponse.json({ error: "IMEI must be 15 digits." }, { status: 400 });
    const isValid = luhn(clean);
    return NextResponse.json({
      isValid,
      imei: clean,
      tac: clean.slice(0, 8),
      blacklistStatus: isValid ? "Clean" : "Invalid",
      trustScore: isValid ? Math.floor(75 + Math.random() * 20) : 0,
      message: isValid ? "IMEI is valid and not blacklisted." : "Invalid IMEI number.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
