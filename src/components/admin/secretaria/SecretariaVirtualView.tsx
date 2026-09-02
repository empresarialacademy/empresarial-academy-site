import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { EaHubBackLink } from "@/components/admin/brand/EaHubBackLink";
import { SecretariaClientPanel } from "./SecretariaClientPanel";

/**
 * Painel Executivo do EA Assessor da Empresarial Academy.
 * Acesso pelo EA HUB em /eahub/secretaria.
 */
export async function SecretariaVirtualView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    redirect("/eahub/login?redirect=%2Feahub%2Fsecretaria");
  }

  let postsCount = 0;
  let leadsCount = 0;
  try {
    const [p, l] = await Promise.all([
      payload.count({ collection: "posts" }),
      payload.count({ collection: "leads" }),
    ]);
    postsCount = p.totalDocs;
    leadsCount = l.totalDocs;
  } catch {
    // fallback
  }

  return (
    <div className="ea-view" style={{ maxWidth: 1200 }}>
      <EaHubBackLink />
      <div
        style={{
          background: "#1D2B3C",
          borderTop: "3px solid #C99A3E",
          borderRadius: 12,
          padding: "1.5rem 1.75rem",
          margin: "0 0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C99A3E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Empresarial Academy
          </div>
          <h1
            style={{
              margin: "4px 0 0",
              fontSize: "1.75rem",
              fontWeight: 800,
              fontFamily: "'Sora', sans-serif",
              color: "#fff",
            }}
          >
            EA Assessor
          </h1>
          <p style={{ color: "#B9C2CE", margin: "0.35rem 0 0", fontSize: 13 }}>
            Assessoria executiva de Thiago Marchi: agenda, e-mail e ecossistema Empresarial Academy.
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: "#8FD9B6",
            background: "rgba(143,217,182,0.12)",
            border: "1px solid rgba(143,217,182,0.28)",
            borderRadius: 999,
            padding: "6px 12px",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8FD9B6", display: "inline-block" }} />
          WhatsApp conectado 24/7
        </div>
      </div>

      <SecretariaClientPanel postsCount={postsCount} leadsCount={leadsCount} />
    </div>
  );
}
