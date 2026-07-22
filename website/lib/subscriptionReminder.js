import User from "@/models/User";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function checkSubscriptionExpirations() {
  // Run daily via cron job
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);

  const expiringUsers = await User.find({
    "subscription.endDate": {
      $gte: new Date(),
      $lte: tomorrow
    },
    "subscription.status": "active"
  });

  for (const user of expiringUsers) {
    await sgMail.send({
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "ZYPHOR - Your subscription expires in 7 days",
      html: `
        <h2>Subscription Expiring Soon</h2>
        <p>Your ${user.subscription.plan} plan expires on ${user.subscription.endDate}.</p>
        <p><a href="https://zyphor.in/subscription">Renew Now</a></p>
      `
    });
  }
}

// Call this from a cron job (e.g., Vercel Cron or external service)
