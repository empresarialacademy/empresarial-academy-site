import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Faq } from "@/components/ui/Faq";
import { Button } from "@/components/ui/Button";
import { faq } from "@/lib/content";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Tire suas dúvidas sobre a Empresarial Academy: serviços, mentorias, avaliação gratuita e mais.",
  alternates: { canonical: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <main>
      <PageHero
        title="Perguntas frequentes"
        subtitle="Reunimos as dúvidas mais comuns para te ajudar a dar o próximo passo."
        crumbs={[{ label: "FAQ" }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Faq items={faq} />

        <div className="mt-16 rounded-2xl bg-navy px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Ainda tem dúvidas?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Fale com a nossa equipe e descubra como podemos impulsionar o seu
            negócio.
          </p>
          <div className="mt-6">
            <Button href="/contato" variant="primary" size="lg">
              Fale conosco
            </Button>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
