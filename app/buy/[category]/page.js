import { notFound } from "next/navigation";
import Container from "@/components/shared/Container";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BrandCard from "@/components/shared/BrandCard";
import { getBrands } from "@/lib/catalog";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const { category: cat } = await getBrands(category);
  if (!cat) return { title: "Category not found – ZYPHOR" };
  return { title: `Buy ${cat.name} – ZYPHOR`, description: `Browse verified ${cat.name} listings by brand on ZYPHOR.` };
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const { category, brands } = await getBrands(categorySlug);
  if (!category) notFound();

  return (
    <section className="py-10">
      <Container>
        <Breadcrumb items={[{ label: "Buy", href: "/buy" }, { label: category.name }]} />
        <h1 className="font-display font-700 text-2xl sm:text-3xl text-slate-850 mb-1">{category.name} by brand</h1>
        <p className="text-black/50 text-sm mb-8">{category.count} active listing{category.count === 1 ? "" : "s"} across {brands.length} brand{brands.length === 1 ? "" : "s"}.</p>

        {brands.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-black/[0.06]">
            <Building2 className="h-12 w-12 text-black/10 mx-auto mb-4" />
            <h2 className="font-display font-600 text-lg text-slate-850">No brands listed yet</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {brands.map(b => <BrandCard key={b.slug} categorySlug={category.slug} brand={b} />)}
          </div>
        )}
      </Container>
    </section>
  );
}
