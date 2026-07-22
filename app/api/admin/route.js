import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  const [totalUsers, totalListings, totalOrders, totalSubs, recentUsers, recentOrders] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ status: "active" }),
    Order.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    User.find().sort({ createdAt: -1 }).limit(10).select("name email role createdAt subscription.plan").lean(),
    Order.find().sort({ createdAt: -1 }).limit(10)
      .populate("buyer","name email").populate("listing","brand model price").lean(),
  ]);

  // Revenue calculation
  const orders = await Order.find({ orderStatus: "delivered" }).lean();
  const totalRevenue = orders.reduce((sum, o) => sum + (o.bill?.platformFee || 0), 0);
  const totalGST = orders.reduce((sum, o) => sum + (o.bill?.gstOnFee || 0), 0);

  return NextResponse.json({
    stats: { totalUsers, totalListings, totalOrders, totalSubs, totalRevenue, totalGST },
    recentUsers,
    recentOrders,
  });
}
