import type { Metadata } from "next";
import { ConsultoriaLPTemplate } from "@/components/landing/ConsultoriaLPTemplate";

/**
 * LP dedicada à palavra-chave "consultoria empresarial para pequenas
 * empresas" (Google Ads — 10 a 100 buscas/mês, +900% no ano, concorrência
 * menor que a outra keyword). Canonical aponta para /consultoria-pme pelo
 * mesmo motivo da LP irmã — ver
 * `consultoria-de-gestao-empresarial/page.tsx`.
 */
export const metadata: Metadata = {
  title:
    "Consultoria Empresarial para Pequenas Empresas | Organize a gestão e cresça com método",
  description:
    "Consultoria empresarial para pequenas empresas que querem sair do improviso. Diagnóstico gratuito, plano prático e acompanhamento direto com o fundador.",
  alternates: { canonical: "/consultoria-pme" },
};

export default function Page() {
  return (
    <ConsultoriaLPTemplate
      eyebrow="Consultoria Empresarial para Pequenas Empresas · Método Gestão 360"
      h1="Consultoria Empresarial para Pequenas Empresas que querem sair do improviso"
      subtitle="Consultoria empresarial pensada para o tamanho e o orçamento de uma pequena empresa: organize processos, monte indicadores simples e tenha um plano prático para crescer com controle — sem depender só do seu esforço."
      newsletterOrigem="Newsletter — LP pequenas-empresas"
    />
  );
}
