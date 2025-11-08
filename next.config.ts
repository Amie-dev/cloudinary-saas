import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: 100 * 1024 * 1024, // 100MB
    serverActions: {}, // must be an object
  },
};

export default nextConfig;
