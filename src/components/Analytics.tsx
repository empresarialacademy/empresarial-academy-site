"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_KEY = "ea_cookie_consent";

type Consent = "granted" | "denied" | null;

/**
 * GA4 + banner de consentimento (LGPD) via Google Consent Mode v2.
 *
 * ANTES: o gtag só carregava depois de "Aceitar" no banner — quem clicava no
 * CTA da LP (nova aba, ver ConversionCTA.tsx) antes de decidir no banner
 * nunca era medido: nem o clique, nem o `generate_lead` do diagnóstico
 * (public/diagnostico-maturidade-empresarial.html, mesma chave localStorage).
 * Perda de sinal de conversão inteira pro Google Ads, silenciosa.
 *
 * AGORA: o gtag carrega sempre, com consentimento padrão NEGADO (só ping
 * agregado/sem cookie — GA4 modela o resto via Consent Mode, sem PII e sem
 * armazenar cookie sem permissão). Quando o visitante aceita, atualizamos
 * pra "granted" e a medição completa (com cookie) passa a valer dali em
 * diante. Continua 100% LGPD — o que muda é que deixamos de ficar cegos
 * sobre quem ainda não decidiu.
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

  useEffect(() => {
    if (!ready) return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!w.gtag) return;
    w.gtag("consent", "update", {
      analytics_storage: consent === "granted" ? "granted" : "denied",
      ad_storage: consent === "granted" ? "granted" : "denied",
      ad_user_data: consent === "granted" ? "granted" : "denied",
      ad_personalization: consent === "granted" ? "granted" : "denied",
    });
  }, [consent, ready]);

  function choose(value: Exclude<Consent, null>) {
    setConsent(value);
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
  }

  if (!GA_ID) return null;

  return (
    <>
      <Script id="ga4-consent-default" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          var stored = null;
          try { stored = localStorage.getItem('${CONSENT_KEY}'); } catch (e) {}
          gtag('consent', 'default', {
            analytics_storage: stored === 'granted' ? 'granted' : 'denied',
            ad_storage: stored === 'granted' ? 'granted' : 'denied',
            ad_user_data: stored === 'granted' ? 'granted' : 'denied',
            ad_personalization: stored === 'granted' ? 'granted' : 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {ready && consent === null && (
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
                className="min-h-11 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:border-gold hover:text-gold"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="min-h-11 rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
