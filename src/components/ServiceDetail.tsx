import { PageHero } from "@/components/layout/PageHero";
import { ProcessFlow } from "@/components/ProcessFlow";
import { SpinCase } from "@/components/SpinCase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { siteConfig } from "@/lib/site-config";
import type { ServicoDetalhe } from "@/lib/content";

export function ServiceDetail({ data }: { data: ServicoDetalhe }) {
  const url = `${siteConfig.url}/servicos/${data.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: data.metaTitle,
        serviceType: data.metaTitle,
        description: data.metaDescription,
        url,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        areaServed: { "@type": "Country", name: "Brasil" },
        audience: {
          "@type": "Audience",
          audienceType: "Empresários e gestores de pequenas e médias empresas",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: data.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main>
      <PageHero
        title={data.hero}
        subtitle={data.subtitle}
        crumbs={[
          { label: "Serviços", href: "/servicos" },
          { label: data.metaTitle },
        ]}
        image={data.image}
        video={data.video}
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-3xl text-lg text-gray">{data.intro}</p>
        {data.bullets.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {data.bullets.map((b) => (
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
        )}
        <div className="mt-10">
          <Button href="/contato" variant="primary" size="lg">
            {data.ctaLabel}
          </Button>
        </div>
      </section>

      {data.comoSaber && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading title={data.comoSaber.titulo} />
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray">
              {data.comoSaber.texto}
            </p>
          </div>
        </section>
      )}

      {data.metodo && <ProcessFlow metodo={data.metodo} />}

      {data.casoPratico && <SpinCase caso={data.casoPratico} />}

      {data.temas && data.temas.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <SectionHeading
              title="Temas disponíveis"
              subtitle="Cada tema nasce dos 6 pilares do Gestão 360 e do conteúdo que publicamos no blog. Se a sua necessidade não estiver aqui, construímos sob medida."
            />
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.temas.map((tema) => (
                <li
                  key={tema.titulo}
                  className="rounded-xl border border-line bg-surface p-6"
                >
                  <h3 className="font-semibold text-navy">{tema.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray">
                    {tema.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {data.diferencialIA && (
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <span className="font-[var(--font-heading)] text-xs font-bold uppercase tracking-widest text-gold">
              Diferencial
            </span>
            <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-bold md:text-3xl">
              {data.diferencialIA.titulo}
            </h2>
            <p className="mt-5 leading-relaxed text-white/80">
              {data.diferencialIA.desc}
            </p>
          </div>
        </section>
      )}

      {data.faq.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading title="Perguntas frequentes" />
            <div className="mt-10">
              <Faq items={data.faq} />
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
