/**
 * Preview de conteúdo "como fica no site" antes de publicar.
 *
 * O botão "Visualizar" do EA HUB (admin.preview em Posts/Materials) monta uma
 * URL para `/preview`, que valida um segredo, liga o draftMode do Next e
 * redireciona para a página real (`/blog/<slug>` ou `/materiais/<slug>`). Em
 * draftMode, a página busca o documento com `overrideAccess` (ignora o filtro
 * de "publicado"), então rascunhos aparecem no layout real. O segredo é a
 * barreira de acesso.
 */

export const PREVIEW_COLLECTIONS = {
  posts: { path: "/blog" },
  materials: { path: "/materiais" },
} as const;

export type PreviewCollection = keyof typeof PREVIEW_COLLECTIONS;

/** Segredo do preview. Em produção deve estar definido; em dev, ausente = livre. */
export function getPreviewSecret(): string | undefined {
  return process.env.PREVIEW_SECRET || undefined;
}

/** URL do botão "Visualizar" no admin (roda no servidor — pode ler o segredo). */
export function buildPreviewUrl(collection: PreviewCollection, slug: string): string {
  const params = new URLSearchParams({ collection, slug });
  const secret = getPreviewSecret();
  if (secret) params.set("secret", secret);
  return `/preview?${params.toString()}`;
}
