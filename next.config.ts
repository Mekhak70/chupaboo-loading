import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Production optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  experimental: {
    optimizeCss: true,
  },
  // Turbopack-friendly remote images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chupaboo.com", // փոխիր քո remote image domain
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Ուղղակի ավելացրու empty turbopack config
  turbopack: {},
};

export default withAnalyzer(nextConfig);
