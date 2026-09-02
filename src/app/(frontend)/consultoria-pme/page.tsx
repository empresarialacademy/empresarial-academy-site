import type { Metadata } from "next";
import { ConsultoriaLPTemplate } from "@/components/landing/ConsultoriaLPTemplate";

export const metadata: Metadata = {
  title: "Consultoria para PMEs | Organize a gestão e cresça com método",
  description:
    "Consultoria prática para donos de pequenas e médias empresas: organize processos, monte indicadores e volte a crescer com método. Comece pelo diagnóstico gratuito.",
  alternates: { canonical: "/consultoria-pme" },
};

export default function Page() {
  return (
    <ConsultoriaLPTemplate
      eyebrow="Consultoria e mentoria para PMEs · Método Gestão 360"
      h1="A sua empresa depende de você para tudo? Está na hora de organizar a gestão."
      subtitle="As empresas não quebram por falta de vendas — quebram por falta de gestão. Consultoria prática para donos de pequenas e médias empresas que querem sair da correria do dia a dia, colocar indicadores no lugar e crescer com método, não no improviso."
      newsletterOrigem="Newsletter — LP consultoria-pme"
      origemTag="[PME]"
    />
  );
}
