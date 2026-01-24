import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack bundler explicitly
  bundlePagesRouterDependencies: true,
  // Ignore ESLint during builds (we run it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
