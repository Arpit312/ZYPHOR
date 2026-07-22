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
      { protocol: "http", hostname: "localhost" }
    ],
  },
  experimental: { serverComponentsExternalPackages: ["mongoose"] },
};
module.exports = nextConfig;
