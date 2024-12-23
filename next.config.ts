import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // If you need additional aliases, add them here:
      // 'three': 'three', // (not typically necessary these days)
    };
    return config;
  },
};

export default nextConfig;
