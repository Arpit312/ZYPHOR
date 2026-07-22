import ProductClientView from "@/components/shared/ProductClientView";

export default function ProductDetailPage({ params }) {
  const slug = params?.slug || "apple-iphone-13";
  return <ProductClientView slug={slug} />;
}
