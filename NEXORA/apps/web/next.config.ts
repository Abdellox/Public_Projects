import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nexora/types", "@nexora/validation"],
  async rewrites() {
    // Same-origin proxy to the API in development: cookies stay first-party
    // and no CORS configuration is required for local development.
    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:4000";
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${target}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
