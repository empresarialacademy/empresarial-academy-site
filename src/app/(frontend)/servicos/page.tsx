import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { pilares } from "@/lib/content";
import { servicosMenu, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Curso Gestão 360 (6 pilares), Mentorias Estratégicas, Palestras, Consultoria e o Livro Gestão 360.",
  alternates: { canonical: "/servicos" },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: servicosMenu.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.title,
      description: s.desc,
      url: `${siteConfig.url}${s.href}`,
      provider: { "@type": "Organization", name: siteConfig.name },
      areaServed: "BR",
    },
  })),
};

export default function Page() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <PageHero
        title="Conheça nossos serviços e produtos"
        subtitle="Transforme sua empresa em uma máquina de resultados com métodos validados."
        crumbs={[{ label: "Serviços" }]}
      />

      {/* Curso Gestão 360 — 6 pilares */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title="Curso Gestão 360"
          subtitle="6 pilares com metodologia prática para organizar processos, multiplicar lucros e liderar com clareza."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pilares.map((p) => (
            <li
              key={p.n}
              className="relative rounded-xl border border-line bg-white p-7"
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
        <div className="mt-10">
          <Button href="/servicos/curso-gestao-360" variant="secondary" size="md">
            Detalhes do Curso Gestão 360
          </Button>
        </div>
      </section>

      {/* Outros serviços */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading title="Soluções para cada momento do seu negócio" align="center" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicosMenu.map((s) => (
              <li
                key={s.href}
                className="flex flex-col rounded-xl border border-line bg-surface p-7"
              >
                <span className="text-4xl" aria-hidden>
                  {s.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">
                  {s.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-gray">{s.desc}</p>
                <Link
                  href={s.href}
                  className="mt-4 inline-block text-sm font-semibold text-gold-ink hover:underline"
                >
                  Saiba mais →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Não sabe por onde começar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Faça uma avaliação gratuita e descubra a solução ideal para o momento
            da sua empresa.
          </p>
          <div className="mt-6">
            <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="lg">
              Fazer diagnóstico gratuito
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
