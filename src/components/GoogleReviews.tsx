import { getGoogleReviews } from "@/lib/reviews";
import { siteConfig } from "@/lib/site-config";
import { formatDatePtBR } from "@/lib/format";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${rating} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? "#C1A160" : "#D9DCE1"}
          aria-hidden
        >
          <path d="M12 2l2.9 6.26 6.6.7-4.95 4.5 1.38 6.54L12 16.77 6.07 20l1.38-6.54L2.5 8.96l6.6-.7L12 2z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Prova social — avaliações reais do Google (via Featurable).
 * Não renderiza nada enquanto FEATURABLE_WIDGET_ID não estiver configurado.
 */
export async function GoogleReviews({
  limit = 6,
  withSchema = false,
}: {
  limit?: number;
  /** Emite AggregateRating + Review JSON-LD (usar em UMA página, ex.: /depoimentos). */
  withSchema?: boolean;
}) {
  const data = await getGoogleReviews();
  if (!data) return null;

  const shown = data.reviews.slice(0, limit);
  const ratingLabel = data.averageRating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const schema = withSchema
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: data.averageRating,
          reviewCount: data.totalCount,
          bestRating: 5,
          worstRating: 1,
        },
        review: shown.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.name },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
          reviewBody: r.text,
        })),
      }
    : null;

  return (
    <section className="bg-white">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy md:text-3xl">
            O que nossos clientes dizem
          </h2>
          <span aria-hidden className="mx-auto mt-4 block h-px w-24 bg-gold" />
          <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5">
            <Stars rating={data.averageRating} size={18} />
            <span className="font-[var(--font-heading)] font-bold text-navy">
              {ratingLabel}
            </span>
            <span className="text-sm text-gray">
              · {data.totalCount}{" "}
              {data.totalCount === 1 ? "avaliação" : "avaliações"} no Google
            </span>
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <li
              key={`${r.name}-${r.date ?? r.text.slice(0, 16)}`}
              className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-[var(--font-heading)] text-sm font-bold text-gold"
                >
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {r.name}
                  </p>
                  <Stars rating={r.rating} size={13} />
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-gray">
                “{r.text}”
              </p>
              {r.date && (
                <p className="mt-3 text-xs text-gray/70">
                  {formatDatePtBR(r.date)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
