import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import Listing from "@/models/Listing";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  // 1. Verify Admin Session
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    // 2. Connect MongoDB
    await connectDB();

    const body = await req.json();
    const { action, userId, listingId, accessGranted } = body;

    // 3. TOGGLE USER ACCESS
    if (action === "toggleUserAccess" && userId) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isAccessGranted: Boolean(accessGranted) },
        { new: true, runValidators: true }
      ).select("-passwordHash").lean();

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found in database." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `User access ${Boolean(accessGranted) ? "granted" : "revoked"} successfully in MongoDB.`,
        user: { ...updatedUser, _id: updatedUser._id.toString() }
      });
    }

    // 4. DELETE LISTING
    if (action === "deleteListing" && listingId) {
      const deleted = await Listing.findByIdAndDelete(listingId).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Listing not found in database." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Listing permanently removed from MongoDB catalog."
      });
    }

    // 5. BLOCK / UNBLOCK LISTING
    if (action === "blockListing" && listingId) {
      await Listing.findByIdAndUpdate(listingId, { status: "blocked" });
      return NextResponse.json({ success: true, message: "Listing blocked in MongoDB." });
    }

    if (action === "unblockListing" && listingId) {
      await Listing.findByIdAndUpdate(listingId, { status: "active" });
      return NextResponse.json({ success: true, message: "Listing unblocked in MongoDB." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (err) {
    console.error("[Admin Access API Error]", err);
    return NextResponse.json({
      error: `MongoDB Operation Failed: ${err.message}. Please check database connection.`
    }, { status: 500 });
  }
}
