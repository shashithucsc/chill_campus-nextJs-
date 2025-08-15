import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build optimizations
  compress: true,
  
  // Skip static generation for API routes during build
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.vercel.app',
        pathname: '/uploads/**',
      }
    ],
    // Optimize images for deployment
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Build optimizations
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000, // 244KB max chunk size
        },
      };
    }
    return config;
  },
};

export default nextConfig;
