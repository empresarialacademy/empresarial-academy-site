import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import { SecretariaClientPanel } from "./SecretariaClientPanel";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

/**
 * Painel Executivo da Secretária Virtual da Empresarial Academy.
 * Acesso pelo EA HUB em /eahub/secretaria.
 */
export async function SecretariaVirtualView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24, color: "#fff" }}>Acesso restrito ao administrador.</div>;
  }

  const [postsCount, leadsCount] = await Promise.all([
    payload.count({ collection: "posts" }),
    payload.count({ collection: "leads" }),
  ]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 20px 60px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f8fafc",
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
              Secretária Virtual Executiva (IA)
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              Sessão WhatsApp Ativa (Contabo VPS)
            </span>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
            Torre de controle inteligente integrada ao Google, Microsoft, EA Post, EA Flow e Antigravity.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/eahub"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#cbd5e1",
              background: "#1e293b",
              border: "1px solid #334155",
              textDecoration: "none",
            }}
          >
            ← Voltar ao EA HUB
          </Link>
        </div>
      </div>

      {/* Interactive Client Panel (Agents Grid, Quick Actions, Test Console) */}
      <SecretariaClientPanel postsCount={postsCount.totalDocs} leadsCount={leadsCount.totalDocs} />
    </div>
  );
}
