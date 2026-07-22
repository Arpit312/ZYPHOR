import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Container from "@/components/shared/Container";
import PhoneStoreClient from "@/components/shared/PhoneStoreClient";
import ServicesGrid from "@/components/shared/ServicesGrid";
import StorefrontCarousel from "@/components/shared/StorefrontCarousel";
import { Zap, Wrench } from "lucide-react";

export const metadata = {
  title: "ZYPHOR STORE — Certified Pre-Owned & Services",
  description: "Shop AI-verified pre-owned smartphones, laptops, and accessories at the best prices. ZYPHOR Official Store.",
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

export default async function StorePage({ searchParams }) {
  const params = await searchParams;
  const phones = await getPhones(params);

  const serialized = phones.map(p => ({
    ...p,
    _id: p._id.toString(),
    seller: p.seller?.toString?.() || null,
  }));

  // For the carousel, let's pick the top 8 highest trust score devices
  const premiumPhones = [...serialized].sort((a, b) => (b.verification?.trustScore || 0) - (a.verification?.trustScore || 0)).slice(0, 8);
  
  // For laptops, we show a maintenance placeholder for now, or just an empty carousel
  const laptopPlaceholder = []; // No laptop data yet

  return (
    <div className="bg-[#0A0A0F] min-h-screen text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#12121E] to-[#0A0A0F] border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 text-coral text-[10px] font-mono font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Official ZYPHOR Store
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Everything you need.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-amber-400 to-coral">
              Verified & Guaranteed.
            </span>
          </h1>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            From AI-verified smartphones to premium accessories and expert repair services.
          </p>
        </Container>
      </div>

      <Container>
        {/* Services Grid (Buy, Sell, Repair, Laptops, Parts) */}
        <ServicesGrid />

        {/* Refurbished Phones Carousel */}
        {premiumPhones.length > 0 && (
          <StorefrontCarousel 
            title="Premium Refurbished Devices" 
            subtitle="Highest Trust Scores. Best condition. Handpicked by AI."
            items={premiumPhones}
            viewAllLink="#catalog"
          />
        )}

        {/* Laptops Carousel - Under Maintenance (Requested by User) */}
        <section id="laptops" className="py-12 border-t border-white/5">
           <div className="mb-8">
            <h2 className="font-display font-800 text-3xl text-white">Refurbished Laptops</h2>
            <p className="text-white/40 text-sm mt-1">Premium laptops at unbeatable prices.</p>
          </div>
          
          <div className="bg-[#12121E] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
              <Wrench className="h-8 w-8" />
            </div>
            <h3 className="font-display font-700 text-2xl text-white mb-2">Section Under Maintenance</h3>
            <p className="text-white/50 text-sm max-w-md">
              We are currently restocking and updating our laptop inventory to bring you the best deals. Please check back later!
            </p>
          </div>
        </section>

        {/* Full Filterable Catalog (Moved to bottom) */}
        <section id="catalog" className="py-12 border-t border-white/5">
          <div className="mb-8">
            <h2 className="font-display font-800 text-3xl text-white">Explore All Devices</h2>
            <p className="text-white/40 text-sm mt-1">Filter by brand, condition, and price.</p>
          </div>
          <PhoneStoreClient
            initialPhones={serialized}
            brands={BRANDS}
            conditions={CONDITIONS}
          />
        </section>
      </Container>
    </div>
  );
}
