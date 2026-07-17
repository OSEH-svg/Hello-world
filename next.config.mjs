// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Automatically compresses and converts assets to high-performance modern formats
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  experimental: {
    // Limits bundle bloat by tree-shaking heavy third-party layout and animation libraries
    optimizePackageImports: ['lucide-react', 'lodash', 'framer-motion'],
  },
};

// Wraps the configuration with an interactive visual dependency analyzer
const configWithAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default configWithAnalyzer;