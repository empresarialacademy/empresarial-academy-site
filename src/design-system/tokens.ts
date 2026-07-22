/**
 * Design tokens da Empresarial Academy.
 * Espelham os valores canônicos do branding mestre (✅ confirmados).
 * As cores também estão expostas como utilitários Tailwind via @theme em globals.css.
 */
export const tokens = {
  color: {
    navy: "#1D2B3C", // primária
    navyLight: "#2E4358",
    gold: "#C1A160", // secundária (acento)
    goldLight: "#D7C089",
    ink: "#15191F",
    gray: "#6B7280",
    line: "#D9DCE1",
    surface: "#F6F5F1",
    white: "#FFFFFF",
    success: "#2E7D5B",
    warning: "#C7892B",
    danger: "#B23B3B",
  },
  font: {
    heading: "var(--font-heading)", // Montserrat
    body: "var(--font-body)", // Open Sans
  },
  // Proporção de uso de cor recomendada pela marca.
  colorRatio: { neutral: 60, primary: 30, accent: 10 },
} as const;

export type Tokens = typeof tokens;
