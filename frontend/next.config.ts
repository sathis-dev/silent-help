import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",            // calls from the frontend…
        destination: "http://localhost:4000/api/:path*", // …go to backend
      },
    ];
  },
};

export default nextConfig;
