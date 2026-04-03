import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer'],
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
