"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { heroSlides } from "@/lib/content";

const AUTOPLAY_MS = 6500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  );

  const prefersReduced = useRef(false);
  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || prefersReduced.current) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da Empresarial Academy"
      className="relative isolate flex min-h-[420px] flex-col justify-center overflow-hidden bg-navy text-white sm:min-h-[480px] md:min-h-[540px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,#2e4358_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        {heroSlides.map((slide, i) => {
          // SEO: apenas o primeiro slide é o H1 da página; os demais são
          // visualmente idênticos, mas não competem como título principal.
          const Title = i === 0 ? "h1" : "p";
          return (
          <div
            key={slide.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== index}
            className={`${i === index ? "block" : "hidden"} max-w-3xl`}
          >
            <p className="font-[var(--font-heading)] text-sm uppercase tracking-[0.25em] text-gold">
              {slide.eyebrow}
            </p>
            <Title className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {slide.title}
            </Title>
            <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
              {slide.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={slide.ctaHref} variant="primary" size="lg">
                {slide.ctaLabel}
              </Button>
              <Button href="/diagnostico-maturidade-empresarial.html" external variant="outline" size="lg">
                Avaliação gratuita
              </Button>
            </div>
          </div>
          );
        })}

        {/* Controles */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Slide anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <ul className="flex gap-1">
            {heroSlides.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir para o slide ${i + 1}`}
                  aria-current={i === index}
                  className="flex h-6 min-w-6 items-center justify-center px-1"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      i === index ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próximo slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
