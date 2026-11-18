// ─── ZYPHOR: Seed Test Users (All 4 Roles, SAME Email) ──────────────────────
// Run once: node seed-test-users.js
// Creates 4 users with the SAME email + password but different roles.
// Login screen role selector pill determines which account you sign into.

require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const EMAIL = "2005arpitpathak@gmail.com";
const PASSWORD = "12345678";

const TEST_USERS = [
  {
    name: "Arpit (Customer)",
    email: EMAIL,
    role: "customer",
    city: "Delhi",
    phone: "9999900001",
  },
  {
    name: "Arpit (Retailer)",
    email: EMAIL,
    role: "retailer",
    city: "Delhi",
    phone: "9999900002",
    businessName: "Arpit Mobile Hub",
  },
  {
    name: "Arpit (Wholesaler)",
    email: EMAIL,
    role: "wholesaler",
    city: "Delhi",
    phone: "9999900003",
    businessName: "Arpit Wholesale Traders",
  },
  {
    name: "Arpit (Technician)",
    email: EMAIL,
    role: "technician",
    city: "Delhi",
    phone: "9999900004",
    businessName: "Arpit Repair Lab",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    console.log("✅ Connected to MongoDB Atlas\n");

    // Drop old unique index on email (if exists) so same email can have multiple roles
    try {
      await mongoose.connection.db.collection("users").dropIndex("email_1");
      console.log("🔧 Dropped old unique index on email field");
    } catch (e) {
      // Index may not exist, that's fine
      if (e.codeName !== "IndexNotFound") {
        console.log("ℹ️  No old email_1 index to drop (or already dropped)");
      }
    }

    // Also clean up the + alias test users from previous run
    await User.deleteMany({ email: { $regex: /^2005arpitpathak\+/ } });
    console.log("🧹 Cleaned up old +alias test users\n");

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    for (const u of TEST_USERS) {
      // Upsert: match by email + role combo
      const result = await User.findOneAndUpdate(
        { email: u.email.toLowerCase(), role: u.role },
        {
          $set: {
            name: u.name,
            email: u.email.toLowerCase(),
            passwordHash,
            role: u.role,
            city: u.city,
            phone: u.phone,
            businessName: u.businessName || undefined,
            isActive: true,
            verifiedSeller: true,
            trustRating: 5,
            subscription: { plan: "pro", status: "active" },
          },
        },
        { upsert: true, new: true }
      );
      console.log(`✅ ${u.role.toUpperCase().padEnd(12)} → ${u.email}  (ID: ${result._id})`);
    }

    console.log("\n🎉 All 4 test users created successfully!");
    console.log("════════════════════════════════════════════════════════");
    console.log("📧 Email (ALL roles): 2005arpitpathak@gmail.com");
    console.log("🔑 Password (ALL):    12345678");
    console.log("════════════════════════════════════════════════════════");
    console.log("→ Login screen pe role pill select karo (Customer / Retailer / Wholesaler / Technician)");
    console.log("→ Same email + password daalo → role ke hisaab se login ho jayega!");
    console.log("════════════════════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
