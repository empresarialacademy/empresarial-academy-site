/** Rótulos amigáveis para os tipos de material. */
export const KIND_LABELS: Record<string, string> = {
  ebook: "E-book",
  planilha: "Planilha",
  template: "Template",
  checklist: "Checklist",
  guia: "Guia",
  apresentacao: "Apresentação",
  video: "Vídeo",
};

export function kindLabel(kind?: string | null): string {
  if (!kind) return "Material";
  return KIND_LABELS[kind] ?? "Material";
}
