/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
