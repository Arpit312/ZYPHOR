const mongoose = require("mongoose");
const Listing = require("./models/Listing");
const User = require("./models/User");

const ATLAS_URI = "mongodb://zyphorapp_db_user:Arpit%40123@ac-3grfudt-shard-00-00.oqakvy3.mongodb.net:27017,ac-3grfudt-shard-00-01.oqakvy3.mongodb.net:27017,ac-3grfudt-shard-00-02.oqakvy3.mongodb.net:27017/zyphor?ssl=true&replicaSet=atlas-xczv29-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const REAL_DEVICES = [
  {
    title: "Apple iPhone 15 Pro (Natural Titanium)",
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: "256GB",
    ram: "8GB",
    price: 94999,
    originalPrice: 134900,
    conditionGrade: "Pristine",
    city: "Delhi",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "354928109482710",
    description: "Mint pristine Apple iPhone 15 Pro 256GB in Natural Titanium. Battery health 98%, 45-point hardware passed. Includes ZYPHOR 6-Month warranty and genuine braided USB-C cable.",
    verification: {
      trustScore: 99,
      inspectedAt: new Date(),
      technician: "ZYPHOR Precision Lab Delhi",
    },
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray)",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    storage: "256GB",
    ram: "12GB",
    price: 89999,
    originalPrice: 129999,
    conditionGrade: "Pristine",
    city: "Mumbai",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "359102847291048",
    description: "Certified flagship Samsung S24 Ultra with S-Pen intact. Pristine display, no micro-scratches. 100% battery performance rating.",
    verification: {
      trustScore: 98,
      inspectedAt: new Date(),
      technician: "ZYPHOR Precision Lab Mumbai",
    },
  },
  {
    title: "Apple iPhone 14 Pro (Deep Purple)",
    brand: "Apple",
    model: "iPhone 14 Pro",
    storage: "128GB",
    ram: "6GB",
    price: 68500,
    originalPrice: 119900,
    conditionGrade: "Superb",
    city: "Bangalore",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "358291049281740",
    description: "Dynamic Island flagship in signature Deep Purple. Screen original OLED with TrueTone active. Battery health 92%.",
    verification: {
      trustScore: 96,
      inspectedAt: new Date(),
      technician: "ZYPHOR Tech Hub Bangalore",
    },
  },
  {
    title: "OnePlus 12 5G (Silky Black)",
    brand: "OnePlus",
    model: "12",
    storage: "256GB",
    ram: "12GB",
    price: 47999,
    originalPrice: 64999,
    conditionGrade: "Pristine",
    city: "Hyderabad",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "867201948201948",
    description: "Snapdragon 8 Gen 3 beast with Hasselblad 4th Gen cameras. Includes 100W SuperVOOC fast charger.",
    verification: {
      trustScore: 97,
      inspectedAt: new Date(),
      technician: "ZYPHOR Hub Hyderabad",
    },
  },
  {
    title: "Google Pixel 8 Pro (Bay Blue)",
    brand: "Google",
    model: "Pixel 8 Pro",
    storage: "128GB",
    ram: "12GB",
    price: 54999,
    originalPrice: 106999,
    conditionGrade: "Superb",
    city: "Pune",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "351029481920491",
    description: "Pro-level computational photography phone with Google Tensor G3. 7-year OS update guarantee intact.",
    verification: {
      trustScore: 95,
      inspectedAt: new Date(),
      technician: "ZYPHOR Lab Pune",
    },
  },
  {
    title: "Apple iPhone 13 (Midnight)",
    brand: "Apple",
    model: "iPhone 13",
    storage: "128GB",
    ram: "4GB",
    price: 38999,
    originalPrice: 59900,
    conditionGrade: "Good",
    city: "Delhi",
    images: ["https://images.unsplash.com/photo-1574828103433-8752d5b62b08?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "359182049102948",
    description: "Best-selling Apple iPhone 13 in Midnight. Flawless ceramic shield glass, battery health 88%. 6-Month warranty included.",
    verification: {
      trustScore: 94,
      inspectedAt: new Date(),
      technician: "ZYPHOR Precision Lab Delhi",
    },
  },
  {
    title: "Samsung Galaxy S23 5G (Phantom Black)",
    brand: "Samsung",
    model: "Galaxy S23",
    storage: "128GB",
    ram: "8GB",
    price: 42999,
    originalPrice: 74999,
    conditionGrade: "Pristine",
    city: "Chennai",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "354019284019284",
    description: "Compact flagship with Snapdragon 8 Gen 2 for Galaxy. Dynamic AMOLED 2X 120Hz display with zero burn-in.",
    verification: {
      trustScore: 97,
      inspectedAt: new Date(),
      technician: "ZYPHOR South Hub Chennai",
    },
  },
  {
    title: "Xiaomi 14 (White)",
    brand: "Xiaomi",
    model: "14",
    storage: "512GB",
    ram: "12GB",
    price: 46999,
    originalPrice: 69999,
    conditionGrade: "Pristine",
    city: "Delhi",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    listingType: "device",
    imei: "860192840192840",
    description: "Leica Summilux optical lenses with Snapdragon 8 Gen 3. 512GB massive storage.",
    verification: {
      trustScore: 96,
      inspectedAt: new Date(),
      technician: "ZYPHOR Precision Lab Delhi",
    },
  },
];

async function run() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log("Connected to MongoDB Atlas.");

    // Find an existing verified seller user or admin
    let seller = await User.findOne({ role: { $in: ["admin", "retailer", "wholesaler"] } });
    if (!seller) {
      seller = await User.findOne();
    }
    const sellerId = seller ? seller._id : new mongoose.Types.ObjectId();

    const listingsToInsert = REAL_DEVICES.map((d) => ({
      ...d,
      seller: sellerId,
    }));

    const result = await Listing.insertMany(listingsToInsert);
    console.log(`✅ Successfully seeded ${result.length} authentic certified devices into Atlas!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
