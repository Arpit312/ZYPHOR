import Container from "@/components/shared/Container";
import ListingCard from "@/components/shared/ListingCard";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const metadata = {
  title: "Parts — ZYPHOR",
  description: "Browse AI-verified parts on ZYPHOR."
};

async function getListings(searchParams) {
  try {
    await connectDB();
    const query = { status: "active", listingType: "part" };
    
    if (searchParams?.q) {
      query.$or = [
        { brand: { $regex: searchParams.q, $options: "i" } },
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
  const listings = await getListings(params);
  
  return (
    <section className="py-12 bg-paper min-h-screen">
      <Container>
        <h1 className="font-display font-700 text-3xl text-slate-850 mb-6">Verified Parts</h1>
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-black/10 p-10 text-center">
            <p className="text-black/60">No parts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(l => (
              <ListingCard key={l._id.toString()} listing={{ ...l, _id: l._id.toString() }} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
