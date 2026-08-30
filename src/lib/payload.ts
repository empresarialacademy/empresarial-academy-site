import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";

/** Cliente do Payload (Local API) para uso em Server Components e route handlers. */
export const getPayloadClient = () => getPayload({ config });

/**
 * Busca artigos publicados (status published e data de publicação já
 * alcançada). `categorySlug` filtra por categoria (usado pelo filtro do
 * /blog); omitido ou "todas" traz todas.
 */
export async function getPublishedPosts(
  limit = 12,
  page = 1,
  categorySlug?: string,
) {
  const payload = await getPayloadClient();
  const and: Where[] = [
    { status: { equals: "published" } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ];
  if (categorySlug && categorySlug !== "todas") {
    and.push({ "category.slug": { equals: categorySlug } });
  }
  return payload.find({
    collection: "posts",
    where: { and },
    sort: "-publishedAt",
    depth: 1,
    limit,
    page,
  });
}

/** Categorias do blog (para o filtro em /blog), ordenadas por nome. */
export async function getBlogCategories() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "categories",
    sort: "name",
    depth: 0,
    limit: 100,
  });
  return docs;
}

/**
 * Busca um artigo pelo slug. Em modo preview (`draft: true`, acionado pela
 * rota /preview autenticada por segredo) ignora o filtro de publicado e usa
 * `overrideAccess` para trazer o rascunho — assim o botão "Visualizar" do EA
 * HUB mostra o conteúdo salvo no layout real, mesmo antes de publicar.
 */
export async function getPostBySlug(slug: string, opts?: { draft?: boolean }) {
  const payload = await getPayloadClient();
  const where: Where = opts?.draft
    ? { slug: { equals: slug } }
    : {
        and: [
          { slug: { equals: slug } },
          { status: { equals: "published" } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      };
  const { docs } = await payload.find({
    collection: "posts",
    where,
    depth: 2,
    limit: 1,
    overrideAccess: Boolean(opts?.draft),
  });
  return docs[0] ?? null;
}

/** Busca materiais publicados. */
export async function getPublishedMaterials(limit = 50) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "materials",
    where: {
      and: [
        { status: { equals: "published" } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    sort: ["-featured", "-publishedAt"],
    depth: 1,
    limit,
  });
}

/** Categorias de materiais. */
export async function getMaterialCategories() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "material-categories",
    sort: "name",
    limit: 100,
  });
  return docs;
}

/**
 * Sistemas com URL cadastrada (portfólio "ao vivo"), pra página institucional
 * /tecnologia — a mesma coleção `system-links` do EA HUB, mas só o que já
 * está publicado (sem os cards "em breve" nem a entrada do próprio HUB).
 */
export async function getActiveSystemLinks() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "system-links",
    sort: "order",
    limit: 100,
    depth: 0,
  });
  return docs.filter((doc) => {
    const url = ((doc as { url?: string | null }).url ?? "").trim();
    if (!url) return false;
    if (url === "/eahub" || url.includes("/eahub/")) return false;
    return true;
  });
}

/** Depoimentos publicados (opcionalmente só os destacados). */
export async function getTestimonials(onlyFeatured = false, limit = 50) {
  const payload = await getPayloadClient();
  const where: Where = onlyFeatured
    ? {
        and: [
          { status: { equals: "published" } },
          { featured: { equals: true } },
        ],
      }
    : { status: { equals: "published" } };
  return payload.find({ collection: "testimonials", where, depth: 1, limit });
}

/** Busca um material pelo slug. Em modo preview traz o rascunho (ver getPostBySlug). */
export async function getMaterialBySlug(slug: string, opts?: { draft?: boolean }) {
  const payload = await getPayloadClient();
  const where: Where = opts?.draft
    ? { slug: { equals: slug } }
    : {
        and: [
          { slug: { equals: slug } },
          { status: { equals: "published" } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      };
  const { docs } = await payload.find({
    collection: "materials",
    where,
    depth: 2,
    limit: 1,
    overrideAccess: Boolean(opts?.draft),
  });
  return docs[0] ?? null;
}
