import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Star, MapPin, Zap, CreditCard, ArrowLeft, CheckCircle, Smartphone, HardDrive, Cpu, AlertCircle, RefreshCcw, Tag, Truck, Award } from "lucide-react";
import Container from "@/components/shared/Container";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { calculateBill } from "@/lib/billing";
import { getSessionUser } from "@/lib/auth";
import ListingGallery from "@/components/shared/ListingGallery";
import PhoneCard from "@/components/shared/PhoneCard";

async function getListing(id) {
  try {
    await connectDB();
    const listing = await Listing.findById(id)
      .populate("seller", "name businessName city verifiedSeller phone email gstNumber")
      .lean();
    return listing;
  } catch { return null; }
}

async function getSimilarPhones(brand, excludeId) {
  try {
    await connectDB();
    return await Listing.find({
      brand,
      _id: { $ne: excludeId },
      status: "active",
      listingType: "device"
    }).sort({ "verification.trustScore": -1, createdAt: -1 }).limit(4).lean();
  } catch { return []; }
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
  
  const similarPhones = await getSimilarPhones(listing.brand, id);

  const trust = listing.verification?.trustScore || 0;
  const trustColor = trust >= 80 ? "text-emerald-600 border-emerald-200 bg-emerald-50" 
                   : trust >= 50 ? "text-amber-600 border-amber-200 bg-amber-50" 
                   : "text-red-600 border-red-200 bg-red-50";

  return (
    <main className="min-h-screen bg-paper pb-20 pt-6">
      <Container>
        {/* Breadcrumb / Back Link */}
        <Link href="/store" className="inline-flex items-center gap-1.5 text-xs font-mono text-black/50 hover:text-coral transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 xl:col-span-6 h-[450px] md:h-[500px]">
            <ListingGallery images={listing.images || []} brand={listing.brand} model={listing.model} />
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6">
            
            {/* Header / Titles */}
            <div>
              <p className="font-mono text-xs text-coral uppercase tracking-widest mb-2 flex items-center gap-2">
                {listing.brand}
                <span className="text-black/20">•</span>
                <span className="text-black/50">{listing.category}</span>
              </p>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-slate-850 leading-tight mb-2">
                {listing.title || `${listing.brand} ${listing.model}`}
              </h1>
              
              {/* Ratings Mock */}
              <div className="flex items-center gap-3 text-sm">
                 <div className="flex items-center gap-1 bg-signal-green text-white px-2 py-0.5 rounded text-xs font-bold font-mono">
                   4.5 <Star className="h-3 w-3 fill-white" />
                 </div>
                 <span className="text-black/40 font-medium">128 Ratings & 34 Reviews</span>
                 <div className="h-4 w-px bg-black/10"></div>
                 <span className="text-coral font-bold font-mono text-xs flex items-center gap-1">
                   <ShieldCheck className="h-4 w-4" /> ZYPHOR Assured
                 </span>
              </div>
            </div>

            {/* Price & Badges */}
            <div className="flex flex-col gap-4 py-4 border-y border-black/[0.05]">
              <div className="flex items-baseline gap-4">
                <p className="font-display font-800 text-4xl text-slate-850">₹{listing.price?.toLocaleString()}</p>
                {listing.originalPrice && (
                  <>
                    <p className="text-black/30 text-lg line-through">₹{listing.originalPrice?.toLocaleString()}</p>
                    <p className="text-signal-green font-bold text-sm">
                      {Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off
                    </p>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold ${trustColor}`}>
                  <ShieldCheck className="h-4 w-4" /> AI Trust Score: {trust}%
                </div>
                {listing.verification?.status === "verified" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-[11px] font-mono font-bold">
                    <CheckCircle className="h-4 w-4" /> 100% Quality Verified
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 text-slate-850 rounded-xl text-[11px] font-mono font-bold">
                  <RefreshCcw className="h-4 w-4" /> Condition: {listing.conditionGrade}
                </div>
              </div>
            </div>

            {/* Available Offers */}
            <div className="space-y-3">
              <h3 className="font-display font-700 text-slate-850">Available Offers</h3>
              <ul className="space-y-2 text-sm text-slate-850">
                <li className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-signal-green shrink-0 mt-0.5" />
                  <span><strong className="font-semibold">Bank Offer:</strong> 5% Unlimited Cashback on ZYPHOR Axis Bank Credit Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-signal-green shrink-0 mt-0.5" />
                  <span><strong className="font-semibold">Special Price:</strong> Get extra ₹2000 off (price inclusive of cashback/coupon)</span>
                </li>
                {listing.emiEligible && (
                  <li className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong className="font-semibold">No cost EMI:</strong> ₹{(listing.price / 6).toFixed(0)}/month. Standard EMI also available</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Variants (Storage / RAM) UI Mock */}
            <div className="flex gap-6 py-2">
               <div>
                  <p className="text-xs font-semibold text-black/40 mb-2">Storage</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border-2 border-coral rounded-xl text-xs font-bold text-coral bg-coral/5">{listing.storage || "128GB"}</button>
                  </div>
               </div>
               <div>
                  <p className="text-xs font-semibold text-black/40 mb-2">RAM</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border-2 border-coral rounded-xl text-xs font-bold text-coral bg-coral/5">{listing.ram || "6GB"}</button>
                  </div>
               </div>
            </div>

            {/* Quick Delivery / Warranty Highlights */}
            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Truck className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-850">Free Delivery</p>
                    <p className="text-[10px] text-black/40 mt-0.5">By Tomorrow, 10 PM</p>
                  </div>
               </div>
               <div className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><Award className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-850">6 Months Warranty</p>
                    <p className="text-[10px] text-black/40 mt-0.5">Zyphor Certified</p>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {listing.status === "active" ? (
                user ? (
                  <form action="/api/orders" method="POST" className="flex gap-3">
                    <input type="hidden" name="listingId" value={listing._id.toString()} />
                    <button type="submit" className="flex-1 bg-coral hover:bg-coral-dark text-white font-display font-700 py-4 rounded-xl shadow-lg shadow-coral/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring text-lg">
                      <Zap className="h-5 w-5 fill-white/20" /> Buy Now
                    </button>
                  </form>
                ) : (
                  <Link href={`/login?redirect=/marketplace/${listing._id}`} className="block w-full text-center bg-white hover:bg-black/5 border border-black/10 text-slate-850 font-display font-700 py-4 rounded-xl transition-all shadow-sm focus-ring">
                    Log in to Purchase
                  </Link>
                )
              ) : (
                <div className="w-full bg-red-50 border border-red-100 text-red-500 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Item Sold Out
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Detailed Specs & Description */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8">
              <h2 className="font-display font-800 text-2xl text-slate-850 mb-6">Device Highlights</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: HardDrive, label: "Internal Storage", value: listing.storage || "Not specified" },
                  { icon: Cpu, label: "RAM Configuration", value: listing.ram || "Not specified" },
                  { icon: MapPin, label: "Seller Location", value: listing.city || "Pan India Delivery" },
                  { icon: Smartphone, label: "Device Model", value: listing.model }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-paper">
                    <div className="p-2.5 bg-white border border-black/5 rounded-xl text-coral shadow-sm">
                      <spec.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono font-semibold text-black/40 uppercase">{spec.label}</p>
                      <p className="font-semibold text-slate-850 text-sm mt-0.5">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8">
                <h2 className="font-display font-800 text-2xl text-slate-850 mb-4">Detailed Description</h2>
                <p className="text-black/70 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Seller Details Sidebar */}
          <div className="lg:col-span-1">
            {listing.seller && (
              <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="font-display font-700 text-lg text-slate-850 mb-4">Seller Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-coral/10 border border-coral/20 flex items-center justify-center font-display font-800 text-2xl text-coral">
                    {(listing.seller.businessName || listing.seller.name)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-700 text-slate-850">{listing.seller.businessName || listing.seller.name}</p>
                    {listing.seller.verifiedSeller ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-signal-green mt-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Zyphor Verified Seller
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-black/40 mt-1">Standard Seller</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-black/5">
                  <p className="text-xs flex justify-between"><span className="text-black/50">Location:</span> <span className="font-medium text-slate-850">{listing.seller.city || listing.city || "Not specified"}</span></p>
                  <p className="text-xs flex justify-between"><span className="text-black/50">Return Policy:</span> <span className="font-medium text-slate-850">7 Days Return</span></p>
                  <p className="text-xs flex justify-between"><span className="text-black/50">Seller Rating:</span> <span className="font-medium text-slate-850">4.8/5.0</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Phones Section */}
        {similarPhones.length > 0 && (
          <div className="mt-20 border-t border-black/[0.05] pt-12">
            <h2 className="font-display font-800 text-2xl text-slate-850 mb-2">Similar {listing.brand} Phones</h2>
            <p className="text-black/50 text-sm mb-6">Customers who viewed this also liked these devices.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {similarPhones.map(phone => (
                <PhoneCard key={phone._id.toString()} phone={{...phone, _id: phone._id.toString()}} />
              ))}
            </div>
          </div>
        )}

      </Container>
    </main>
  );
}
