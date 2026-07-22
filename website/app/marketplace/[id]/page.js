import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Star, MapPin, Zap, CreditCard, ArrowLeft, CheckCircle, Smartphone, HardDrive, Cpu, AlertCircle, RefreshCcw } from "lucide-react";
import Container from "@/components/shared/Container";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { calculateBill } from "@/lib/billing";
import { getSessionUser } from "@/lib/auth";
import ListingGallery from "@/components/shared/ListingGallery";

async function getListing(id) {
  try {
    await connectDB();
    const listing = await Listing.findById(id)
      .populate("seller", "name businessName city verifiedSeller phone email gstNumber")
      .lean();
    return listing;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing Not Found" };
  return { title: `${listing.brand} ${listing.model} – ZYPHOR`, description: `Buy ${listing.brand} ${listing.model} for ₹${listing.price?.toLocaleString()} on ZYPHOR.` };
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getSessionUser()]);
  if (!listing) notFound();

  const trust = listing.verification?.trustScore || 0;
  const trustColor = trust >= 80 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
                   : trust >= 50 ? "text-amber-400 border-amber-500/30 bg-amber-500/10" 
                   : "text-red-400 border-red-500/30 bg-red-500/10";
                   
  const bill = calculateBill(listing.price, listing.seller?.gstNumber);

  return (
    <main className="min-h-screen bg-[#07070C] relative overflow-hidden pb-20">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <Container className="relative z-10 pt-10">
        <Link href="/buy-phones" className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-coral hover:bg-coral/10 px-4 py-2 rounded-xl transition-all mb-8 border border-transparent hover:border-coral/20">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 h-[500px]">
            <ListingGallery images={listing.images || []} brand={listing.brand} model={listing.model} />
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header / Titles */}
            <div>
              <p className="font-mono text-xs text-coral uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                {listing.brand}
                <span className="text-white/20">•</span>
                <span className="text-white/50">{listing.category}</span>
              </p>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-white leading-tight">
                {listing.title || `${listing.brand} ${listing.model}`}
              </h1>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${trustColor}`}>
                <ShieldCheck className="h-4 w-4" /> Trust Score: {trust}%
              </div>
              
              {listing.verification?.status === "verified" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-mono font-bold">
                  <Star className="h-4 w-4" /> AI Verified
                </div>
              )}
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-xs font-mono font-bold">
                <RefreshCcw className="h-4 w-4" /> {listing.conditionGrade}
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-[#12121E] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">Final Price</p>
                  <div className="flex items-baseline gap-3">
                    <p className="font-display font-800 text-4xl text-white">₹{listing.price?.toLocaleString()}</p>
                    {listing.originalPrice && (
                      <p className="text-white/30 text-lg line-through">₹{listing.originalPrice?.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                {listing.emiEligible && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono font-bold shrink-0">
                    <CreditCard className="h-4 w-4" /> EMI Available
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {listing.status === "active" ? (
                  user ? (
                    <form action="/api/orders" method="POST">
                      <input type="hidden" name="listingId" value={listing._id.toString()} />
                      <button type="submit" className="w-full bg-gradient-to-r from-coral via-orange-500 to-coral hover:opacity-95 text-white font-display font-700 py-4 rounded-xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Zap className="h-5 w-5" /> Proceed to Buy Now
                      </button>
                    </form>
                  ) : (
                    <Link href={`/login?redirect=/marketplace/${listing._id}`} className="block w-full text-center bg-white/10 hover:bg-white/15 border border-white/10 text-white font-display font-600 py-4 rounded-xl transition-all">
                      Log in to Purchase
                    </Link>
                  )
                ) : (
                  <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Item Sold Out
                  </div>
                )}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: HardDrive, label: "Storage", value: listing.storage },
                { icon: Cpu, label: "RAM", value: listing.ram },
                { icon: MapPin, label: "Location", value: listing.city },
                { icon: Smartphone, label: "Model", value: listing.model }
              ].filter(s => s.value).map((spec, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/[0.05] rounded-xl text-white/50">
                    <spec.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{spec.label}</p>
                    <p className="font-semibold text-white text-sm leading-tight mt-0.5">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Description */}
            {listing.description && (
              <div className="bg-[#12121E] border border-white/[0.07] rounded-3xl p-6">
                <h3 className="font-display font-700 text-white mb-3">Device Description</h3>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {/* Seller Info Card */}
            {listing.seller && (
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.07] rounded-3xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-coral/10 border border-coral/20 flex items-center justify-center font-display font-800 text-xl text-coral">
                    {(listing.seller.businessName || listing.seller.name)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-600 text-white text-sm mb-1">{listing.seller.businessName || listing.seller.name}</p>
                    {listing.seller.verifiedSeller ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-signal-green">
                        <CheckCircle className="h-3 w-3" /> ZYPHOR Verified Seller
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-white/40">Standard Seller</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </Container>
    </main>
  );
}
