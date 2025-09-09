import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable experimental features for better compatibility
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ensure proper ESLint handling
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  env: {
    // Backend API runs on port 5000
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    // WebSocket connection to backend on port 5000
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws_api',
    // Frontend runs on port 4200 (Next.js)
    NEXT_PUBLIC_FRONTEND_PORT: process.env.NEXT_PUBLIC_FRONTEND_PORT || '4200',
    // Backend port for reference
    NEXT_PUBLIC_BACKEND_PORT: process.env.NEXT_PUBLIC_BACKEND_PORT || '5000',
  },
  
  webpack: (config, { isServer, dev }) => {
    // Enhanced alias configuration for Vercel compatibility
    const srcPath = path.join(process.cwd(), 'src');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
    };

    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
      };
    }

    return config;
  },
  
  // Ensure proper output configuration for Vercel
  output: 'standalone',
  
  // Add proper image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
