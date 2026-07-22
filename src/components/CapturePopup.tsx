"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

const STORAGE_KEY = "ea_capture_dismissed";
const DELAY_MS = 12000;

/** Páginas onde o visitante já está convertendo — pop-up só atrapalha. */
const SUPPRESSED_PATHS = ["/contato"];

export function CapturePopup() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const suppressed = SUPPRESSED_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (suppressed) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const onScroll = () => {
      const scrolled =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.4) trigger();
    };
    const timer = setTimeout(trigger, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    function trigger() {
      setOpen(true);
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-navy p-7 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-white/60 transition-colors hover:text-gold"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <p className="font-[var(--font-heading)] text-sm uppercase tracking-[0.2em] text-gold">
          Conhecimento que Impulsiona
        </p>
        <h2 id="capture-title" className="mt-2 text-2xl font-bold">
          Receba conteúdos exclusivos
        </h2>
        <p className="mt-2 text-sm text-white/80">
          Dicas práticas de gestão, vendas e liderança direto no seu e-mail e
          WhatsApp.
        </p>
        <div className="mt-5">
          <NewsletterForm origem="Pop-up de captura" compact />
        </div>
      </div>
    </div>
  );
}
