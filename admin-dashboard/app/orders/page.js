import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/User";
import "@/models/Listing";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await connectDB();
  const rawOrders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("buyer", "name email phone")
    .populate("seller", "name email businessName")
    .populate("listing", "brand model title price images")
    .lean();

  const orders = rawOrders.map(o => ({
    ...o,
    _id: o._id.toString(),
    createdAt: o.createdAt ? o.createdAt.toISOString() : null,
    deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null
  }));

  return <OrdersClient initialOrders={orders} />;
}
