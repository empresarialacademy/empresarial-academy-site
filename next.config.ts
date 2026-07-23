import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // URLs do site antigo (construtor da Hostinger, tudo sob /pages/) ainda indexadas no Google.
      { source: "/pages/sobre", destination: "/institucional", permanent: true },
      { source: "/pages/contato", destination: "/contato", permanent: true },
      { source: "/pages/blog", destination: "/blog", permanent: true },
      { source: "/pages/servicos", destination: "/servicos", permanent: true },
      { source: "/pages/:path*", destination: "/", permanent: true },
      // O admin foi renomeado para "EA HUB" e movido de /admin para /eahub.
      // Mantém favoritos/links antigos funcionando.
      { source: "/admin", destination: "/eahub", permanent: false },
      { source: "/admin/:path*", destination: "/eahub/:path*", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // Headers de segurança apenas no site público (o /eahub do Payload tem o seu próprio tratamento).
        source: "/((?!eahub|admin|api).*)",
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
