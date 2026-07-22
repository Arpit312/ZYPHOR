import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Container from "@/components/shared/Container";
import PhoneStoreClient from "@/components/shared/PhoneStoreClient";
import { ShieldCheck, Zap, Star, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Buy Phones — ZYPHOR Verified Store",
  description: "Shop AI-verified pre-owned smartphones at the best prices. All phones verified for authenticity, condition and fair pricing — iPhone, Samsung, OnePlus, Xiaomi & more.",
};

const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Xiaomi", "Google", "Realme", "Poco"];
const CONDITIONS = ["All", "Superb", "Good", "Fair"];

async function getPhones({ brand, condition, sort, q } = {}) {
  try {
    await connectDB();
    const query = { status: "active", listingType: "device" };
    if (brand && brand !== "All") query.brand = brand;
    if (condition && condition !== "All") query.conditionGrade = condition;
    if (q) {
      query.$or = [
        { brand: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } }
      ];
    }
    let sortOpt = { createdAt: -1 };
    if (sort === "price_low") sortOpt = { price: 1 };
    if (sort === "price_high") sortOpt = { price: -1 };
    if (sort === "trust") sortOpt = { "verification.trustScore": -1 };
    return await Listing.find(query).sort(sortOpt).lean();
  } catch { return []; }
}

export default async function BuyPhonePage({ searchParams }) {
  const params = await searchParams;
  const phones = await getPhones(params);

  const serialized = phones.map(p => ({
    ...p,
    _id: p._id.toString(),
    seller: p.seller?.toString?.() || null,
  }));

  return (
    <div className="bg-[#0A0A0F] min-h-screen text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#12121E] to-[#0A0A0F] border-b border-white/5">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 text-coral text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" />
            ZYPHOR Certified Pre-Owned Store
          </div>

          <h1 className="font-display font-700 text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Buy Verified Smartphones
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-amber-400 to-coral">
              at Unbeatable Prices
            </span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Every phone AI-verified for condition, authenticity, and fair price.
            Shop with full buyer protection.
          </p>

          {/* Trust Pillars */}
          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-white/60">
            {[
              ["🛡️", "AI Trust Score"],
              ["✓", "IMEI Verified"],
              ["📦", "7-Day Returns"],
              ["💳", "EMI Available"],
              ["⚡", "Same-Day Ship"],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Store Body */}
      <Container className="py-10">
        <PhoneStoreClient
          initialPhones={serialized}
          brands={BRANDS}
          conditions={CONDITIONS}
        />
      </Container>
    </div>
  );
}
