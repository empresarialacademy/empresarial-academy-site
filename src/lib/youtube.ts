import { siteConfig } from "@/lib/site-config";

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  published: string;
};

/**
 * Busca os últimos vídeos do canal via feed RSS público (sem API key).
 * Retorna [] se o canal não tiver vídeos ou o feed falhar — a seção some sozinha.
 */
export async function getLatestVideos(limit = 3): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${siteConfig.youtubeChannelId}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const entries = xml.split("<entry>").slice(1);
    const videos: YouTubeVideo[] = [];
    for (const entry of entries.slice(0, limit)) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (!id || !title) continue;
      videos.push({
        id,
        title: title.replace(/&amp;/g, "&"),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        published: published ?? "",
      });
    }
    return videos;
  } catch {
    return [];
  }
}
