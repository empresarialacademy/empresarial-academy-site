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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, margin: "0 0 1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>EA Assessor</h1>
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
                color: "#15803d",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              WhatsApp Nuvem 24/7 Conectado
            </span>
          </div>
          <p style={{ color: "var(--theme-elevation-600)", margin: "0.25rem 0 0" }}>
            Torre de Controle Operacional e Inteligência Executiva de Thiago Marchi e da Empresarial Academy.
          </p>
        </div>
      </div>

      <SecretariaClientPanel postsCount={postsCount} leadsCount={leadsCount} />
    </div>
  );
}
