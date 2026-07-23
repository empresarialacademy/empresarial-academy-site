import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { privacidadeSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da Empresarial Academy, em conformidade com a LGPD (Lei nº 13.709/2018).",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return (
    <main>
      <PageHero
        title="Política de Privacidade"
        subtitle="Como coletamos, usamos e protegemos seus dados, em conformidade com a LGPD."
        crumbs={[{ label: "Política de Privacidade" }]}
      />
      <LegalArticle sections={privacidadeSections} />
    </main>
  );
}
