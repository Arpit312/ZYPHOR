import { notFound } from "next/navigation";
import Container from "@/components/shared/Container";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ModelCard from "@/components/shared/ModelCard";
import { getModels } from "@/lib/catalog";
import { Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category, brand } = await params;
  const data = await getModels(category, brand);
  if (!data.category || !data.brand) return { title: "Not found – ZYPHOR" };
  return { title: `${data.brand.name} ${data.category.name} – ZYPHOR`, description: `Browse verified ${data.brand.name} ${data.category.name} models on ZYPHOR.` };
}

export default async function BrandPage({ params }) {
  const { category: categorySlug, brand: brandSlug } = await params;
  const { category, brand, models } = await getModels(categorySlug, brandSlug);
  if (!category || !brand) notFound();

  return (
    <section className="py-10">
      <Container>
        <Breadcrumb items={[
          { label: "Buy", href: "/buy" },
          { label: category.name, href: `/buy/${category.slug}` },
          { label: brand.name },
        ]} />
        <h1 className="font-display font-700 text-2xl sm:text-3xl text-slate-850 mb-1">{brand.name} {category.name}</h1>
        <p className="text-black/50 text-sm mb-8">{brand.count} active listing{brand.count === 1 ? "" : "s"} across {models.length} model{models.length === 1 ? "" : "s"}.</p>

        {models.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-black/[0.06]">
            <Smartphone className="h-12 w-12 text-black/10 mx-auto mb-4" />
            <h2 className="font-display font-600 text-lg text-slate-850">No models listed yet</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {models.map(m => <ModelCard key={m.slug} categorySlug={category.slug} brandSlug={brand.slug} model={m} />)}
          </div>
        )}
      </Container>
    </section>
  );
}
