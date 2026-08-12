import { computeCompetitorSummary, type CompetitorRow } from "@/lib/ads-insights";
import { card, table, th, td, rowBg, sectionTitle, callout, kpiCard, kpiLabel, kpiValue } from "./adsStyles";

const TYPE_LABEL: Record<CompetitorRow["type"], string> = {
  patrocinado: "Anúncio",
  organico: "Orgânico",
  local: "Local (mapa)",
};

const TYPE_PILL: Record<CompetitorRow["type"], { bg: string; fg: string }> = {
  patrocinado: { bg: "var(--theme-warning-100)", fg: "var(--theme-warning-800)" },
  organico: { bg: "var(--theme-success-100)", fg: "var(--theme-success-800)" },
  local: { bg: "var(--theme-elevation-150)", fg: "var(--theme-elevation-700)" },
};

function TypeBadge({ type }: { type: CompetitorRow["type"] }) {
  const c = TYPE_PILL[type];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
        whiteSpace: "nowrap",
      }}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}

/**
 * Concorrentes que o Google apresenta nas buscas pelas palavras da campanha
 * (coleção `ad-competitors`). Antes da campanha ativa, a fonte é observação
 * real de SERP; depois, o Auction Insights complementa.
 */
export function AdsCompetitorsPanel({ rows }: { rows: CompetitorRow[] }) {
  if (rows.length === 0) return null;
  const summary = computeCompetitorSummary(rows);

  const sorted = [...rows].sort((a, b) => {
    if (a.type !== b.type) return a.type === "patrocinado" ? -1 : 1;
    return (b.appearances ?? 1) - (a.appearances ?? 1);
  });

  return (
    <section style={{ ...card, marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.3rem" }}>🕵️</span>
        <h2 style={{ margin: 0 }}>Concorrentes no Google</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", margin: "1rem 0" }}>
        <div style={kpiCard("neutral")}>
          <div style={kpiLabel}>Anunciantes observados</div>
          <div style={kpiValue}>{summary.totalAdvertisers}</div>
        </div>
        <div style={kpiCard("neutral")}>
          <div style={kpiLabel}>Buscas cobertas</div>
          <div style={kpiValue}>{summary.keywordsCovered}</div>
        </div>
        <div style={kpiCard(summary.dominant.length > 0 ? "warn" : "neutral")}>
          <div style={kpiLabel}>Presença dominante (2+ buscas)</div>
          <div style={{ ...kpiValue, fontSize: "1rem" }}>{summary.dominant.length > 0 ? summary.dominant.join(", ") : "—"}</div>
        </div>
      </div>

      {summary.freeDiagnosisCount > 0 ? (
        <div style={{ ...callout, marginBottom: "1.1rem" }}>
          <strong>{summary.freeDiagnosisCount} anunciante(s) ofertam &quot;diagnóstico gratuito&quot;</strong> — a mesma
          isca da EA; o diferencial precisa vir do método (Gestão 360) e da prova social, não da oferta em si.
        </div>
      ) : null}

      <div style={sectionTitle}>📋 Anúncios e resultados observados</div>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Concorrente</th>
            <th style={th}>Onde</th>
            <th style={th}>Palavra pesquisada</th>
            <th style={th}>Oferta/observação</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={`${r.name}-${r.keywordText}-${i}`} style={rowBg(i)}>
              <td style={td}>
                <strong>{r.name}</strong>
                {r.domain ? (
                  <div style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>{r.domain}</div>
                ) : null}
              </td>
              <td style={td}>
                <TypeBadge type={r.type} />
              </td>
              <td style={td}>{r.keywordText}</td>
              <td style={td}>{r.adSnippet || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
