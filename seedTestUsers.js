const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/zyphor");
  const db = mongoose.connection.db;
  const usersCol = db.collection("users");

  const passHash = await bcrypt.hash("Password@123", 10);

  const testAccounts = [
    { name: "Master Admin", email: "admin@zyphor.in", passwordHash: passHash, role: "admin", userTokenId: "ZYP-USR-ADM001-X", isAccessGranted: true },
    { name: "Vikram Repair Tech", email: "tech@zyphor.in", passwordHash: passHash, role: "technician", userTokenId: "ZYP-USR-TCH002-X", isAccessGranted: true },
    { name: "TechZone Mobile Store", email: "retailer@zyphor.in", passwordHash: passHash, role: "retailer", businessName: "TechZone Mobiles", userTokenId: "ZYP-USR-RTL003-X", isAccessGranted: true },
    { name: "Apex Bulk Distributors", email: "wholesaler@zyphor.in", passwordHash: passHash, role: "wholesaler", businessName: "Apex Distributors", userTokenId: "ZYP-USR-WHL004-X", isAccessGranted: true },
    { name: "Arjun Customer", email: "customer@zyphor.in", passwordHash: passHash, role: "customer", userTokenId: "ZYP-USR-CST005-X", isAccessGranted: true }
  ];

  for (let acc of testAccounts) {
    await usersCol.updateOne({ email: acc.email }, { $set: acc }, { upsert: true });
    console.log(`✓ Test Account Ready -> Email: ${acc.email} | Role: ${acc.role} | Token: ${acc.userTokenId}`);
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
