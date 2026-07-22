export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zyphor.in";

  const staticRoutes = [
    "",
    "/buy",
    "/sell",
    "/parts",
    "/repair",
    "/stores",
    "/ai-advisor",
    "/verify-imei",
    "/pricing-agent",
    "/subscription",
    "/about",
    "/contact",
    "/support",
    "/cart"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8
  }));

  return staticRoutes;
}
