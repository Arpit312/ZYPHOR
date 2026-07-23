import { Users, Package, ShoppingCart } from "lucide-react";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Order from "@/models/Order";

export default async function DashboardOverview() {
  await connectDB();
  
  const totalUsers = await User.countDocuments();
  const totalProducts = await Listing.countDocuments();
  const totalOrders = await Order.countDocuments();

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-emerald-500", bg: "bg-emerald-100" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-100" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Welcome to ZYPHOR Admin</h3>
        <p className="text-gray-600">
          From here you can manage all products, users, and orders across the mobile app and website.
          All changes made here are instantly reflected on both platforms since they share the same database.
        </p>
      </div>
    </div>
  );
}
