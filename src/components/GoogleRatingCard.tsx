import { getGoogleReviews } from "@/lib/reviews";
import { Stars } from "@/components/GoogleReviews";

/**
 * Card compacto de nota do Google — pensado para preencher o espaço vazio ao
 * lado dos vídeos do YouTube na Home quando há poucos vídeos (mesma altura e
 * estilo de card). Não renderiza nada sem avaliações reais configuradas.
 */
export async function GoogleRatingCard() {
  const data = await getGoogleReviews();
  if (!data) return null;

  const ratingLabel = data.averageRating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <a
      href="/depoimentos"
      className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden bg-navy p-6 text-center">
        <Stars rating={data.averageRating} size={22} />
        <span className="font-[var(--font-heading)] text-3xl font-bold text-gold">
          {ratingLabel}
        </span>
        <span className="text-sm text-white/70">
          {data.totalCount}{" "}
          {data.totalCount === 1 ? "avaliação" : "avaliações"} no Google
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-navy group-hover:text-gold-ink">
          Veja o que dizem sobre a Empresarial Academy
        </h3>
      </div>
    </a>
  );
}
