import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";

/** Cliente do Payload (Local API) para uso em Server Components e route handlers. */
export const getPayloadClient = () => getPayload({ config });

/** Busca artigos publicados (status published e data de publicação já alcançada). */
export async function getPublishedPosts(limit = 12, page = 1) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "posts",
    where: {
      and: [
        { status: { equals: "published" } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    sort: "-publishedAt",
    depth: 1,
    limit,
    page,
  });
}

/** Busca um artigo publicado pelo slug. */
export async function getPostBySlug(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: "published" } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    depth: 2,
    limit: 1,
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

/** Busca um material publicado pelo slug. */
export async function getMaterialBySlug(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "materials",
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: "published" } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    depth: 2,
    limit: 1,
  });
  return docs[0] ?? null;
}
