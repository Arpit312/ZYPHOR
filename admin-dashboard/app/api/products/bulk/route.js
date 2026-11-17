import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const items = body.items || body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Please provide an array of items to upload" }, { status: 400 });
    }

    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    const preparedListings = [];
    const errors = [];

    items.forEach((item, index) => {
      if (!item.brand || !item.model || !item.price) {
        errors.push(`Row ${index + 1}: Missing required brand, model, or price`);
        return;
      }

      const isPart = item.listingType === "part" || item.category?.toLowerCase() === "part" || item.partCategory;
      const title = item.title || `${item.brand} ${item.model}${item.storage ? ` (${item.storage})` : ""}`;
      const price = Number(item.price);

      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${index + 1}: Invalid price ${item.price}`);
        return;
      }

      let images = [];
      if (Array.isArray(item.images) && item.images.length > 0) {
        images = item.images;
      } else if (typeof item.images === "string" && item.images.trim()) {
        images = item.images.split(",").map(s => s.trim());
      } else if (item.image) {
        images = [item.image.trim()];
      } else {
        images = ["/placeholder-device.svg"];
      }

      preparedListings.push({
        seller: adminUser ? adminUser._id : undefined,
        listingType: isPart ? "part" : "device",
        category: isPart ? "Parts" : (item.category || "Smartphone"),
        partCategory: item.partCategory || (isPart ? "display" : undefined),
        brand: String(item.brand).trim(),
        model: String(item.model).trim(),
        title: title.trim(),
        description: item.description || `Verified ${item.brand} ${item.model} uploaded via bulk catalog importer.`,
        price: price,
        originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
        conditionGrade: ["Superb", "Good", "Fair"].includes(item.conditionGrade) ? item.conditionGrade : "Good",
        conditionClaim: item.conditionClaim || "Admin bulk verified authentic",
        storage: item.storage || "128GB",
        ram: item.ram || "8GB",
        city: item.city || "Pan India",
        images: images,
        status: item.status === "inactive" ? "inactive" : "active",
        emiEligible: item.emiEligible !== false,
        verification: {
          status: "verified",
          trustScore: 98,
          components: {
            physicalCondition: 95,
            functionalCondition: 98,
            documentAuthenticity: 100,
            sellerReliability: 100,
            priceFairness: 95,
          },
          aiSummary: "Verified through ZYPHOR Master Catalog Importer",
          flags: []
        }
      });
    });

    if (preparedListings.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid listings found to import",
        validationErrors: errors
      }, { status: 400 });
    }

    const inserted = await Listing.insertMany(preparedListings);

    // Record audit log
    try {
      await AuditLog.create({
        userId: adminUser ? adminUser._id : null,
        userName: adminUser ? adminUser.name : "Admin",
        userEmail: adminUser ? adminUser.email : "admin@zyphor.com",
        role: "admin",
        action: "BULK_CATALOG_UPLOAD",
        entity: "Listing",
        details: `Successfully bulk uploaded ${inserted.length} catalog items into MongoDB. Validation skips: ${errors.length}`,
        status: "SUCCESS"
      });
    } catch (logErr) {
      console.warn("Audit log creation warning:", logErr.message);
    }

    return NextResponse.json({
      success: true,
      count: inserted.length,
      errors: errors,
      message: `Successfully published ${inserted.length} products to live shared catalog!`
    }, { status: 201 });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
