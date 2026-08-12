"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BackToTop } from "@/components/layout/BackToTop";
import { CapturePopup } from "@/components/CapturePopup";
import { LPHeader } from "@/components/landing/LPHeader";
import { LPFooter } from "@/components/landing/LPFooter";

/**
 * Landing pages de tráfego pago (Google/Meta Ads) — mesmo H1/oferta,
 * URL diferente por palavra-chave. Aqui trocamos o header/footer completos
 * do site por versões enxutas (ConsultoriaLPTemplate) e tiramos o pop-up de
 * newsletter, que compete com a oferta paga pela atenção do visitante.
 */
const LP_ROUTES = [
  "/consultoria-pme",
  "/consultoria-de-gestao-empresarial",
  "/consultoria-empresarial-para-pequenas-empresas",
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLP = LP_ROUTES.includes(pathname);

  if (isLP) {
    return (
      <>
        <LPHeader />
        <div id="conteudo">{children}</div>
        <LPFooter />
        <WhatsAppButton />
        <BackToTop />
      </>
    );
  }

  return (
    <>
      <Header />
      <div id="conteudo">{children}</div>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <CapturePopup />
    </>
  );
}
