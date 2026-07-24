import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, Star, MapPin, Zap, CreditCard, ArrowLeft, CheckCircle, 
  Layers, Wrench, Truck, Award, RefreshCcw, Tag, Cpu, Smartphone, AlertCircle 
} from "lucide-react";
import Container from "@/components/shared/Container";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_PARTS } from "@/lib/partsData";

async function getPart(id) {
  try {
    await connectDB();
    const listing = await Listing.findOne({ _id: id, listingType: "part" })
      .populate("seller", "name businessName city verifiedSeller phone email")
      .lean();
    
    if (listing) {
      return { ...listing, _id: listing._id.toString() };
    }
  } catch (err) {}

  // Fallback to DEFAULT_PARTS
  const fallback = DEFAULT_PARTS.find((p) => p._id === id || p.title.toLowerCase().includes(id.toLowerCase()));
  return fallback || null;
}

async function getSimilarParts(brand, excludeId) {
  try {
    await connectDB();
    const dbParts = await Listing.find({
      brand,
      _id: { $ne: excludeId },
      status: "active",
      listingType: "part"
    }).sort({ createdAt: -1 }).limit(4).lean();

    if (dbParts.length > 0) {
      return dbParts.map(p => ({ ...p, _id: p._id.toString() }));
    }
  } catch (err) {}

  return DEFAULT_PARTS.filter(p => p._id !== excludeId && p.brand.toLowerCase() === brand?.toLowerCase()).slice(0, 4);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const part = await getPart(id);
  if (!part) return { title: "Spare Part Not Found — ZYPHOR" };
  return { 
    title: `${part.title} — ZYPHOR Spare Parts`, 
    description: `Buy ${part.title} for ₹${part.price?.toLocaleString()} on ZYPHOR. AI Verified OEM Spare Part.` 
  };
}

export default async function PartDetailPage({ params }) {
  const { id } = await params;
  const [part, user] = await Promise.all([getPart(id), getSessionUser()]);
  
  if (!part) notFound();

  const similarParts = await getSimilarParts(part.brand, id);

  const trust = part.verification?.trustScore || 95;
  const trustColor = trust >= 80 ? "text-signal-green border-signal-green/30 bg-signal-green/10" 
                   : "text-signal-amber border-signal-amber/30 bg-signal-amber/10";

  const mainImage = part.images?.[0] || "/placeholder-device.svg";

  return (
    <main className="min-h-screen bg-[#07070C] text-white pb-20 pt-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-coral/15 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Back Link */}
        <Link href="/parts" className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-coral transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Spare Parts Catalog
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: High-Res Image Display */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col gap-4">
            <div className="bg-[#0E0E17]/90 border border-white/10 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden min-h-[380px] shadow-2xl group">
              <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mainImage} 
                alt={part.title} 
                className="max-h-[300px] max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-signal-green bg-signal-green/10 border border-signal-green/30 px-3 py-1 rounded-full">
                  100% OEM Tested
                </span>
              </div>
            </div>

            {/* Quality Highlights Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0E0E17]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-signal-green/10 rounded-xl text-signal-green border border-signal-green/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-display font-700 text-white">Genuine Quality</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Tested OEM Pull Part</p>
                </div>
              </div>
              <div className="bg-[#0E0E17]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-coral/10 rounded-xl text-coral border border-coral/20">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-display font-700 text-white">Express Delivery</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Dispatched in 24 Hrs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Part Details & Action */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6">
            
            {/* Title & Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-coral bg-coral/10 border border-coral/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  {part.brand} Spare Part
                </span>
                <span className="text-white/30">•</span>
                <span className="font-mono text-xs text-white/60">Model: {part.model}</span>
              </div>
              <h1 className="font-display font-800 text-2xl sm:text-3xl text-white leading-tight mb-3">
                {part.title}
              </h1>
              
              {/* Trust Badge & Ratings */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono font-bold ${trustColor}`}>
                  <ShieldCheck className="h-4 w-4" /> AI Trust Score: {trust}%
                </div>
                <span className="text-signal-green font-mono font-semibold flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> ZYPHOR Certified Genuine
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-[#0E0E17]/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-baseline gap-4">
                <p className="font-display font-800 text-4xl text-white">₹{part.price?.toLocaleString()}</p>
                {part.originalPrice && (
                  <>
                    <p className="text-white/40 text-lg line-through font-mono">₹{part.originalPrice?.toLocaleString()}</p>
                    <span className="text-signal-green font-mono font-bold text-xs bg-signal-green/10 border border-signal-green/20 px-2.5 py-1 rounded-full">
                      {Math.round(((part.originalPrice - part.price) / part.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-white/50 font-mono">Inclusive of all taxes &amp; secure escrow payment protection.</p>
            </div>

            {/* Specifications Table */}
            <div className="bg-[#0E0E17]/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-700 text-sm text-white uppercase tracking-wider mb-3">Part Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-white/40 block mb-1">Compatible Brand</span>
                  <span className="text-white font-bold">{part.brand}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-white/40 block mb-1">Target Model</span>
                  <span className="text-white font-bold">{part.model}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-white/40 block mb-1">Quality Grade</span>
                  <span className="text-signal-green font-bold">{part.specs?.qualityGrade || "Original OEM"}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-white/40 block mb-1">Warranty</span>
                  <span className="text-coral font-bold">{part.specs?.warranty || "6 Months Warranty"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {part.description && (
              <div className="bg-[#0E0E17]/90 border border-white/10 rounded-2xl p-5">
                <h3 className="font-display font-700 text-sm text-white uppercase tracking-wider mb-2">Description</h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{part.description}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              {user ? (
                <form action="/api/orders" method="POST" className="flex gap-3">
                  <input type="hidden" name="listingId" value={part._id.toString()} />
                  <button type="submit" className="flex-1 bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 py-4 rounded-xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-base">
                    <Zap className="h-5 w-5 fill-white/20" /> Order Part Now (₹{part.price?.toLocaleString()})
                  </button>
                </form>
              ) : (
                <Link href={`/login?redirect=/parts/${part._id}`} className="block w-full text-center bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 py-4 rounded-xl shadow-lg shadow-coral/20 transition-all text-base">
                  Log in to Purchase Part
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Similar Spare Parts */}
        {similarParts.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="font-display font-800 text-2xl text-white mb-2">Similar {part.brand} Spare Parts</h2>
            <p className="text-white/50 text-xs mb-6">Compatible replacement components for your repairs.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {similarParts.map((sp) => (
                <Link 
                  key={sp._id.toString()}
                  href={`/parts/${sp._id}`}
                  className="bg-[#0E0E17]/90 border border-white/10 hover:border-coral/40 rounded-2xl p-4 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={sp.images?.[0] || "/placeholder-device.svg"} 
                      alt={sp.title} 
                      className="h-32 w-full object-contain rounded-xl bg-black/40 p-2 mb-3 group-hover:scale-105 transition-transform" 
                    />
                    <span className="text-[10px] font-mono font-bold text-coral uppercase">{sp.brand}</span>
                    <h3 className="font-display font-700 text-sm text-white line-clamp-2 mt-1 group-hover:text-coral transition-colors">{sp.title}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="font-display font-800 text-lg text-white">₹{sp.price?.toLocaleString()}</span>
                    <span className="text-xs font-bold text-coral group-hover:translate-x-1 transition-transform">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </Container>
    </main>
  );
}
