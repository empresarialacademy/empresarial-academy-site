import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { pilares } from "@/lib/content";
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

/**
 * "O que você vai encontrar" — um capítulo por pilar do método, escrito em
 * voz de recomendação (como quem já leu e está indicando), não como
 * sumário técnico. Pedido do Thiago (2026-07-26): ser mais abrangente sobre
 * o conteúdo e "um bom crítico" — por isso a seção termina com o aviso
 * honesto sobre para quem o livro serve e para quem não serve, em vez de só
 * elogio.
 */
const oQueVaiEncontrar = [
  "Como organizar a rotina, a liderança e a execução para tirar a operação do caos e devolver o seu tempo.",
  "Como estruturar a empresa com propósito e um modelo de crescimento que se sustenta — não um crescimento por acaso.",
  "Como transformar visão em meta, indicador e prazo, em vez de intenção vaga que nunca sai do papel.",
  "Como tomar decisão por indicador e controle financeiro, não por achismo ou pela sensação de que as coisas 'parecem' estar indo bem.",
  "Como lidar com pessoas, pressão e conflito — a parte que a maioria dos livros de gestão pula.",
  "Como manter a empresa competitiva com inovação, marketing e visão de futuro, sem parar no primeiro resultado.",
] as const;

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
        subtitle="Aprendizados reais de quem viveu os desafios da liderança e construiu negócios lucrativos com propósito. O livro será lançado em breve — entre na lista de espera."
        crumbs={[{ label: "Livro Gestão 360" }]}
        video="/videos/banner-livro-gestao.mp4"
        imageAlt="Vídeo de apresentação do Livro Gestão 360, de Thiago Marchi"
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-navy shadow-xl">
            <Image
              src="/images/livro-gestao-360.jpg"
              alt="Capa do Livro Gestão 360, de Thiago Marchi"
              width={560}
              height={894}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="h-auto w-full"
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

      {/* O que você vai encontrar — voz de recomendação, um capítulo por pilar */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            title="No Gestão 360, você vai encontrar"
            subtitle="O livro segue os mesmos 6 pilares que sustentam o método — cada capítulo resolve um gargalo específico da gestão, nesta ordem."
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pilares.map((p, i) => (
              <li
                key={p.n}
                className="relative rounded-xl border border-line bg-surface p-7"
              >
                <span className="absolute right-6 top-6 font-[var(--font-heading)] text-3xl font-bold text-line">
                  {p.n}
                </span>
                <Icon name={p.icon} className="h-9 w-9 text-gold-ink" />
                <h3 className="mt-4 text-lg font-semibold text-navy">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">
                  {oQueVaiEncontrar[i]}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-12 max-w-3xl rounded-2xl border-l-2 border-gold bg-surface p-7">
            <h3 className="font-[var(--font-heading)] text-sm font-semibold uppercase tracking-wide text-gold-ink">
              Um aviso honesto
            </h3>
            <p className="mt-3 leading-relaxed text-navy">
              Não é um livro de fórmula mágica nem de motivação vazia — é
              método, escrito para quem está disposto a aplicar, não só a
              ler. Se você busca um atalho ou uma leitura leve de fim de
              semana, provavelmente não é para você. Se você quer organizar a
              gestão com disciplina e sair do improviso, é exatamente para
              isso que ele foi escrito.
            </p>
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
