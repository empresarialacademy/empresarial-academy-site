import { PageHero } from "@/components/layout/PageHero";
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
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-3xl text-lg text-gray">{data.intro}</p>
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
        <div className="mt-10">
          <Button href="/contato" variant="primary" size="lg">
            {data.ctaLabel}
          </Button>
        </div>
      </section>

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
