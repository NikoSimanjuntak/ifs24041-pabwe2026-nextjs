import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Turbopack diaktifkan untuk dev & build.
  turbopack: {},

  experimental: {
    // Impor ikon per-modul agar bundle klien tetap kecil.
    optimizePackageImports: ["react-icons/tb"],
  },
};

export default nextConfig;