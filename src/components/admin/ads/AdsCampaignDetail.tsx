import type { CampaignScorecard, DailyMetric, Flag } from "@/lib/ads-insights";
import { computeAdGroupFlags, computeKeywordFlags } from "@/lib/ads-insights";
import { card, table, th, td, badge, statusColor, statusLabel, money, pct } from "./adsStyles";

type CampaignDoc = {
  id: string | number;
  name: string;
  status: string;
  dailyBudgetTarget: number;
  monthlyBudgetTarget: number;
  cpcCeiling: number;
};

type AdGroupDoc = {
  id: string | number;
  name: string;
  status: string;
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
};

type KeywordDoc = {
  id: string | number;
  adGroup: string | number;
  text: string;
  matchType: string;
  status: string;
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
};

function FlagList({ flags }: { flags: Flag[] }) {
  if (flags.length === 0) return <span style={{ color: "var(--theme-elevation-400)" }}>—</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {flags.map((f) => (
        <span key={f.code} title={f.recommendation}>
          <strong>{f.label}:</strong> {f.recommendation}
        </span>
      ))}
    </div>
  );
}

/** Gráfico de barras simples (SVG à mão, sem lib) — custo por dia vs. o
 * orçamento diário alvo (linha tracejada). */
function DailyCostChart({ dailyMetrics, dailyBudget }: { dailyMetrics: DailyMetric[]; dailyBudget: number }) {
  if (dailyMetrics.length === 0) return null;
  const width = 720;
  const height = 140;
  const padding = 24;
  const maxCost = Math.max(dailyBudget * 1.2, ...dailyMetrics.map((m) => m.cost), 1);
  const barGap = 2;
  const barWidth = Math.max((width - padding * 2) / dailyMetrics.length - barGap, 2);
  const scaleY = (v: number) => height - padding - (v / maxCost) * (height - padding * 2);
  const budgetY = scaleY(dailyBudget);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Custo diário nos últimos ${dailyMetrics.length} dias, comparado ao orçamento diário de ${money(dailyBudget)}`}
      style={{ width: "100%", height: "auto", maxWidth: width }}
    >
      <line
        x1={padding}
        x2={width - padding}
        y1={budgetY}
        y2={budgetY}
        stroke="var(--theme-elevation-400)"
        strokeDasharray="4 4"
        strokeWidth={1}
      />
      <text x={width - padding} y={budgetY - 4} textAnchor="end" fontSize={10} fill="var(--theme-elevation-500)">
        orçamento/dia: {money(dailyBudget)}
      </text>
      {dailyMetrics.map((m, i) => {
        const x = padding + i * (barWidth + barGap);
        const y = scaleY(m.cost);
        const barHeight = height - padding - y;
        const over = m.cost > dailyBudget * 1.15;
        return (
          <rect
            key={m.date}
            x={x}
            y={y}
            width={barWidth}
            height={Math.max(barHeight, 0)}
            fill={over ? "var(--theme-warning-500)" : "var(--theme-success-400)"}
          >
            <title>
              {m.date}: {money(m.cost)} · {m.clicks} cliques · {m.conversions} conversões
            </title>
          </rect>
        );
      })}
    </svg>
  );
}

import { AIForecastButton } from "./AdsClientActions";

export function AdsCampaignDetail({
  campaign,
  scorecard,
  dailyMetrics,
  adGroups,
  keywordsByGroup,
}: {
  campaign: CampaignDoc;
  scorecard: CampaignScorecard;
  dailyMetrics: DailyMetric[];
  adGroups: AdGroupDoc[];
  keywordsByGroup: Map<string, KeywordDoc[]>;
}) {
  return (
    <section style={{ ...card, marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>{campaign.name}</h2>
        <span>
          <span style={badge(statusColor[scorecard.status])} />
          {statusLabel[scorecard.status]}
        </span>
      </div>

      <p style={{ margin: "0 0 1rem", color: "var(--theme-elevation-700)" }}>{scorecard.recommendation}</p>

      <AIForecastButton campaignId={String(campaign.id)} campaignName={campaign.name} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <Metric label="Cliques" value={String(scorecard.totals.clicks)} />
        <Metric label="CTR" value={pct(scorecard.ctr)} />
        <Metric label="CPC médio" value={money(scorecard.avgCpc)} />
        <Metric label="Gasto total" value={money(scorecard.totals.cost)} />
        <Metric label="Leads atribuídos" value={String(scorecard.leadsCount)} />
        <Metric label="CAC" value={scorecard.cac !== null ? money(scorecard.cac) : "—"} />
        <Metric label="Receita (ganhos)" value={money(scorecard.revenue)} />
        <Metric label="ROI" value={scorecard.roiMultiple !== null ? `${scorecard.roiMultiple.toFixed(1)}x` : "—"} />
      </div>

      <DailyCostChart dailyMetrics={dailyMetrics} dailyBudget={campaign.dailyBudgetTarget} />

      <h3 style={{ marginTop: "2rem" }}>Grupos de anúncios</h3>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Grupo</th>
            <th style={th}>Cliques</th>
            <th style={th}>Custo</th>
            <th style={th}>Conversões</th>
            <th style={th}>Sinalizações</th>
          </tr>
        </thead>
        <tbody>
          {adGroups.map((g) => {
            const flags = computeAdGroupFlags(g);
            return (
              <tr key={g.id}>
                <td style={td}>{g.name}</td>
                <td style={td}>{g.rollupClicks}</td>
                <td style={td}>{money(g.rollupCost)}</td>
                <td style={td}>{g.rollupConversions}</td>
                <td style={td}>
                  <FlagList flags={flags} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={{ marginTop: "2rem" }}>Palavras-chave</h3>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Palavra-chave</th>
            <th style={th}>Grupo</th>
            <th style={th}>Correspondência</th>
            <th style={th}>Cliques</th>
            <th style={th}>Custo</th>
            <th style={th}>Conversões</th>
            <th style={th}>Sinalizações</th>
          </tr>
        </thead>
        <tbody>
          {adGroups.map((g) =>
            (keywordsByGroup.get(String(g.id)) ?? []).map((k) => {
              const flags = computeKeywordFlags(k, campaign.cpcCeiling);
              return (
                <tr key={k.id}>
                  <td style={td}>{k.text}</td>
                  <td style={td}>{g.name}</td>
                  <td style={td}>{k.matchType}</td>
                  <td style={td}>{k.rollupClicks}</td>
                  <td style={td}>{money(k.rollupCost)}</td>
                  <td style={td}>{k.rollupConversions}</td>
                  <td style={td}>
                    <FlagList flags={flags} />
                  </td>
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
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
