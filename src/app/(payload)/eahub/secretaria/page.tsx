import type { Metadata } from "next";
import { getPayloadClient } from "@/lib/payload";
import { SecretariaClientPanel } from "@/components/admin/secretaria/SecretariaClientPanel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EA Assessor — Torre de Controle Executiva | Empresarial Academy",
  robots: { index: false, follow: false },
};

export default async function SecretariaPage() {
  let postsCount = 0;
  let leadsCount = 0;
  try {
    const payload = await getPayloadClient();
    const [p, l] = await Promise.all([
      payload.count({ collection: "posts" }),
      payload.count({ collection: "leads" }),
    ]);
    postsCount = p.totalDocs;
    leadsCount = l.totalDocs;
  } catch (e) {
    console.error("Error fetching counts:", e);
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 20px 60px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>
              EA Assessor (IA)
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              WhatsApp Nuvem 24/7 Conectado
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>
            Torre de Controle Operacional de Thiago Marchi e da Empresarial Academy
          </p>
        </div>

        <Link
          href="/eahub"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            color: "#f8fafc",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ← Voltar ao EA HUB
        </Link>
      </div>

      <SecretariaClientPanel postsCount={postsCount} leadsCount={leadsCount} />
    </div>
  );
}
