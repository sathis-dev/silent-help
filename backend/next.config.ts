import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack bundler explicitly
  bundlePagesRouterDependencies: true,
};

export default nextConfig;
