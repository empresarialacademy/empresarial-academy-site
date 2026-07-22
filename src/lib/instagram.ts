export type InstagramPost = {
  id: string;
  permalink: string;
  image: string;
  type: "image" | "video" | "carousel";
  caption: string;
};

type BeholdSize = { mediaUrl?: string };
type BeholdPost = {
  id: string;
  permalink: string;
  mediaType?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  prunedCaption?: string;
  caption?: string;
  sizes?: { small?: BeholdSize; medium?: BeholdSize };
};
type BeholdFeed = { posts?: BeholdPost[] };

/**
 * Busca os últimos posts do Instagram via feed JSON do Behold (BEHOLD_FEED_URL).
 * Usa as imagens hospedadas pelo próprio Behold (estáveis). Retorna [] se não
 * configurado ou em caso de falha — a seção exibe o CTA de seguir.
 */
export async function getInstagramPosts(limit = 8): Promise<InstagramPost[]> {
  const url = process.env.BEHOLD_FEED_URL;
  if (!url) return [];
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as BeholdFeed;
    const posts = Array.isArray(data.posts) ? data.posts : [];
    return posts.slice(0, limit).map((p) => ({
      id: p.id,
      permalink: p.permalink,
      image:
        p.sizes?.medium?.mediaUrl ??
        p.sizes?.small?.mediaUrl ??
        p.thumbnailUrl ??
        p.mediaUrl ??
        "",
      type:
        p.mediaType === "VIDEO"
          ? "video"
          : p.mediaType === "CAROUSEL_ALBUM"
            ? "carousel"
            : "image",
      caption: (p.prunedCaption ?? p.caption ?? "").slice(0, 140),
    }));
  } catch {
    return [];
  }
}
