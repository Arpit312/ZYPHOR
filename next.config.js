/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "www.example.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "fdn2.gsmarena.com" },
      { protocol: "https", hostname: "fdn.gsmarena.com" },
      { protocol: "http", hostname: "localhost" }
    ],
  },
  experimental: { serverComponentsExternalPackages: ["mongoose"] },
};
module.exports = nextConfig;
