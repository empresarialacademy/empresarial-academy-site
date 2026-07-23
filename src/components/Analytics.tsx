"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_KEY = "ea_cookie_consent";

type Consent = "granted" | "denied" | null;

/**
 * GA4 + banner de consentimento (LGPD).
 * - Sem NEXT_PUBLIC_GA_ID definido, não renderiza nada (dev/preview).
 * - O GA4 só carrega APÓS o visitante aceitar no banner.
 * - A escolha fica em localStorage; "recusar" nunca carrega o script.
 */
export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function choose(value: Exclude<Consent, null>) {
    setConsent(value);
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
  }

  if (!GA_ID || !ready) return null;

  if (consent === "granted") {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });`}
        </Script>
      </>
    );
  }

  if (consent === "denied") return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy p-4 text-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/85">
          Usamos cookies de análise para melhorar sua experiência. Saiba mais na{" "}
          <Link href="/privacidade" className="underline hover:text-gold">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:border-gold hover:text-gold"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
