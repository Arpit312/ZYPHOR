const mongoose = require("mongoose");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/zyphor");
  const db = mongoose.connection.db;
  const listingsCol = db.collection("listings");
  const usersCol = db.collection("users");

  const admin = await usersCol.findOne({ role: "admin" });
  const sellerId = admin ? admin._id : new mongoose.Types.ObjectId();

  const parts = [
    // 📸 CAMERA
    {
      title: "Apple iPhone 13 Main Back Camera Module (Dual 12MP OIS)",
      brand: "Apple",
      model: "iPhone 13",
      partCategory: "camera",
      category: "Parts",
      listingType: "part",
      price: 3499,
      originalPrice: 4999,
      conditionGrade: "Superb",
      description: "Original OEM pull dual 12MP main camera module with sensor-shift OIS stability for iPhone 13.",
      images: ["/parts/camera-module.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 96, status: "verified" }
    },
    {
      title: "Samsung Galaxy S23 Ultra 200MP Main Camera Sensor",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      partCategory: "camera",
      category: "Parts",
      listingType: "part",
      price: 5999,
      originalPrice: 7999,
      conditionGrade: "Superb",
      description: "Original 200MP ISOCELL HP2 camera module replacement for Samsung Galaxy S23 Ultra.",
      images: ["/parts/camera-module.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 98, status: "verified" }
    },

    // 🔊 LOUDSPEAKER
    {
      title: "OnePlus 11R Bottom Loudspeaker Speaker Ringer Module",
      brand: "OnePlus",
      model: "OnePlus 11R",
      partCategory: "speaker",
      category: "Parts",
      listingType: "part",
      price: 799,
      originalPrice: 1299,
      conditionGrade: "Superb",
      description: "High-clarity stereo bottom loudspeaker assembly replacement for OnePlus 11R 5G.",
      images: ["/parts/loudspeaker.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 92, status: "verified" }
    },

    // 📞 CALLING SPEAKER / EARPIECE
    {
      title: "Apple iPhone 14 Pro Earpiece Receiver Calling Speaker",
      brand: "Apple",
      model: "iPhone 14 Pro",
      partCategory: "calling_speaker",
      category: "Parts",
      listingType: "part",
      price: 899,
      originalPrice: 1499,
      conditionGrade: "Superb",
      description: "Crystal clear call voice earpiece top speaker module for iPhone 14 Pro.",
      images: ["/parts/earpiece-speaker.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 94, status: "verified" }
    },

    // 📳 VIBRATION MOTOR
    {
      title: "iPhone 13 Pro Max Taptic Engine Linear Haptic Motor",
      brand: "Apple",
      model: "iPhone 13 Pro Max",
      partCategory: "motor",
      category: "Parts",
      listingType: "part",
      price: 699,
      originalPrice: 999,
      conditionGrade: "Superb",
      description: "Precision Taptic Engine haptic vibration feedback motor for iPhone 13 Pro Max.",
      images: ["/parts/vibration-motor.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 95, status: "verified" }
    },

    // 🛡️ TEMPERED GLASS
    {
      title: "Samsung Galaxy S23 Ultra UV Curved 9H Tempered Glass",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      partCategory: "tempered_glass",
      category: "Parts",
      listingType: "part",
      price: 399,
      originalPrice: 799,
      conditionGrade: "Superb",
      description: "Full liquid UV glue edge-to-edge 9H hardness tempered glass screen protector.",
      images: ["/parts/tempered-glass.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 90, status: "verified" }
    },
    {
      title: "Xiaomi Redmi Note 13 Pro 11D Edge Matte Tempered Glass",
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro",
      partCategory: "tempered_glass",
      category: "Parts",
      listingType: "part",
      price: 249,
      originalPrice: 499,
      conditionGrade: "Superb",
      description: "Anti-fingerprint matte gaming 11D tempered glass screen guard for Redmi Note 13 Pro.",
      images: ["/parts/tempered-glass.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 89, status: "verified" }
    },

    // 🔋 BATTERY
    {
      title: "Apple iPhone 13 Original 3227mAh Battery Cell",
      brand: "Apple",
      model: "iPhone 13",
      partCategory: "battery",
      category: "Parts",
      listingType: "part",
      price: 2299,
      originalPrice: 3499,
      conditionGrade: "Superb",
      description: "100% capacity original OEM zero-cycle replacement battery cell for iPhone 13.",
      images: ["/parts/battery-cell.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 97, status: "verified" }
    },

    // 📱 DISPLAY FOLDER
    {
      title: "OnePlus 11R 120Hz Fluid AMOLED Curved Display Screen Assembly",
      brand: "OnePlus",
      model: "OnePlus 11R",
      partCategory: "display",
      category: "Parts",
      listingType: "part",
      price: 5499,
      originalPrice: 7999,
      conditionGrade: "Superb",
      description: "Original 1.5K 120Hz curved Fluid AMOLED display folder screen replacement for OnePlus 11R.",
      images: ["/parts/display-screen.svg"],
      seller: sellerId,
      status: "active",
      verification: { trustScore: 98, status: "verified" }
    }
  ];

  for (let p of parts) {
    await listingsCol.updateOne(
      { title: p.title },
      { $set: p },
      { upsert: true }
    );
    console.log(`✓ Real Spare Part Seeded with Image: ${p.title} -> ${p.images[0]}`);
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
