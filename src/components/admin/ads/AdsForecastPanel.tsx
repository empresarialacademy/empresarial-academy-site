import {
  breakEvenCloseRate,
  computeForecastScenarios,
  FORECAST_ASSUMPTIONS,
  ADS_INSIGHTS_THRESHOLDS,
  type GoogleForecast,
} from "@/lib/ads-insights";
import { card, table, th, td, rowBg, sectionTitle, callout, kpiCard, kpiLabel, kpiValue, EA_GOLD, money, pct, type KpiState } from "./adsStyles";

/**
 * Simulação pré-investimento: a previsão OFICIAL do Google (Planejador de
 * Palavras-chave) + três cenários nossos de conversão (premissas em
 * FORECAST_ASSUMPTIONS). Aparece quando a campanha tem os campos forecast*
 * preenchidos (via seed-ads-recon ou à mão).
 */
export function AdsForecastPanel({
  forecast,
  keywordsWithoutVolume,
  keywordsTotal,
}: {
  forecast: GoogleForecast;
  keywordsWithoutVolume: number;
  keywordsTotal: number;
}) {
  const scenarios = computeForecastScenarios(forecast);
  const base = scenarios.find((s) => s.key === "base")!;
  const breakEven = breakEvenCloseRate(forecast, base.leadsPerMonth);

  return (
    <section style={{ ...card, marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.3rem" }}>🔮</span>
        <h2 style={{ margin: 0 }}>Simulação pré-investimento (Forecast)</h2>
      </div>
      <p style={{ color: "var(--theme-elevation-600)", marginTop: "0.3rem" }}>
        Previsão oficial do Google (Planejador de Palavras-chave)
        {forecast.capturedAt ? ` — capturada em ${new Date(forecast.capturedAt).toLocaleDateString("pt-BR")}` : ""}.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", margin: "1rem 0" }}>
        <Metric label="Cliques/mês" value={String(Math.round(forecast.clicks))} />
        <Metric label="Impressões/mês" value={forecast.impressions.toLocaleString("pt-BR")} />
        <Metric label="Custo/mês" value={money(forecast.cost)} />
        <Metric label="CTR" value={`${forecast.ctrPct.toLocaleString("pt-BR")}%`} />
        <Metric label="CPC médio" value={money(forecast.avgCpc)} />
        <Metric label="Orçamento/dia" value={money(forecast.dailyBudget)} />
      </div>

      <div style={sectionTitle}>📈 Projeção de resultados (cenários)</div>
      <p style={{ fontSize: "0.95rem", color: "var(--theme-elevation-600)" }}>
        Premissas: {pct(FORECAST_ASSUMPTIONS.LEAD_CONVERSION.conservador)}–
        {pct(FORECAST_ASSUMPTIONS.LEAD_CONVERSION.otimista)} dos cliques viram lead (Diagnóstico);{" "}
        {pct(FORECAST_ASSUMPTIONS.CLOSE_RATE.conservador)}–{pct(FORECAST_ASSUMPTIONS.CLOSE_RATE.otimista)} dos
        leads fecham; receita por cliente = Pacote Essencial em ciclo mínimo ({money(FORECAST_ASSUMPTIONS.REVENUE_PER_CLIENT)}).
      </p>
      <div className="ea-table-scroll">
        <table style={table}>
        <thead>
          <tr>
            <th style={th}>Cenário</th>
            <th style={th}>Leads/mês</th>
            <th style={th}>CAC</th>
            <th style={th}>Clientes/mês</th>
            <th style={th}>Receita/mês</th>
            <th style={th}>ROI</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s, i) => {
            const isBase = s.key === "base";
            const roiState: KpiState =
              s.roiMultiple === null ? "neutral" : s.roiMultiple >= ADS_INSIGHTS_THRESHOLDS.ROI_GOOD_MULTIPLE ? "good" : "warn";
            return (
              <tr
                key={s.key}
                style={{
                  ...rowBg(i),
                  ...(isBase ? { boxShadow: `inset 3px 0 0 ${EA_GOLD}` } : {}),
                }}
              >
                <td style={td}>
                  <strong>{s.label}</strong>
                </td>
                <td style={td}>{s.leadsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</td>
                <td style={td}>{s.cac !== null ? money(s.cac) : "—"}</td>
                <td style={td}>{s.clientsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                <td style={td}>{money(s.revenuePerMonth)}</td>
                <td style={{ ...td, color: roiState === "good" ? "var(--theme-success-600)" : roiState === "warn" ? "var(--theme-warning-600)" : undefined, fontWeight: 600 }}>
                  {s.roiMultiple !== null ? `${s.roiMultiple.toFixed(1)}x` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1rem", display: "grid", gap: "0.6rem" }}>
        {breakEven !== null ? (
          <div style={callout}>
            <strong>Ponto de equilíbrio:</strong> no cenário Base (
            {base.leadsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} leads/mês), basta fechar{" "}
            <strong>{pct(breakEven)}</strong> dos leads para a campanha se pagar — um único cliente Essencial
            cobre {(FORECAST_ASSUMPTIONS.REVENUE_PER_CLIENT / forecast.cost).toFixed(1)} meses de investimento.
          </div>
        ) : null}
        {keywordsWithoutVolume > 0 ? (
          <div style={{ ...callout, borderLeftColor: "var(--theme-warning-500)", color: "var(--theme-warning-700)" }}>
            <strong>⚠️ Atenção:</strong> {keywordsWithoutVolume} das {keywordsTotal} palavras planejadas não têm
            volume de busca mensurável no Brasil (ver campo &quot;Planejador do Google&quot; em cada
            palavra-chave) — o tráfego real virá quase todo das demais. Vale ampliar a lista com as ideias do
            Planejador antes de ativar.
          </div>
        ) : null}
        {forecast.notes ? (
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--theme-elevation-600)" }}>{forecast.notes}</p>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={kpiCard("neutral")}>
      <div style={kpiLabel}>{label}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}
