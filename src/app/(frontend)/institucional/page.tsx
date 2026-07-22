import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  diferenciais,
  fundador,
  fundadorConquistas,
  missao,
  porqueConfiar,
  valores,
  visao,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Institucional",
  description:
    "Conheça a história, missão, visão, valores e o fundador Thiago Marchi da Empresarial Academy.",
  alternates: { canonical: "/institucional" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: fundador.nome,
  jobTitle: fundador.cargo,
  description:
    "Fundador da Empresarial Academy. Mais de 20 anos em liderança estratégica e 8 anos como empresário, especialista em gestão, vendas e liderança de alta performance.",
  worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  url: `${siteConfig.url}/institucional`,
  sameAs: [siteConfig.social.linkedin, siteConfig.social.instagram],
};

export default function Page() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <PageHero
        title="Conhecimento que impulsiona empresários a construir negócios sólidos"
        subtitle="Nascemos para transformar gestão em resultado, com método, clareza e aplicação prática."
        crumbs={[{ label: "Institucional" }]}
        image="/images/banner-institucional.jpg"
        imageAlt={`${fundador.nome}, ${fundador.cargo}`}
      />

      {/* História */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title="Nossa história e propósito"
          subtitle="Educação aplicada à realidade dos negócios, do conhecimento à execução."
        />
        <div className="mt-8 grid gap-6 text-gray md:grid-cols-2">
          <p>
            A Empresarial Academy nasceu com o propósito de transformar empresas
            através da educação aplicada à realidade dos negócios. Unimos
            conhecimento prático, estratégia e visão de mercado para capacitar
            empresários e líderes a alcançarem mais lucro, controle e liberdade.
          </p>
          <p>
            Com foco em soluções acessíveis e de impacto imediato, desenvolvemos
            treinamentos, mentorias e materiais aplicáveis no dia a dia
            empresarial — ajudando a enfrentar desafios reais com método e
            clareza, e a promover crescimento sustentável.
          </p>
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-8">
            <h3 className="font-[var(--font-heading)] text-sm font-semibold uppercase tracking-wide text-gold-ink">
              Missão
            </h3>
            <p className="mt-4 text-navy">{missao}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-8">
            <h3 className="font-[var(--font-heading)] text-sm font-semibold uppercase tracking-wide text-gold-ink">
              Visão 2030
            </h3>
            <p className="mt-4 text-navy">{visao}</p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading title="Nossos valores" align="center" />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {valores.map((v, i) => (
            <li
              key={v.titulo}
              className="rounded-xl border border-line bg-white p-7"
            >
              <span className="font-[var(--font-heading)] text-2xl font-bold text-gold-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-navy">{v.titulo}</h3>
              <p className="mt-2 text-sm text-gray">{v.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Fundador */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1fr]">
          <Image
            src="/images/thiago-marchi.jpg"
            alt={`${fundador.nome}, ${fundador.cargo}`}
            width={520}
            height={347}
            className="rounded-2xl shadow-2xl"
          />
          <div>
            <SectionHeading title={`Sobre o fundador: ${fundador.nome}`} invert />
            <blockquote className="mt-6 border-l-2 border-gold pl-4 text-lg italic text-gold-light">
              “{fundador.frase}”
            </blockquote>
            {fundador.bio.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 text-white/80">
                {p}
              </p>
            ))}
            <ul className="mt-6 space-y-2">
              {fundadorConquistas.map((c) => (
                <li key={c} className="flex gap-3 text-sm text-white/80">
                  <span className="text-gold" aria-hidden>
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Por que confiar */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            title="Por que confiar na Empresarial Academy"
            align="center"
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {porqueConfiar.map((item) => (
              <li
                key={item.titulo}
                className="rounded-xl border border-line bg-surface p-7"
              >
                <span className="text-3xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">
                  {item.titulo}
                </h3>
                <p className="mt-2 text-sm text-gray">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Diferenciais + CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading title="Nossos diferenciais" align="center" />
        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {diferenciais.map((d) => (
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
        <div className="mt-12 text-center">
          <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="lg">
            Faça uma avaliação gratuita
          </Button>
        </div>
      </section>
    </main>
  );
}
