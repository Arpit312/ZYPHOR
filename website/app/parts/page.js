import Container from "@/components/shared/Container";
import ListingCard from "@/components/shared/ListingCard";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Link from "next/link";
import { Camera, Volume2, PhoneCall, Zap, ShieldAlert, Battery, Smartphone, Layers, CheckCircle } from "lucide-react";

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

async function getParts(searchParams) {
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

    return await Listing.find(query).sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function PartsPage({ searchParams }) {
  const params = await searchParams;
  const activeCat = params?.cat || "all";
  const activeBrand = params?.brand || "";
  const activeModel = params?.model || "";
  const listings = await getParts(params);

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Banner (DARK) */}
      <div className="relative overflow-hidden bg-ink border-b border-white/5">
        <Container className="relative py-12 text-center z-10">
          <span className="text-[10px] font-mono font-bold text-coral bg-coral/10 border border-coral/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
            Verified Spare Parts Catalog
          </span>
          <h1 className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-3">
            Mobile Spare Parts &amp; <span className="text-coral">Accessories</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Select a part category below, choose your smartphone brand &amp; model to find 100% verified original replacement parts.
          </p>
        </Container>
      </div>

      <section className="py-12">
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
                    ? "bg-slate-850 text-white border-slate-850 shadow-md scale-[1.02]"
                    : "bg-white text-slate-850 border-black/10 hover:border-coral hover:shadow-sm"
                }`}
              >
                <div className={`p-2 rounded-xl mb-1.5 ${isSelected ? "bg-white/10 text-signal-green" : "bg-paper text-coral group-hover:scale-110"} transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display font-600 text-xs truncate w-full">{sec.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 2. Interactive Brand Filter Selector */}
        <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-850 uppercase tracking-wider font-mono">
                Select Brand:
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/parts?cat=${activeCat}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !activeBrand ? "bg-coral text-white shadow-sm" : "bg-paper text-black/60 hover:text-black border border-black/5"
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
                        ? "bg-coral text-white shadow-sm"
                        : "bg-paper text-black/60 hover:text-black border border-black/5"
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
                <span className="text-black/40">Active Filter:</span>
                <span className="bg-signal-green/10 text-signal-green border border-signal-green/20 px-2.5 py-1 rounded-full font-bold">
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-700 text-xl text-slate-850 flex items-center gap-2">
              Available Spare Parts
              <span className="text-xs font-mono bg-black/5 px-2.5 py-0.5 rounded-full text-black/60">
                {listings.length} items
              </span>
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/10 p-12 text-center space-y-3">
              <div className="inline-flex p-4 rounded-full bg-paper text-black/40">
                <Layers className="h-8 w-8" />
              </div>
              <h3 className="font-display font-700 text-lg text-slate-850">No spare parts found</h3>
              <p className="text-xs text-black/55 max-w-sm mx-auto">
                Is brand/category ke liye filhaal listing nahi hai. Reset filter karein ya master admin se add karne ki request karein!
              </p>
              <Link href="/parts" className="inline-block bg-coral text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-coral-dark">
                View All Spare Parts
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
