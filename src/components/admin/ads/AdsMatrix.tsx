import type { CampaignScorecard } from "@/lib/ads-insights";
import { card, badge, statusColor, statusLabel, statusIcon, EA_GOLD, money, pct } from "./adsStyles";

/**
 * Visão "matriz" — um card por campanha, pensado para leitura rápida (é o
 * pedido original: "ver tudo de forma rápida, mas poder aprofundar"). Cada
 * card linka para o detalhe via `?campaign=<id>`.
 */
export function AdsMatrix({
  scorecards,
  dailyBudgets,
  selectedId,
}: {
  scorecards: CampaignScorecard[];
  dailyBudgets: Map<string, number>;
  selectedId?: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
      {scorecards.map((s) => {
        const budget = dailyBudgets.get(String(s.campaignId)) || 1;
        const spendPct = Math.min(s.spendRatio, 1.5);
        const isSelected = selectedId === String(s.campaignId);
        return (
          <a
            key={s.campaignId}
            href={`?campaign=${s.campaignId}`}
            style={{
              ...card,
              display: "block",
              textDecoration: "none",
              color: "inherit",
              borderColor: isSelected ? EA_GOLD : "var(--theme-elevation-150)",
              borderWidth: isSelected ? 2 : 1,
              boxShadow: isSelected ? `0 0 0 1px ${EA_GOLD}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>{s.campaignName}</strong>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  padding: "0.2rem 0.55rem",
                  borderRadius: 999,
                  background: "var(--theme-elevation-100)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={badge(statusColor[s.status])} />
                {statusIcon[s.status]} {statusLabel[s.status]}
              </span>
            </div>

            <div style={{ margin: "0.6rem 0", height: 6, background: "var(--theme-elevation-150)", borderRadius: 3 }}>
              <div
                style={{
                  width: `${Math.min(spendPct, 1) * 100}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: spendPct > 1.15 ? "var(--theme-warning-500)" : "var(--theme-success-400)",
                }}
                title={`Gasto médio: ${pct(s.spendRatio)} do orçamento diário (${money(budget)})`}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 0.8rem", fontSize: "0.95rem" }}>
              <span>CTR: {pct(s.ctr)}</span>
              <span>CPC: {money(s.avgCpc)}</span>
              <span>CAC: {s.cac !== null ? money(s.cac) : "—"}</span>
              <span>ROI: {s.roiMultiple !== null ? `${s.roiMultiple.toFixed(1)}x` : "—"}</span>
            </div>

            <p style={{ marginTop: "0.6rem", marginBottom: 0, fontSize: "0.95rem", color: "var(--theme-elevation-700)" }}>
              {s.recommendation}
            </p>
          </a>
        );
      })}
    </div>
  );
}
