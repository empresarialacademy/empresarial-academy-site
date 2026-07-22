import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  cursoBeneficios,
  cursoFerramentas,
  cursoModulos,
  pilares,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Curso Gestão 360",
  description:
    "Curso completo em 6 pilares: vendas, marketing, liderança, processos, finanças e cultura. Transforme sua empresa em uma máquina de resultados.",
  alternates: { canonical: "/servicos/curso-gestao-360" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Curso Gestão 360",
  description:
    "Curso completo de gestão empresarial em 6 pilares (vendas, marketing, liderança, processos, finanças e cultura) para transformar a empresa em uma máquina de resultados.",
  url: `${siteConfig.url}/servicos/curso-gestao-360`,
  inLanguage: "pt-BR",
  provider: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  educationalLevel: "Empresários e gestores de PMEs",
  teaches: pilares.map((p) => p.titulo),
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    inLanguage: "pt-BR",
  },
};

export default function Page() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <PageHero
        title="Curso Gestão 360: transforme seu negócio em uma máquina de resultados"
        subtitle="Um curso completo, direto e prático que integra todos os pilares fundamentais da gestão empresarial."
        image="/images/banner-curso.jpg"
        crumbs={[
          { label: "Serviços", href: "/servicos" },
          { label: "Curso Gestão 360" },
        ]}
      />

      {/* Introdução */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-3xl text-lg text-gray">
          Nosso carro-chefe. Reúne as estratégias que realmente funcionam para
          transformar empresas em organizações mais lucrativas, organizadas e de
          alto desempenho — abordando vendas, marketing, liderança, processos,
          finanças, cultura organizacional, experiência do cliente, expansão e
          muito mais.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {cursoBeneficios.map((b) => (
            <li
              key={b}
              className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 text-sm text-navy"
            >
              <span className="text-gold-ink" aria-hidden>
                ✔
              </span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* 6 Pilares */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            title="Os 6 pilares do Gestão 360"
            subtitle="A base do método para estruturar e escalar a sua empresa."
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pilares.map((p) => (
              <li
                key={p.n}
                className="relative rounded-xl border border-line bg-surface p-7"
              >
                <span className="absolute right-6 top-6 font-[var(--font-heading)] text-3xl font-bold text-line">
                  {p.n}
                </span>
                <span className="text-3xl" aria-hidden>
                  {p.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm text-gray">{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Módulos + Ferramentas */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title="Principais módulos" />
            <ol className="mt-8 space-y-3">
              {cursoModulos.map((m, i) => (
                <li key={m} className="flex gap-3 text-gray">
                  <span className="font-[var(--font-heading)] font-bold text-gold-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading title="Técnicas e ferramentas" />
            <ul className="mt-8 grid gap-3">
              {cursoFerramentas.map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray">
                  <span className="text-gold-ink" aria-hidden>
                    ◆
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Para quem + CTA */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Para empresários e líderes que querem crescer com método
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Ideal para quem deseja ampliar a visão estratégica do negócio,
            corrigir gargalos e potencializar lucros — com exemplos reais,
            ferramentas práticas e materiais de apoio para aplicar de imediato.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/contato" variant="primary" size="lg">
              Entrar na lista de prioridade
            </Button>
            <Button href="/materiais" variant="outline" size="lg">
              Materiais gratuitos
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
