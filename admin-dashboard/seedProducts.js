const mongoose = require("mongoose");
const Listing = require("./models/Listing").default || require("./models/Listing");

const MONGODB_URI = "mongodb://127.0.0.1:27017/zyphor";

const sampleImages = [
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800", // iPhone
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800", // Samsung
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800", // Phone lying down
  "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=800", // iPhone back
  "https://images.unsplash.com/photo-1574828103433-8752d5b62b08?auto=format&fit=crop&q=80&w=800", // Phone hand
];

const brands = ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi"];
const models = {
  Apple: ["iPhone 13", "iPhone 14 Pro", "iPhone 12", "iPhone 15"],
  Samsung: ["Galaxy S23", "Galaxy S22 Ultra", "Galaxy Z Fold 4", "Galaxy A54"],
  OnePlus: ["11R", "10 Pro", "Nord CE 3", "12"],
  Google: ["Pixel 7", "Pixel 7 Pro", "Pixel 8", "Pixel 6a"],
  Xiaomi: ["13 Pro", "Redmi Note 12", "14 Ultra", "Poco X5"]
};
const cities = ["Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad"];
const grades = ["Superb", "Good", "Fair"];

const generateProducts = () => {
  const products = [];
  const dummySellerId = new mongoose.Types.ObjectId();
  
  for (let i = 0; i < 20; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const modelList = models[brand];
    const model = modelList[Math.floor(Math.random() * modelList.length)];
    
    products.push({
      brand,
      model,
      storage: ["128GB", "256GB", "512GB"][Math.floor(Math.random() * 3)],
      ram: ["6GB", "8GB", "12GB"][Math.floor(Math.random() * 3)],
      price: Math.floor(Math.random() * 40000) + 15000,
      conditionGrade: grades[Math.floor(Math.random() * grades.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      images: [sampleImages[Math.floor(Math.random() * sampleImages.length)]],
      status: "active",
      listingType: "device",
      seller: dummySellerId,
      imei: Math.random().toString().slice(2, 17), // 15 digit random IMEI
      verification: {
        trustScore: Math.floor(Math.random() * 20) + 80 // 80-100
      }
    });
  }
  return products;
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const products = generateProducts();
    await Listing.insertMany(products);
    
    console.log("✅ Successfully seeded 20 products with images!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
