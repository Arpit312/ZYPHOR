// A small sample of real public TAC (Type Allocation Code) prefixes -> brand.
// The first 8 digits of an IMEI are the TAC, which identifies make + model.
// This is a tiny illustrative sample only, NOT a full GSMA database.
// In production this lookup (and the actual blacklist status) should come from
// the official CEIR / Sanchar Saathi check, or a licensed GSMA Device Check API.
export const TAC_SAMPLE = {
  "35328111": "Apple iPhone",
  "01209900": "Apple iPhone",
  "86234504": "Samsung Galaxy",
  "35922211": "Samsung Galaxy",
  "86872105": "Xiaomi Redmi",
  "86954905": "Xiaomi / Poco",
  "86214803": "OnePlus",
  "35176511": "Vivo",
  "86483803": "Oppo",
  "35407511": "Realme"
};

export function lookupBrandFromTAC(imei) {
  const tac = (imei || "").replace(/\D/g, "").slice(0, 8);
  return TAC_SAMPLE[tac] || null;
}

// Luhn checksum validation — every real IMEI must pass this.
export function isValidImeiFormat(imei) {
  const digits = (imei || "").replace(/\D/g, "");
  if (digits.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(digits[i], 10);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
