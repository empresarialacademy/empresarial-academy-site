import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Livro Gestão 360",
  description:
    "Livro Gestão 360, de Thiago Marchi: a gestão que gera lucro, liberdade e domínio. Leitura acessível e estratégica, com ferramentas práticas. Em breve.",
  alternates: { canonical: "/livro-gestao-360" },
};

const destaques = [
  "Leitura acessível e estratégica",
  "Ferramentas práticas ao longo dos capítulos",
  "Casos reais e soluções aplicáveis",
  "Ideal para empresários, gestores e novos líderes",
];

const bookJsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: "Gestão 360",
  author: { "@type": "Person", name: siteConfig.founder },
  publisher: { "@type": "Organization", name: siteConfig.name },
  inLanguage: "pt-BR",
  about: "Gestão empresarial, liderança e crescimento de PMEs",
  url: `${siteConfig.url}/livro-gestao-360`,
  workExample: {
    "@type": "Book",
    bookFormat: "https://schema.org/Paperback",
    potentialAction: {
      "@type": "ReadAction",
      expectsAcceptanceOf: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
      },
    },
  },
};

export default function Page() {
  return (
    <main>
      <PageHero
        title="Livro Gestão 360: a gestão que gera lucro, liberdade e domínio"
        subtitle="Aprendizados reais de quem viveu os desafios da liderança e construiu negócios lucrativos com propósito."
        crumbs={[{ label: "Livro Gestão 360" }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-navy shadow-xl">
            <Image
              src="/images/livro-gestao-360.jpg"
              alt="Capa do livro Gestão 360, de Thiago Marchi"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
              Em breve
            </span>
          </div>

          <div>
            <p className="text-lg text-gray">
              Desenvolvido para empresários que querem organizar a gestão,
              fortalecer a liderança e escalar com segurança, o{" "}
              <strong className="text-navy">Livro Gestão 360</strong> transforma
              conhecimento em prática e planejamento em resultado — com conteúdo
              direto, aplicável e pensado para a realidade das PMEs.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {destaques.map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 text-sm text-navy"
                >
                  <span className="text-gold-ink" aria-hidden>
                    ✔
                  </span>
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href="/contato" variant="primary" size="lg">
                Entrar na lista de espera
              </Button>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
    </main>
  );
}
