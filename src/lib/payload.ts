export const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function mapPost(doc: any) {
  if (!doc) return null;
  return {
    ...doc,
    coverImage: doc.coverUrl ? { url: doc.coverUrl } : null,
    category: doc.category ? { name: doc.category } : null,
  };
}

export async function getPublishedPosts(limit = 12, page = 1) {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/articles?limit=${limit}&page=${page}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const json = await res.json();
    return { docs: (json.docs || []).map(mapPost) };
  } catch (err) {
    console.error(err);
    return { docs: [] };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/articles/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch post");
    const json = await res.json();
    return mapPost(json.doc);
  } catch (err) {
    console.error(err);
    return null;
  }
}

function mapMaterial(doc: any) {
  if (!doc) return null;
  return {
    ...doc,
    coverImage: doc.coverUrl ? { url: doc.coverUrl } : null,
    category: doc.category ? { name: doc.category } : null,
  };
}

export async function getPublishedMaterials(limit = 50) {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/materials?limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch materials");
    const json = await res.json();
    return { docs: (json.docs || []).map(mapMaterial) };
  } catch (err) {
    console.error(err);
    return { docs: [] };
  }
}

export async function getMaterialBySlug(slug: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/materials/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch material");
    const json = await res.json();
    return mapMaterial(json.doc);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getMaterialCategories() {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/categories`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    return json.docs || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getTestimonials(onlyFeatured = false, limit = 50) {
  try {
    const res = await fetch(`${getApiUrl()}/api/public/testimonials?featured=${onlyFeatured}&limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch testimonials");
    const json = await res.json();
    return { docs: json.docs || [] };
  } catch (err) {
    console.error(err);
    return { docs: [] };
  }
}
