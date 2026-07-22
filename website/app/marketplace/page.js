import Container from "@/components/shared/Container";
import ListingCard from "@/components/shared/ListingCard";
import MarketplaceFilters from "./MarketplaceFilters";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const metadata = {
  title: "Marketplace — ZYPHOR",
  description: "Browse AI-verified phones on ZYPHOR."
};

async function getListings(searchParams) {
  try {
    await connectDB();
    const query = { status: "active", listingType: "device" };
    
    if (searchParams?.q) {
      query.$or = [
        { brand: { $regex: searchParams.q, $options: "i" } },
        { model: { $regex: searchParams.q, $options: "i" } }
      ];
    }
    if (searchParams?.brand) query.brand = searchParams.brand;
    if (searchParams?.grade) query.conditionGrade = searchParams.grade;
    if (searchParams?.city) query.city = searchParams.city;
    if (searchParams?.minPrice || searchParams?.maxPrice) {
      query.price = {};
      if (searchParams.minPrice) query.price.$gte = Number(searchParams.minPrice);
      if (searchParams.maxPrice) query.price.$lte = Number(searchParams.maxPrice);
    }
    
    let sort = { createdAt: -1 };
    if (searchParams?.sort === "price_low") sort = { price: 1 };
    if (searchParams?.sort === "price_high") sort = { price: -1 };
    if (searchParams?.sort === "trust") sort = { "verification.trustScore": -1 };
    
    return await Listing.find(query).sort(sort).lean();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams;
  const listings = await getListings(params);
  
  return (
    <section className="py-12 bg-paper min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <MarketplaceFilters current={params || {}} />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-700 text-3xl text-slate-850 mb-6">Verified Phones</h1>
            {listings.length === 0 ? (
              <div className="bg-white rounded-xl border border-black/10 p-10 text-center">
                <p className="text-black/60">No listings found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map(l => (
                  <ListingCard key={l._id.toString()} listing={{ ...l, _id: l._id.toString() }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
