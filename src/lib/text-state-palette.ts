import type { CSSProperties } from "react";

/**
 * Paleta EA de cor e tamanho de texto para o editor de conteúdo (Lexical
 * TextStateFeature). Fonte única da verdade: usada tanto na config do editor
 * (`src/lib/editor.ts`, que converte para CSS hifenizado) quanto na
 * renderização pública (`eaStateToStyle`, abaixo). Cores escolhidas para ler
 * bem sobre fundo claro (`.prose-ea` do blog) e alinhadas à marca.
 *
 * Sem imports pesados de propósito — este módulo é seguro em qualquer bundle
 * (editor no admin e páginas do site).
 */

export type Swatch = { label: string; style: CSSProperties };

/** Chave de estado "color" → valores. */
export const EA_COLORS: Record<string, Swatch> = {
  navy: { label: "Navy", style: { color: "#1D2B3C" } },
  gold: { label: "Dourado", style: { color: "#8a6a1f" } },
  gray: { label: "Cinza", style: { color: "#5b626e" } },
  green: { label: "Verde (positivo)", style: { color: "#2E7D5B" } },
  red: { label: "Vermelho (atenção)", style: { color: "#B23B3B" } },
};

/** Chave de estado "size" → valores. */
export const EA_SIZES: Record<string, Swatch> = {
  pequeno: { label: "Pequeno", style: { fontSize: "0.85em" } },
  grande: { label: "Grande", style: { fontSize: "1.3em" } },
  destaque: { label: "Destaque", style: { fontSize: "1.6em", fontWeight: 600, lineHeight: 1.25 } },
};

/**
 * Converte o estado serializado de um nó de texto (Lexical guarda em
 * `node.$ = { color, size }`) na CSSProperties correspondente, para a
 * renderização no site. Retorna undefined se não houver estilo.
 */
export function eaStateToStyle(state?: Record<string, unknown> | null): CSSProperties | undefined {
  if (!state || typeof state !== "object") return undefined;
  let out: CSSProperties = {};
  const color = typeof state.color === "string" ? EA_COLORS[state.color] : undefined;
  const size = typeof state.size === "string" ? EA_SIZES[state.size] : undefined;
  if (color) out = { ...out, ...color.style };
  if (size) out = { ...out, ...size.style };
  return Object.keys(out).length > 0 ? out : undefined;
}
