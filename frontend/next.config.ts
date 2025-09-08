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
  
  webpack: (config, { isServer, dir }) => {
    // Add alias resolution for @ path (needed for npm and Vercel)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(dir || __dirname, 'src'),
    };

    // Ensure the alias is properly configured for both client and server
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    // Add more robust module resolution
    config.resolve.modules = [
      path.resolve(dir || __dirname, 'src'),
      'node_modules',
    ];

    // Ensure proper file extensions are resolved
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    // Add better error handling for missing modules
    config.resolve.symlinks = false;

    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
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
