import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { exclusaoDadosSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Exclusão de Dados",
  description:
    "Como solicitar a exclusão dos seus dados pessoais e do histórico de mensagens na Empresarial Academy, conforme a LGPD (Lei nº 13.709/2018).",
  alternates: { canonical: "/exclusao-de-dados" },
};

export default function Page() {
  return (
    <main>
      <PageHero
        title="Exclusão de Dados"
        subtitle="Como pedir a exclusão dos seus dados pessoais e do histórico das suas mensagens."
        crumbs={[{ label: "Exclusão de Dados" }]}
      />
      <LegalArticle sections={exclusaoDadosSections} />
    </main>
  );
}
