import Container from "@/components/shared/Container";
import ListingCard from "@/components/shared/ListingCard";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Link from "next/link";
import { Camera, Volume2, PhoneCall, Zap, ShieldAlert, Battery, Smartphone, Layers, Sparkles } from "lucide-react";
import { DEFAULT_PARTS } from "@/lib/partsData";

export const metadata = {
  title: "Mobile Spare Parts & Accessories — ZYPHOR",
  description: "Browse AI-verified mobile spare parts by brand and model — Cameras, Loudspeakers, Calling Earpieces, Motors, Tempered Glass & Batteries."
};

const PART_SECTIONS = [
  { id: "all", label: "All Parts", icon: Layers, desc: "Explore entire verified spare parts catalog" },
  { id: "camera", label: "Camera Module", icon: Camera, desc: "Main back camera & selfie lens" },
  { id: "speaker", label: "Loudspeaker", icon: Volume2, desc: "Bottom loudspeaker ringer module" },
  { id: "calling_speaker", label: "Calling Speaker", icon: PhoneCall, desc: "Top receiver earpiece speaker" },
  { id: "motor", label: "Vibration Motor", icon: Zap, desc: "Taptic engine & linear haptic motor" },
  { id: "tempered_glass", label: "Tempered Glass", icon: ShieldAlert, desc: "9H UV Curved & 11D Matte screen guard" },
  { id: "battery", label: "Original Battery", icon: Battery, desc: "High capacity OEM battery cells" },
  { id: "display", label: "Display Screen", icon: Smartphone, desc: "AMOLED & OLED display folder assembly" }
];

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo"];

// In-memory 15s micro-cache for instantaneous spare parts navigation
let _partsCache = { key: "", data: null, expiresAt: 0 };

async function getParts(searchParams) {
  const cacheKey = JSON.stringify(searchParams || {});
  const now = Date.now();
  if (_partsCache.data && _partsCache.key === cacheKey && _partsCache.expiresAt > now) {
    return _partsCache.data;
  }
  let dbParts = [];
  try {
    await connectDB();
    const query = { status: "active", listingType: "part" };

    if (searchParams?.cat && searchParams.cat !== "all") {
      query.partCategory = searchParams.cat;
    }
    if (searchParams?.brand) {
      query.brand = { $regex: searchParams.brand, $options: "i" };
    }
    if (searchParams?.model) {
      query.model = { $regex: searchParams.model, $options: "i" };
    }
    if (searchParams?.q) {
      query.$or = [
        { brand: { $regex: searchParams.q, $options: "i" } },
        { model: { $regex: searchParams.q, $options: "i" } },
        { title: { $regex: searchParams.q, $options: "i" } }
      ];
    }

    dbParts = await Listing.find(query).sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.error("DB Parts Error:", err);
  }

  // Return real database parts
  const formatted = dbParts.map(p => ({ ...p, _id: p._id.toString() }));
  _partsCache = { key: cacheKey, data: formatted, expiresAt: now + 15000 };
  return formatted;
}

export default async function PartsPage({ searchParams }) {
  const params = await searchParams;
  const activeCat = params?.cat || "all";
  const activeBrand = params?.brand || "";
  const activeModel = params?.model || "";
  const listings = await getParts(params);

  return (
    <div className="min-h-screen bg-[#07070C] text-white relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-coral/15 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <div className="relative border-b border-white/10 bg-[#0E0E17]/60 backdrop-blur-xl">
        <Container className="relative py-12 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 text-coral text-xs font-mono font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Verified OEM Spare Parts Catalog
          </div>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-3">
            Mobile Spare Parts &amp; <span className="text-coral">Accessories</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            100% genuine OEM camera modules, loudspeakers, earpieces, vibration motors, UV tempered glass &amp; high-capacity battery cells.
          </p>
        </Container>
      </div>

      <section className="py-12 relative z-10">
        <Container>
          {/* 1. Category Section Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {PART_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeCat === sec.id;
              return (
                <Link
                  key={sec.id}
                  href={`/parts?cat=${sec.id}${activeBrand ? `&brand=${activeBrand}` : ""}`}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center group ${
                    isSelected
                      ? "bg-coral text-white border-coral shadow-lg shadow-coral/20 scale-[1.03]"
                      : "bg-[#0E0E17]/90 text-white/80 border-white/10 hover:border-coral/50 hover:bg-white/5"
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-1.5 ${isSelected ? "bg-white/20 text-white" : "bg-white/5 text-coral group-hover:scale-110"} transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display font-600 text-xs truncate w-full">{sec.label}</span>
                </Link>
              );
            })}
          </div>

          {/* 2. Interactive Brand Filter Selector */}
          <div className="bg-[#0E0E17]/90 border border-white/10 rounded-2xl p-5 mb-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider font-mono">
                  Filter Brand:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/parts?cat=${activeCat}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      !activeBrand ? "bg-coral text-white shadow-md shadow-coral/20" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    All Brands
                  </Link>
                  {BRANDS.map((b) => (
                    <Link
                      key={b}
                      href={`/parts?cat=${activeCat}&brand=${b}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activeBrand.toLowerCase() === b.toLowerCase()
                          ? "bg-coral text-white shadow-md shadow-coral/20"
                          : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                      }`}
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Active Filters Display */}
              {(activeCat !== "all" || activeBrand || activeModel) && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-white/40">Active Filter:</span>
                  <span className="bg-signal-green/10 text-signal-green border border-signal-green/20 px-3 py-1 rounded-full font-bold">
                    {activeCat.toUpperCase()} {activeBrand ? `• ${activeBrand}` : ""} {activeModel ? `• ${activeModel}` : ""}
                  </span>
                  <Link href="/parts" className="text-coral hover:underline font-semibold ml-1">
                    Reset
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 3. Parts Catalog Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-800 text-xl text-white flex items-center gap-2">
                Available OEM Spare Parts
                <span className="text-xs font-mono bg-coral/10 border border-coral/20 text-coral px-3 py-1 rounded-full font-bold">
                  {listings.length} Parts Available
                </span>
              </h2>
            </div>

            {listings.length === 0 ? (
              <div className="bg-[#0E0E17]/90 rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-white/5 text-coral border border-coral/20">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="font-display font-700 text-lg text-white">No spare parts found for selected filter</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  Try selecting a different brand or category filter above to view available components.
                </p>
                <Link href="/parts" className="inline-block bg-coral text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-coral-dark shadow-lg shadow-coral/20">
                  View All Spare Parts Catalog
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((l) => (
                  <ListingCard key={l._id.toString()} listing={{ ...l, _id: l._id.toString() }} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
