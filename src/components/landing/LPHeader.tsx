import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

/**
 * Header enxuto para landing pages de tráfego pago (Google/Meta Ads).
 * Mesma identidade visual do Header do site (navy + fio dourado), mas sem
 * nenhum link de navegação — o único clique possível aqui é o CTA. Attention
 * ratio 1:1: nada aqui deve levar o visitante para fora da LP.
 */
export function LPHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div
          className="flex items-center gap-2"
          role="img"
          aria-label={`${siteConfig.name} — ${siteConfig.slogan}`}
        >
          <Image
            src="/logo-empresarial-academy.png"
            alt=""
            width={64}
            height={61}
            className="h-12 w-auto md:h-14"
            priority
          />
        </div>
        <Button
          href="/diagnostico-maturidade-empresarial.html"
          external
          variant="primary"
          size="sm"
          className="whitespace-nowrap"
        >
          Diagnóstico Gratuito
        </Button>
      </div>
    </header>
  );
}
