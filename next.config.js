/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude .d.ts files from webpack processing
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader'
    });
    return config;
  }
};

module.exports = nextConfig;
