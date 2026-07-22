import Container from "@/components/shared/Container";
import Breadcrumb from "@/components/shared/Breadcrumb";
import CategoryCard from "@/components/shared/CategoryCard";
import { getCategories } from "@/lib/catalog";
import { Smartphone } from "lucide-react";

export const metadata = { title: "Buy Verified Phones & Parts – ZYPHOR" };
export const dynamic = "force-dynamic";

export default async function BuyPage() {
  const categories = await getCategories();

  return (
    <section className="py-10">
      <Container>
        <Breadcrumb items={[{ label: "Buy" }]} />
        <h1 className="font-display font-700 text-2xl sm:text-3xl text-slate-850 mb-1">Shop by category</h1>
        <p className="text-black/50 text-sm mb-8">AI-verified phones, tablets and parts from trusted sellers across India.</p>

        {categories.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-black/[0.06]">
            <Smartphone className="h-12 w-12 text-black/10 mx-auto mb-4" />
            <h2 className="font-display font-600 text-lg text-slate-850">No listings yet</h2>
            <p className="text-black/40 text-sm mt-1">Once sellers list devices, categories will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {categories.map(c => <CategoryCard key={c.slug} category={c} />)}
          </div>
        )}
      </Container>
    </section>
  );
}
