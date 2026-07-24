import type { FieldHook } from "payload";

/** Converte um texto em slug amigável (sem acentos, minúsculo, com hífens). */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Sanitiza o nome de um arquivo de upload (preserva a extensão) — troca
 * espaços/acentos/caracteres especiais por hífen. Necessário porque nomes com
 * espaço (ex.: "Screenshot 2026-07-22 015704.png", padrão do Windows) geram
 * URL com espaço, que o otimizador de imagem da Vercel rejeita com
 * `INVALID_IMAGE_OPTIMIZE_REQUEST` (dupla-codificação do espaço no
 * `_next/image?url=`). O `sanitize-filename` interno do Payload só remove
 * caracteres ilegais em disco — espaço é válido em disco, então passa direto.
 */
export function sanitizeUploadFilename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
  const safeBase = slugify(base) || "arquivo";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

/**
 * Hook de campo que gera o slug a partir de um campo de origem (ex.: "title")
 * quando o slug estiver vazio; se preenchido, apenas normaliza.
 */
export const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === "string" && value.length > 0) {
      return slugify(value);
    }
    const fallback = data?.[fallbackField] ?? originalDoc?.[fallbackField];
    return typeof fallback === "string" ? slugify(fallback) : value;
  };
