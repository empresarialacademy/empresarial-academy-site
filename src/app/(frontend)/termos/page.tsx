import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { termosSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do site e dos serviços da Empresarial Academy.",
  alternates: { canonical: "/termos" },
};

export default function Page() {
  return (
    <main>
      <PageHero
        title="Termos de Uso"
        subtitle="Condições de uso do site e dos serviços da Empresarial Academy."
        crumbs={[{ label: "Termos de Uso" }]}
      />
      <LegalArticle sections={termosSections} />
    </main>
  );
}
