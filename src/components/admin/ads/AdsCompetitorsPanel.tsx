import { computeCompetitorSummary, type CompetitorRow } from "@/lib/ads-insights";
import { card, table, th, td } from "./adsStyles";

const TYPE_LABEL: Record<CompetitorRow["type"], string> = {
  patrocinado: "Anúncio",
  organico: "Orgânico",
  local: "Local (mapa)",
};

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
      <h2 style={{ marginTop: 0 }}>Concorrentes no Google</h2>
      <p style={{ color: "var(--theme-elevation-600)", marginTop: "-0.4rem" }}>
        {summary.totalAdvertisers} anunciante(s) observados em {summary.keywordsCovered} busca(s) pelas
        palavras da campanha.
        {summary.dominant.length > 0 ? (
          <>
            {" "}Presença dominante (2+ buscas): <strong>{summary.dominant.join(", ")}</strong>.
          </>
        ) : null}
        {summary.freeDiagnosisCount > 0 ? (
          <>
            {" "}<strong>{summary.freeDiagnosisCount} anunciante(s) ofertam &quot;diagnóstico gratuito&quot;</strong> — a
            mesma isca da EA; o diferencial precisa vir do método (Gestão 360) e da prova social, não da
            oferta em si.
          </>
        ) : null}
      </p>

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
            <tr key={`${r.name}-${r.keywordText}-${i}`}>
              <td style={td}>
                <strong>{r.name}</strong>
                {r.domain ? (
                  <div style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>{r.domain}</div>
                ) : null}
              </td>
              <td style={td}>{TYPE_LABEL[r.type]}</td>
              <td style={td}>{r.keywordText}</td>
              <td style={td}>{r.adSnippet || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
