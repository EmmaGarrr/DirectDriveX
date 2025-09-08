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
  
  webpack: (config, { isServer, dir, buildId }) => {
    // Get the correct base directory - handle Vercel's build environment
    const baseDir = dir || __dirname;
    const srcPath = path.resolve(baseDir, 'src');
    
    // Add comprehensive alias resolution for @ path
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
      '@/lib': path.resolve(srcPath, 'lib'),
      '@/components': path.resolve(srcPath, 'components'),
      '@/hooks': path.resolve(srcPath, 'hooks'),
      '@/services': path.resolve(srcPath, 'services'),
      '@/types': path.resolve(srcPath, 'types'),
      '@/app': path.resolve(srcPath, 'app'),
    };

    // Ensure the alias is properly configured for both client and server
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

    // Add more robust module resolution
    config.resolve.modules = [
      srcPath,
      'node_modules',
    ];

    // Ensure proper file extensions are resolved
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    // Add better error handling for missing modules
    config.resolve.symlinks = false;
    
    // Add resolve plugins for better module resolution
    config.resolve.plugins = config.resolve.plugins || [];
    
    // Add a custom resolver plugin to handle @ aliases more robustly
    const { NormalModuleReplacementPlugin } = require('webpack');
    config.plugins.push(
      new NormalModuleReplacementPlugin(/^@\/lib\/utils$/, path.resolve(srcPath, 'lib', 'utils.ts')),
      new NormalModuleReplacementPlugin(/^@\/utils$/, path.resolve(srcPath, 'utils.ts'))
    );

    // Add a more robust custom resolver for Vercel
    config.resolve.plugins.push({
      apply: (resolver: any) => {
        resolver.hooks.resolve.tapAsync('VercelPathResolver', (request: any, resolveContext: any, callback: any) => {
          if (request.request && request.request.startsWith('@/')) {
            const relativePath = request.request.substring(2);
            const absolutePath = path.resolve(srcPath, relativePath);
            
            // Try different extensions
            const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
            for (const ext of extensions) {
              const fullPath = absolutePath + ext;
              if (require('fs').existsSync(fullPath)) {
                const newRequest = {
                  ...request,
                  request: fullPath,
                };
                return resolver.doResolve(resolver.hooks.resolve, newRequest, null, resolveContext, callback);
              }
            }
            
            // If no extension found, try the original path
            const newRequest = {
              ...request,
              request: absolutePath,
            };
            return resolver.doResolve(resolver.hooks.resolve, newRequest, null, resolveContext, callback);
          }
          return callback();
        });
      }
    });

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
