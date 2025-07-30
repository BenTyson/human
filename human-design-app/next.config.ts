import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude swisseph from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
      
      config.externals = config.externals || [];
      config.externals.push('swisseph');
    }
    
    return config;
  },
  serverExternalPackages: ['swisseph']
};

export default nextConfig;
