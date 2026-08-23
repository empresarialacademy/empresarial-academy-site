/**
 * Estilos inline compartilhados pelo painel de Ads no /admin — usam as
 * variáveis de tema do próprio Payload (@payloadcms/ui/dist/scss/colors.scss)
 * para herdar claro/escuro automaticamente, sem depender de classes internas
 * do admin (não documentadas/frágeis entre versões) nem de Tailwind (o
 * bundle do admin não carrega o CSS público do site).
 */
import type { CSSProperties } from "react";
import type { ScorecardStatus } from "@/lib/ads-insights";

export const card: CSSProperties = {
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 6,
  padding: "1.2rem 1.4rem",
};

/** Acento dourado da marca — só para bordas/ícones/linhas, nunca fundo de texto. */
export const EA_GOLD = "#C1A160";

export const statusColor: Record<ScorecardStatus, string> = {
  coletando: "var(--theme-elevation-400)",
  atencao: "var(--theme-warning-500)",
  estavel: "var(--theme-elevation-500)",
  saudavel: "var(--theme-success-500)",
};

export const statusLabel: Record<ScorecardStatus, string> = {
  coletando: "Coletando dados",
  atencao: "Atenção",
  estavel: "Estável",
  saudavel: "Saudável",
};

export const statusIcon: Record<ScorecardStatus, string> = {
  coletando: "⏳",
  atencao: "⚠️",
  estavel: "➖",
  saudavel: "✅",
};

// `minWidth` é o que faz a rolagem horizontal do wrapper `.ea-table-scroll`
// existir de fato: só com `width: 100%` a tabela encolhe até a largura do
// celular e as colunas viram uma palavra por linha em vez de rolar.
export const table: CSSProperties = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse",
  fontSize: "0.95rem",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "0.6rem 0.75rem",
  borderBottom: "2px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-elevation-700)",
  fontWeight: 600,
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

export const td: CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
  verticalAlign: "top",
};

/** Zebra de linha — chamar com o índice da linha dentro do .map(). */
export const rowBg = (i: number): CSSProperties => ({
  background: i % 2 === 1 ? "var(--theme-elevation-50)" : "transparent",
});

export const badge = (bg: string): CSSProperties => ({
  display: "inline-block",
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: bg,
  marginRight: 6,
});

/** Título de seção com marcador dourado — usar em todo h2/h3 do painel. */
export const sectionTitle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.2rem",
  fontWeight: 700,
  margin: "2rem 0 1rem",
  paddingBottom: "0.5rem",
  borderBottom: `2px solid ${EA_GOLD}`,
};

export type KpiState = "good" | "warn" | "bad" | "neutral";

const KPI_STATE_COLOR: Record<KpiState, string> = {
  good: "var(--theme-success-500)",
  warn: "var(--theme-warning-500)",
  bad: "var(--theme-error-500)",
  neutral: "var(--theme-elevation-300)",
};

/** Card de indicador único — número grande + estado por cor na borda esquerda. */
export const kpiCard = (state: KpiState = "neutral"): CSSProperties => ({
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderLeft: `3px solid ${KPI_STATE_COLOR[state]}`,
  borderRadius: 6,
  padding: "0.75rem 0.9rem",
});

export const kpiLabel: CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--theme-elevation-500)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  fontWeight: 600,
};

export const kpiValue: CSSProperties = {
  fontSize: "1.65rem",
  fontWeight: 700,
  marginTop: "0.15rem",
  lineHeight: 1.2,
};

/** Legenda pequena de contexto sob o valor do KPI (ex.: "meta: 3,0x"). */
export const kpiHint: CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--theme-elevation-500)",
  marginTop: "0.15rem",
};

export type FlagSeverity = "good" | "warn" | "bad";

const FLAG_SEVERITY_BY_CODE: Record<string, FlagSeverity> = {
  good_performer: "good",
  low_ctr: "warn",
  low_volume: "warn",
  negative_candidate: "bad",
  no_conversion_spend: "bad",
  cpc_above_ceiling: "bad",
};

export function flagSeverity(code: string): FlagSeverity {
  return FLAG_SEVERITY_BY_CODE[code] ?? "warn";
}

const FLAG_PILL_COLOR: Record<FlagSeverity, { bg: string; fg: string }> = {
  good: { bg: "var(--theme-success-100)", fg: "var(--theme-success-800)" },
  warn: { bg: "var(--theme-warning-100)", fg: "var(--theme-warning-800)" },
  bad: { bg: "var(--theme-error-100)", fg: "var(--theme-error-800)" },
};

export const flagPill = (severity: FlagSeverity): CSSProperties => ({
  display: "inline-block",
  padding: "0.25rem 0.6rem",
  borderRadius: 999,
  fontSize: "0.8rem",
  fontWeight: 600,
  background: FLAG_PILL_COLOR[severity].bg,
  color: FLAG_PILL_COLOR[severity].fg,
  whiteSpace: "nowrap",
});

/** Caixa de destaque com barra dourada — para o achado mais importante de um bloco. */
export const callout: CSSProperties = {
  background: "var(--theme-elevation-50)",
  borderLeft: `3px solid ${EA_GOLD}`,
  borderRadius: "0 6px 6px 0",
  padding: "0.8rem 1.1rem",
  fontSize: "0.98rem",
};

export const money = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const pct = (n: number) => `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
