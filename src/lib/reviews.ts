/**
 * Avaliações do Google via Featurable (https://featurable.com — plano free).
 * Ativa apenas com FEATURABLE_API_KEY + FEATURABLE_WIDGET_ID definidos; sem
 * eles (ou em erro), retorna null e as seções de prova social simplesmente
 * não renderizam. Mesmo padrão defensivo do lib/instagram.ts.
 *
 * API real (confirmada em featurable.com/docs/api-reference/widgets/,
 * 2026-07-24): GET https://featurable.com/api/v2/widgets/{uuid} com header
 * X-API-Key — retorna { widget: { reviews: [...], gbpLocationSummary } }.
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

type FeaturableReview = {
  author?: { name?: string };
  /** Pode vir traduzido pelo Google (ex.: PT-BR → inglês). */
  text?: string;
  /** Texto EXATAMENTE como o cliente escreveu; vazio quando não houve tradução. */
  originalText?: string;
  rating?: { value?: number };
  publishedAt?: string;
};

type FeaturableWidgetResponse = {
  success?: boolean;
  widget?: {
    reviews?: FeaturableReview[];
    gbpLocationSummary?: { reviewsCount?: number; rating?: number };
    /** true enquanto o widget não está de fato ligado a um Google Business Profile. */
    isExampleReviews?: boolean;
  };
};

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.FEATURABLE_API_KEY;
  const widgetId = process.env.FEATURABLE_WIDGET_ID;
  if (!apiKey || !widgetId) return null;

  try {
    const res = await fetch(
      `https://featurable.com/api/v2/widgets/${widgetId}`,
      {
        headers: { accept: "application/json", "X-API-Key": apiKey },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as FeaturableWidgetResponse;
    const widget = data.widget;
    // Enquanto o widget não estiver de fato ligado a um Google Business
    // Profile, a API devolve avaliações de exemplo fictícias — nunca exibir
    // (decisão do projeto: não fabricar prova social falsa).
    if (!widget || widget.isExampleReviews) return null;

    const reviews: GoogleReview[] = (widget.reviews ?? [])
      .map((r) => ({
        name: r.author?.name?.trim() || "Cliente Google",
        rating:
          typeof r.rating?.value === "number" ? r.rating.value : 5,
        // `originalText` é o que o cliente realmente escreveu; o Google às
        // vezes devolve `text` já traduzido para inglês. Preferir o original
        // mantém a avaliação em PT-BR e fiel às palavras da pessoa.
        text: ((r.originalText ?? "").trim() || (r.text ?? "").trim()),
        date: r.publishedAt ?? null,
      }))
      .filter((r) => r.text.length > 0);

    if (reviews.length === 0) return null;

    const summary = widget.gbpLocationSummary;
    const averageRating =
      typeof summary?.rating === "number"
        ? Math.round(summary.rating * 10) / 10
        : Math.round(
            (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10,
          ) / 10;

    return {
      averageRating,
      totalCount:
        typeof summary?.reviewsCount === "number"
          ? summary.reviewsCount
          : reviews.length,
      reviews,
    };
  } catch (e) {
    console.error("[reviews] falha ao buscar avaliações:", e);
    return null;
  }
}
