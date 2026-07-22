import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Star, MapPin, Zap, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
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
  const trustColor = trust >= 80 ? "text-signal-green" : trust >= 50 ? "text-signal-amber" : "text-signal-red";
  const bill = calculateBill(listing.price, listing.seller?.gstNumber);

  return (
    <main className="bg-paper min-h-screen py-10">
      <Container>
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-coral mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Images — left 3 cols */}
          <div className="lg:col-span-3">
            <ListingGallery images={listing.images || []} brand={listing.brand} model={listing.model} />
          </div>

          {/* Info — right 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="font-mono text-xs text-black/40 uppercase tracking-widest">{listing.brand}</p>
              <h1 className="font-display font-700 text-3xl text-slate-850 mt-1">{listing.model}</h1>
              <p className="text-black/40 text-sm mt-1">{listing.category} · {listing.conditionGrade} condition</p>
            </div>

            {/* Trust + condition */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${trust >= 80 ? "bg-signal-green/10 border-signal-green/20 text-signal-green" : trust >= 50 ? "bg-signal-amber/10 border-signal-amber/20 text-signal-amber" : "bg-signal-red/10 border-signal-red/20 text-signal-red"}`}>
                <ShieldCheck className="h-4 w-4" /> Trust {trust}%
              </div>
              {listing.verification?.status === "verified" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-coral/10 border border-coral/20 text-coral rounded-full text-sm font-semibold">
                  <Star className="h-3.5 w-3.5" /> AI Verified
                </div>
              )}
              {listing.emiEligible && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-signal-amber/10 border border-signal-amber/20 text-signal-amber rounded-full text-sm font-semibold">
                  <CreditCard className="h-3.5 w-3.5" /> EMI
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
              <p className="text-black/40 text-sm">Listing Price</p>
              <p className="font-display font-800 text-4xl text-slate-850 mt-1">₹{listing.price?.toLocaleString()}</p>
              {listing.originalPrice && (
                <p className="text-black/30 text-sm mt-1 line-through">₹{listing.originalPrice?.toLocaleString()}</p>
              )}
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5 space-y-3">
              <h3 className="font-display font-600 text-sm text-slate-850">Specifications</h3>
              {[["Storage", listing.storage], ["RAM", listing.ram], ["Condition", listing.conditionGrade], ["City", listing.city]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-black/[0.04] pb-2 last:border-0 last:pb-0">
                  <span className="text-black/40">{k}</span>
                  <span className="font-medium text-slate-850">{v}</span>
                </div>
              ))}
            </div>

            {/* Fee breakdown */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5 space-y-2.5">
              <h3 className="font-display font-600 text-sm text-slate-850">💰 Fee Breakdown</h3>
              {[["Listing Price", `₹${bill.listingPrice?.toLocaleString()}`, ""], ["Platform Fee (3%)", `-₹${bill.platformFee?.toLocaleString()}`, "text-black/40"], ["GST on Fee (18%)", `-₹${bill.gstOnFee?.toLocaleString()}`, "text-black/40"]].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-black/50">{k}</span>
                  <span className={`font-medium ${cls || "text-slate-850"}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t border-black/[0.07] pt-2.5 mt-1">
                <span className="font-semibold text-slate-850">Seller Receives</span>
                <span className="font-700 text-signal-green">₹{bill.sellerReceives?.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-black/30 mt-1">*GST invoice generated on purchase</p>
            </div>

            {/* Buy button */}
            {listing.status === "active" ? (
              user ? (
                <form action="/api/orders" method="POST">
                  <input type="hidden" name="listingId" value={listing._id.toString()} />
                  <button type="submit"
                    className="w-full bg-coral hover:bg-coral-dark text-white font-display font-700 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5" /> Buy Now · ₹{listing.price?.toLocaleString()}
                  </button>
                </form>
              ) : (
                <Link href={`/login?redirect=/marketplace/${listing._id}`}
                  className="block w-full text-center bg-coral hover:bg-coral-dark text-white font-display font-700 py-4 rounded-2xl text-base transition-colors">
                  Log in to Buy
                </Link>
              )
            ) : (
              <div className="w-full bg-black/5 text-black/30 font-700 py-4 rounded-2xl text-center">Sold Out</div>
            )}

            {/* Seller */}
            {listing.seller && (
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <h3 className="font-display font-600 text-sm text-slate-850 mb-3">Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center font-700 text-coral">
                    {(listing.seller.businessName || listing.seller.name)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-850">{listing.seller.businessName || listing.seller.name}</p>
                    <p className="text-xs text-black/40 flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.seller.city || "India"}</p>
                  </div>
                  {listing.seller.verifiedSeller && (
                    <div className="ml-auto flex items-center gap-1 text-xs text-signal-green font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {listing.description && (
          <div className="mt-8 bg-white rounded-2xl border border-black/[0.07] p-6 max-w-2xl">
            <h3 className="font-display font-600 text-slate-850 mb-3">Description</h3>
            <p className="text-black/60 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}
      </Container>
    </main>
  );
}
