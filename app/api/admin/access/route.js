import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { action, userId, listingId, accessGranted } = await req.json();

    await connectDB();

    if (action === "toggleUserAccess" && userId) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isAccessGranted: Boolean(accessGranted) },
        { new: true }
      ).select("-passwordHash");
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === "deleteListing" && listingId) {
      await Listing.findByIdAndDelete(listingId);
      return NextResponse.json({ success: true, message: "Listing deleted successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
