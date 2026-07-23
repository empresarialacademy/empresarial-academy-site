"use client";

import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

/**
 * CTA de conversão para a landing page de aquisição.
 * - Encaminha os parâmetros de campanha (utm_*, gclid, gad_source) da URL
 *   atual para o destino (o Diagnóstico), preservando a atribuição do anúncio.
 * - Dispara um evento no GA4 (window.gtag) no clique — para o Google Ads
 *   importar como conversão. Se o consentimento de cookies não foi dado, o
 *   gtag não existe e o clique segue normalmente.
 */
const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gad_source",
];

export function ConversionCTA({
  href,
  children,
  size = "lg",
  eventName = "cta_diagnostico",
}: {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  eventName?: string;
}) {
  const [finalHref, setFinalHref] = useState(href);

  useEffect(() => {
    try {
      const current = new URLSearchParams(window.location.search);
      const forward = new URLSearchParams();
      for (const key of CAMPAIGN_KEYS) {
        const value = current.get(key);
        if (value) forward.set(key, value);
      }
      const qs = forward.toString();
      if (qs) setFinalHref(href + (href.includes("?") ? "&" : "?") + qs);
    } catch {
      /* mantém o href base */
    }
  }, [href]);

  function handleClick() {
    try {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", eventName, {
        event_category: "engagement",
        event_label: "consultoria-pme",
      });
    } catch {
      /* ignore */
    }
  }

  return (
    <a
      href={finalHref}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses("primary", size)}
    >
      {children}
    </a>
  );
}
