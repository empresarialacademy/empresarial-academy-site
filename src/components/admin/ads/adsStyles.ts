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

export const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.85rem",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.6rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  color: "var(--theme-elevation-600)",
  fontWeight: 500,
};

export const td: CSSProperties = {
  padding: "0.5rem 0.6rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
  verticalAlign: "top",
};

export const badge = (bg: string): CSSProperties => ({
  display: "inline-block",
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: bg,
  marginRight: 6,
});

export const money = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const pct = (n: number) => `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
