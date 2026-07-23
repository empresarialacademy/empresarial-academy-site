import {
  lexicalEditor,
  FixedToolbarFeature,
  TextStateFeature,
} from "@payloadcms/richtext-lexical";
import type { CSSProperties } from "react";
import { EA_COLORS, EA_SIZES, type Swatch } from "@/lib/text-state-palette";

/**
 * Editor de conteúdo padrão da EA (Lexical). Além do conjunto padrão do
 * Payload (negrito, itálico, sublinhado, títulos, listas, alinhamento,
 * indentação, link, citação, upload), adiciona:
 * - `FixedToolbarFeature`: barra de formatação fixa no topo (não some ao
 *   perder a seleção) — bem mais prática que só a toolbar flutuante.
 * - `TextStateFeature`: a PALETA EA de cor e tamanho de texto
 *   (`src/lib/text-state-palette.ts`). Cada escolha vira um estado no nó de
 *   texto; a renderização no site é feita por `eaStateToStyle` na página do
 *   blog. IMPORTANTE: a mesma config é usada no import de `.md`
 *   (`/api/parse-markdown`) para o conteúdo importado carregar os mesmos nós.
 */

/** camelCase (React) → CSS hifenizado, para o formato que o TextStateFeature espera. */
function toHyphenCss(style: CSSProperties): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    const key = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    out[key] = String(v);
  }
  return out;
}

function toStateValues(swatches: Record<string, Swatch>) {
  return Object.fromEntries(
    Object.entries(swatches).map(([value, { label, style }]) => [value, { label, css: toHyphenCss(style) }]),
  );
}

export const EA_TEXT_STATE = {
  color: toStateValues(EA_COLORS),
  size: toStateValues(EA_SIZES),
};

export const eaEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    TextStateFeature({ state: EA_TEXT_STATE }),
  ],
});
