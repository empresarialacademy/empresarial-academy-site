import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { eaStateToStyle } from "@/lib/text-state-palette";

// Bits de formatação inline do Lexical (mesmos valores do NodeFormat).
const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
const IS_STRIKETHROUGH = 1 << 2;
const IS_UNDERLINE = 1 << 3;
const IS_CODE = 1 << 4;
const IS_SUBSCRIPT = 1 << 5;
const IS_SUPERSCRIPT = 1 << 6;

type SerializedTextNode = {
  text: string;
  format: number;
  /** Estado do nó (Lexical NODE_STATE_KEY) — guarda a paleta EA: { color, size }. */
  $?: Record<string, unknown> | null;
};

/**
 * Converte um nó de texto do Lexical aplicando os formatos padrão
 * (negrito/itálico/…) E a paleta EA de cor/tamanho (TextStateFeature), que o
 * conversor padrão do Payload ignora. Espelha `src/lib/editor.ts` /
 * `text-state-palette.ts` — é o que faz a formatação aparecer no site.
 */
function eaTextConverter({ node }: { node: SerializedTextNode }): React.ReactNode {
  let el: React.ReactNode = node.text;
  if (node.format & IS_BOLD) el = <strong>{el}</strong>;
  if (node.format & IS_ITALIC) el = <em>{el}</em>;
  if (node.format & IS_STRIKETHROUGH) el = <span style={{ textDecoration: "line-through" }}>{el}</span>;
  if (node.format & IS_UNDERLINE) el = <span style={{ textDecoration: "underline" }}>{el}</span>;
  if (node.format & IS_CODE) el = <code>{el}</code>;
  if (node.format & IS_SUBSCRIPT) el = <sub>{el}</sub>;
  if (node.format & IS_SUPERSCRIPT) el = <sup>{el}</sup>;

  const style = eaStateToStyle(node.$);
  if (style) el = <span style={style}>{el}</span>;
  return el;
}

/**
 * Renderizador de conteúdo Lexical do site, com a paleta EA. Use no lugar do
 * `<RichText>` direto para que cor/tamanho aplicados no editor apareçam.
 */
export function EaRichText({ data, className }: { data: SerializedEditorState; className?: string }) {
  return (
    <RichText
      data={data}
      className={className}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      converters={({ defaultConverters }: any) => ({ ...defaultConverters, text: eaTextConverter })}
    />
  );
}
