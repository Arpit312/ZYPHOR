import { notFound } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/shared/Container";
import Breadcrumb from "@/components/shared/Breadcrumb";
import FilterSidebar from "@/components/shared/FilterSidebar";
import ListingCard from "@/components/shared/ListingCard";
import Pagination from "@/components/shared/Pagination";
import { getListingsForModel } from "@/lib/catalog";
import { ShieldCheck, PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category, brand, model } = await params;
  const data = await getListingsForModel(category, brand, model, {});
  if (!data.category || !data.brand || !data.model) return { title: "Not found – ZYPHOR" };
  return { title: `${data.brand.name} ${data.model.name} – ZYPHOR`, description: `Buy verified ${data.brand.name} ${data.model.name} — AI-checked condition, IMEI verified, trust-scored sellers.` };
}

export default async function ModelPage({ params, searchParams }) {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const filters = await searchParams;
  const { category, brand, model, listings, total, page, totalPages, facets } =
    await getListingsForModel(categorySlug, brandSlug, modelSlug, filters);

  if (!category || !brand || !model) notFound();

  return (
    <section className="py-10">
      <Container>
        <Breadcrumb items={[
          { label: "Buy", href: "/buy" },
          { label: category.name, href: `/buy/${category.slug}` },
          { label: brand.name, href: `/buy/${category.slug}/${brand.slug}` },
          { label: model.name },
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display font-700 text-2xl sm:text-3xl text-slate-850">{brand.name} {model.name}</h1>
            <p className="text-black/50 text-sm mt-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-signal-green" />
              {total} verified listing{total === 1 ? "" : "s"} from trust-scored sellers
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <div className="flex flex-col lg:flex-row gap-6">
            <FilterSidebar facets={facets} />

            <div className="flex-1 min-w-0">
              {listings.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-black/[0.06]">
                  <PackageSearch className="h-12 w-12 text-black/10 mx-auto mb-4" />
                  <h2 className="font-display font-600 text-lg text-slate-850">No listings match your filters</h2>
                  <p className="text-black/40 text-sm mt-1">Try clearing some filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {listings.map(l => <ListingCard key={l._id} listing={l} />)}
                  </div>
                  <Pagination page={page} totalPages={totalPages} />
                </>
              )}
            </div>
          </div>
        </Suspense>
      </Container>
    </section>
  );
}
