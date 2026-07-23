import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // URLs do site antigo (construtor da Hostinger, tudo sob /pages/) ainda indexadas no Google.
    return [
      { source: "/pages/sobre", destination: "/institucional", permanent: true },
      { source: "/pages/contato", destination: "/contato", permanent: true },
      { source: "/pages/blog", destination: "/blog", permanent: true },
      { source: "/pages/servicos", destination: "/servicos", permanent: true },
      { source: "/pages/:path*", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Headers de segurança apenas no site público (o /admin do Payload tem o seu próprio tratamento).
        source: "/((?!admin|api).*)",
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

export default withPayload(nextConfig);
