import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/TestimonialCard";
import { VideoTestimonial } from "@/components/VideoTestimonial";
import { GoogleReviews } from "@/components/GoogleReviews";
import { depoimentosVideo } from "@/lib/content";
import { getTestimonials } from "@/lib/payload";

const videosDepoimento = [
  depoimentosVideo.fabio,
  depoimentosVideo.daniella,
  depoimentosVideo.erik,
];

export const metadata: Metadata = {
  title: "Depoimentos",
  description:
    "O que empresários e gestores dizem sobre a Empresarial Academy.",
  alternates: { canonical: "/depoimentos" },
};

export const revalidate = 60;

export default async function DepoimentosPage() {
  const { docs: items } = await getTestimonials(false, 60);

  return (
    <main>
      <PageHero
        title="Quem já transformou a gestão com a gente"
        subtitle="Histórias de empresários e gestores que aplicaram nosso método e geraram resultado."
        crumbs={[{ label: "Depoimentos" }]}
        image="/images/depoimentos.jpg"
      />

      {/* Avaliações reais do Google (com AggregateRating p/ estrelas na busca) */}
      <GoogleReviews limit={12} withSchema />

      {/* Depoimentos em vídeo — mesmo conteúdo usado na Home/Serviços/Materiais */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            title="Depoimentos em vídeo"
            subtitle="Clientes contando, com a própria voz, o resultado que tiveram."
            align="center"
          />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videosDepoimento.map((v) => (
              <li key={v.name}>
                <VideoTestimonial
                  video={v.video}
                  poster={v.poster}
                  name={v.name}
                  role={v.role}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <p className="text-4xl" aria-hidden>
              💬
            </p>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              Em breve, histórias de transformação
            </h2>
            <p className="mt-2 text-gray">
              Estamos reunindo os depoimentos de quem já cresceu com a Empresarial
              Academy.
            </p>
            <div className="mt-6">
              <Button href="/contato" variant="primary" size="md">
                Quero ser o próximo case
              </Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <li key={t.id}>
                <TestimonialCard item={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
