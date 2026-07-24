/**
 * Validações condicionais "obrigatório só ao Publicar" — Posts e Materials
 * podem ser salvos incompletos como Rascunho (ex.: logo após importar um
 * `.md`, antes de adicionar capa/arquivo à mão), mas não podem virar
 * "Publicado" sem os campos essenciais preenchidos (pedido do Thiago,
 * 2026-07-24). Cada `validate` roda tanto no navegador (bloqueia o botão
 * Publicar com erro inline) quanto no servidor (última barreira).
 */

type ValidateArgs = { data?: { status?: string } };

function isPublishing(data?: { status?: string }): boolean {
  return data?.status === "published";
}

/** Texto, relacionamento (ID) ou upload (ID) — obrigatório só ao publicar. */
export function requiredToPublish(label: string) {
  return (value: unknown, { data }: ValidateArgs) => {
    if (!isPublishing(data)) return true;
    if (value === null || value === undefined || value === "") {
      return `${label} é obrigatório para publicar.`;
    }
    return true;
  };
}

/** Campo `array` (ex.: tags) — precisa de ao menos 1 linha ao publicar. */
export function requiredToPublishArray(label: string) {
  return (value: unknown, { data }: ValidateArgs) => {
    if (!isPublishing(data)) return true;
    if (!Array.isArray(value) || value.length === 0) {
      return `${label} é obrigatório para publicar.`;
    }
    return true;
  };
}

/** Campo `richText` (Lexical) — considera vazio sem nenhum nó na raiz. */
export function requiredToPublishRichText(label: string) {
  return (value: unknown, { data }: ValidateArgs) => {
    if (!isPublishing(data)) return true;
    const root = (value as { root?: { children?: unknown[] } } | null | undefined)?.root;
    if (!root || !root.children || root.children.length === 0) {
      return `${label} é obrigatório para publicar.`;
    }
    return true;
  };
}
