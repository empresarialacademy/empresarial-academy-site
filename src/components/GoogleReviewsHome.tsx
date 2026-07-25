import { getGoogleReviews } from "@/lib/reviews";
import { GoogleReviewsCarousel } from "@/components/GoogleReviewsCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/**
 * Seção de avaliações do Google da Home — fundo navy (contrasta com a seção
 * do YouTube, de fundo branco, logo acima). Título "O que nossos clientes
 * dizem" + botão para /depoimentos, e o carrossel de avaliações reais.
 * Não renderiza nada sem avaliações configuradas.
 */
export async function GoogleReviewsHome() {
  const data = await getGoogleReviews();
  if (!data) return null;

  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title="O que nossos clientes dizem"
          subtitle="Avaliações reais de quem aplicou nosso método e viu resultado."
          align="center"
          invert
        />

        {/* Carrossel em card claro para os depoimentos saltarem sobre o navy. */}
        <GoogleReviewsCarousel reviews={data.reviews.slice(0, 6)} />

        <div className="mt-10 flex justify-center">
          <Button href="/depoimentos" variant="primary" size="md">
            Ver todos os depoimentos
          </Button>
        </div>
      </div>
    </section>
  );
}
