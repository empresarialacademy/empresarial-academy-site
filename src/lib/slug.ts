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
