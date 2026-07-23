import {
  breakEvenCloseRate,
  computeForecastScenarios,
  FORECAST_ASSUMPTIONS,
  type GoogleForecast,
} from "@/lib/ads-insights";
import { card, table, th, td, money, pct } from "./adsStyles";

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
      <h2 style={{ marginTop: 0 }}>Simulação pré-investimento (Forecast)</h2>
      <p style={{ color: "var(--theme-elevation-600)", marginTop: "-0.4rem" }}>
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

      <h3>Projeção de resultados (cenários)</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--theme-elevation-600)" }}>
        Premissas: {pct(FORECAST_ASSUMPTIONS.LEAD_CONVERSION.conservador)}–
        {pct(FORECAST_ASSUMPTIONS.LEAD_CONVERSION.otimista)} dos cliques viram lead (Diagnóstico);{" "}
        {pct(FORECAST_ASSUMPTIONS.CLOSE_RATE.conservador)}–{pct(FORECAST_ASSUMPTIONS.CLOSE_RATE.otimista)} dos
        leads fecham; receita por cliente = Pacote Essencial em ciclo mínimo ({money(FORECAST_ASSUMPTIONS.REVENUE_PER_CLIENT)}).
      </p>
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
          {scenarios.map((s) => (
            <tr key={s.key}>
              <td style={td}>
                <strong>{s.label}</strong>
              </td>
              <td style={td}>{s.leadsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</td>
              <td style={td}>{s.cac !== null ? money(s.cac) : "—"}</td>
              <td style={td}>{s.clientsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
              <td style={td}>{money(s.revenuePerMonth)}</td>
              <td style={td}>{s.roiMultiple !== null ? `${s.roiMultiple.toFixed(1)}x` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", fontSize: "0.9rem", display: "grid", gap: "0.5rem" }}>
        {breakEven !== null ? (
          <p style={{ margin: 0 }}>
            <strong>Ponto de equilíbrio:</strong> no cenário Base (
            {base.leadsPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} leads/mês), basta fechar{" "}
            <strong>{pct(breakEven)}</strong> dos leads para a campanha se pagar — um único cliente Essencial
            cobre {(FORECAST_ASSUMPTIONS.REVENUE_PER_CLIENT / forecast.cost).toFixed(1)} meses de investimento.
          </p>
        ) : null}
        {keywordsWithoutVolume > 0 ? (
          <p style={{ margin: 0, color: "var(--theme-warning-500)" }}>
            <strong>Atenção:</strong> {keywordsWithoutVolume} das {keywordsTotal} palavras planejadas não têm
            volume de busca mensurável no Brasil (ver campo &quot;Planejador do Google&quot; em cada
            palavra-chave) — o tráfego real virá quase todo das demais. Vale ampliar a lista com as ideias do
            Planejador antes de ativar.
          </p>
        ) : null}
        {forecast.notes ? (
          <p style={{ margin: 0, color: "var(--theme-elevation-600)" }}>{forecast.notes}</p>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
