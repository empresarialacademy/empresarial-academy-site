import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    const hubDomain = process.env.HUB_DOMAIN || 'http://localhost:3000';
    return [
      {
        source: "/hub",
        destination: `${hubDomain}/hub`,
      },
      {
        source: "/hub/:path*",
        destination: `${hubDomain}/hub/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!api).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
