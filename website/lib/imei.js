/**
 * Real-World IMEI Validation & GSMA TAC Lookup Module for ZYPHOR
 */

// 1. Luhn Checksum Algorithm (Official GSMA Standard)
export function isValidLuhnIMEI(imei) {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// 2. GSMA TAC (Type Allocation Code) Database Snapshot for Major Brands
const GSMA_TAC_DATABASE = {
  // Apple iPhones
  "35391810": { brand: "Apple", model: "iPhone 13", country: "USA/India" },
  "35489211": { brand: "Apple", model: "iPhone 14 Pro", country: "USA/India" },
  "35201912": { brand: "Apple", model: "iPhone 15", country: "USA/India" },
  "35601209": { brand: "Apple", model: "iPhone 12", country: "USA/India" },

  // Samsung Galaxy
  "35892100": { brand: "Samsung", model: "Galaxy S23 Ultra", country: "Korea/India" },
  "35129088": { brand: "Samsung", model: "Galaxy S22 5G", country: "Korea/India" },
  "35901233": { brand: "Samsung", model: "Galaxy A54 5G", country: "India" },

  // OnePlus
  "86901200": { brand: "OnePlus", model: "OnePlus 11R 5G", country: "China/India" },
  "86541299": { brand: "OnePlus", model: "OnePlus Nord CE 3", country: "India" },

  // Xiaomi / Redmi
  "86219001": { brand: "Xiaomi", model: "Redmi Note 13 5G", country: "China/India" },
  "86112900": { brand: "Xiaomi", model: "Xiaomi 13 Pro", country: "China/India" },

  // Vivo / Oppo / Realme
  "86341200": { brand: "Vivo", model: "Vivo V29 5G", country: "India" },
  "86459011": { brand: "Oppo", model: "Oppo Reno 10 Pro", country: "India" },
  "86882100": { brand: "Realme", model: "Realme 11 Pro+", country: "India" }
};

export function lookupGSMA(imei) {
  if (!imei || imei.length < 8) return null;
  const tac = imei.slice(0, 8);
  return GSMA_TAC_DATABASE[tac] || null;
}
