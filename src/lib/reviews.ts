/**
 * Avaliações do Google via Featurable (https://featurable.com — plano free).
 * Ativa apenas com FEATURABLE_WIDGET_ID definido; sem ele (ou em erro),
 * retorna null e as seções de prova social simplesmente não renderizam.
 * Mesmo padrão defensivo do lib/instagram.ts.
 */

export type GoogleReview = {
  name: string;
  rating: number;
  text: string;
  /** ISO date, quando disponível. */
  date: string | null;
};

export type GoogleReviewsData = {
  averageRating: number;
  totalCount: number;
  reviews: GoogleReview[];
};

const STAR_ENUM: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function toRating(v: unknown): number {
  if (typeof v === "number" && v >= 1 && v <= 5) return v;
  if (typeof v === "string" && STAR_ENUM[v]) return STAR_ENUM[v];
  return 5;
}

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const widgetId = process.env.FEATURABLE_WIDGET_ID;
  if (!widgetId) return null;

  try {
    const res = await fetch(
      `https://featurable.com/api/v1/widgets/${widgetId}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();

    const rawReviews: unknown[] = Array.isArray(data?.reviews)
      ? data.reviews
      : [];

    const reviews: GoogleReview[] = rawReviews
      .map((raw) => {
        const r = raw as {
          reviewer?: { displayName?: string };
          starRating?: unknown;
          comment?: string;
          createTime?: string;
        };
        return {
          name: r.reviewer?.displayName?.trim() || "Cliente Google",
          rating: toRating(r.starRating),
          text: (r.comment ?? "").trim(),
          date: r.createTime ?? null,
        };
      })
      .filter((r) => r.text.length > 0);

    if (reviews.length === 0) return null;

    const averageRating =
      typeof data?.averageRating === "number"
        ? Math.round(data.averageRating * 10) / 10
        : Math.round(
            (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10,
          ) / 10;

    return {
      averageRating,
      totalCount:
        typeof data?.totalReviewCount === "number"
          ? data.totalReviewCount
          : reviews.length,
      reviews,
    };
  } catch (e) {
    console.error("[reviews] falha ao buscar avaliações:", e);
    return null;
  }
}
