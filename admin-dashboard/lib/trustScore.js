import User from "@/models/User";
import Order from "@/models/Order";

export async function calculateTrustScore(userId) {
  const orders = await Order.find({
    $or: [{ sellerId: userId }, { buyerId: userId }]
  });

  if (orders.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  for (const order of orders) {
    if (order.status === "delivered" && order.rating) {
      totalScore += order.rating;
      count++;
    }
  }

  const score = count > 0 ? (totalScore / count) * 20 : 0; // Out of 100
  
  const user = await User.findById(userId);
  user.trustRating = Math.min(score, 100);
  user.verifiedSeller = score >= 70;
  await user.save();

  return user.trustRating;
}
