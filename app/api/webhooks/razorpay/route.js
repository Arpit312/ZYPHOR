import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const data = JSON.parse(body);
    const event = data.event;

    if (event === "payment.authorized" || event === "payment.captured") {
      await connectDB();

      const razorpayOrderId = data.payload.order.entity.id;
      const razorpayPaymentId = data.payload.payment.entity.id;

      // Find order
      const order = await Order.findOne({ razorpayOrderId });
      if (!order) return NextResponse.json({ success: true }); // Already processed

      // Update order status
      order.status = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      order.paidAt = new Date();
      await order.save();

      // Send confirmation email to seller
      const seller = await User.findById(order.sellerId);
      const buyer = await User.findById(order.buyerId);

      await sgMail.send({
        to: seller.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `ZYPHOR - Payment Received for Order #${order._id}`,
        html: `
          <h2>Payment Confirmed!</h2>
          <p>Buyer: ${buyer.name}</p>
          <p>Amount: ₹${order.amount}</p>
          <p>Status: ${order.status}</p>
          <p>Please ship the item promptly.</p>
        `
      });

      // Send confirmation email to buyer
      await sgMail.send({
        to: buyer.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `ZYPHOR - Your Order #${order._id} Confirmed`,
        html: `
          <h2>Order Confirmed</h2>
          <p>Item: ${order.itemName}</p>
          <p>Amount: ₹${order.amount}</p>
          <p>Your seller will contact you within 24 hours.</p>
        `
      });
    }

    if (event === "payment.failed") {
      const razorpayOrderId = data.payload.order.entity.id;
      await connectDB();
      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        order.status = "payment_failed";
        await order.save();
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
