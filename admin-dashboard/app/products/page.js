import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  await connectDB();
  const products = await Listing.find().sort({ createdAt: -1 }).lean();
  
  // Convert _id to string for serialization
  const serializedProducts = products.map(p => ({
    ...p,
    _id: p._id.toString()
  }));

  return <ProductsClient initialProducts={serializedProducts} />;
}
