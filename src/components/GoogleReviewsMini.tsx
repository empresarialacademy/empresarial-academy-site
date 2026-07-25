import { getGoogleReviews } from "@/lib/reviews";
import { GoogleReviewsCarousel } from "@/components/GoogleReviewsCarousel";

/**
 * Carrossel de avaliações do Google encaixado como mais um item da grade
 * (ex.: ao lado dos cards de vídeo do YouTube na Home). Sem cabeçalho/nota
 * resumida — é o carrossel de verdade, só dimensionado para caber na coluna.
 * Não renderiza nada sem avaliações reais configuradas.
 */
export async function GoogleReviewsMini() {
  const data = await getGoogleReviews();
  if (!data) return null;

  return (
    <div className="[&>div]:mt-0">
      <GoogleReviewsCarousel reviews={data.reviews.slice(0, 6)} />
    </div>
  );
}
