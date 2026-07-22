const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/zyphor';

const placeholderImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cd294?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop'
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  
  const listings = await db.collection('listings').find({
    $or: [
      { images: { $size: 0 } },
      { images: null },
      { images: { $exists: false } },
      { 'images.0': { $regex: /example\.com/ } },
      { 'images.0': { $regex: /placehold\.co/ } }
    ]
  }).toArray();
  
  console.log('Found', listings.length, 'listings missing images.');
  
  for (const l of listings) {
    const brand = l.brand || '';
    let img = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    if (brand.toLowerCase() === 'apple') img = 'https://images.unsplash.com/photo-1605236453806-6ff3685287f4?q=80&w=600&auto=format&fit=crop';
    else if (brand.toLowerCase() === 'samsung') img = 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop';
    
    await db.collection('listings').updateOne({ _id: l._id }, { $set: { images: [img] } });
  }
  
  console.log('Updated all missing images.');
  process.exit(0);
}
run().catch(console.error);
