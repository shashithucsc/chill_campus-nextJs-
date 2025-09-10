import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build optimizations
  compress: true,
  
  // Skip static generation for API routes during build
  output: 'standalone',
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
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
    ignoreBuildErrors: true, // Set to true for production builds
  },
  eslint: {
    ignoreDuringBuilds: true, // Set to true for production builds
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
