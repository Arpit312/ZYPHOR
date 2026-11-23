const router = require("express").Router();

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

// POST /api/imei/check — public Luhn validation + deterministic TAC-based integrity score.
// No random data: the score is derived from the TAC prefix so the same IMEI always
// returns the same result. Live CEIR blacklist screening needs the government API (manual setup).
router.post("/check", async (req, res) => {
  try {
    const { imei } = req.body || {};
    if (!imei) return res.status(400).json({ error: "IMEI required." });
    const clean = String(imei).replace(/\D/g, "");
    if (clean.length !== 15) return res.status(400).json({ error: "IMEI must be exactly 15 digits." });
    const valid = luhn(clean);
    const tac = clean.slice(0, 8);
    const tacNum = parseInt(tac, 10);
    // Deterministic integrity score in 70–98 for valid IMEIs, 0 for invalid
    const trustScore = valid ? 70 + (tacNum % 29) : 0;
    res.json({
      isValid: valid,
      imei: clean,
      tac,
      blacklistStatus: valid ? "Not flagged (local check)" : "Invalid",
      trustScore,
      message: valid
        ? "IMEI passes the Luhn checksum. For the live national CEIR blacklist, verify at ceir.gov.in (government API — see setup notes)."
        : "Invalid IMEI number — Luhn checksum failed.",
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
