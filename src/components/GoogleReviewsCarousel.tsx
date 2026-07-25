"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GoogleReview } from "@/lib/reviews";
import { formatDatePtBR } from "@/lib/format";

const AUTOPLAY_MS = 8000;

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${rating} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? "#C1A160" : "#D9DCE1"}
          aria-hidden
        >
          <path d="M12 2l2.9 6.26 6.6.7-4.95 4.5 1.38 6.54L12 16.77 6.07 20l1.38-6.54L2.5 8.96l6.6-.7L12 2z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Carrossel das avaliações do Google. Mostra 1 por vez (centralizado), com
 * auto-play pausável, setas e dots — mesmo padrão de a11y do HeroCarousel.
 * Com uma única avaliação, os controles somem e vira um card estático.
 */
export function GoogleReviewsCarousel({ reviews }: { reviews: GoogleReview[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;
  const multiple = count > 1;

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
    if (!multiple || paused || prefersReduced.current) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count, multiple]);

  return (
    <div
      className="mx-auto mt-12 max-w-3xl"
      aria-roledescription={multiple ? "carrossel" : undefined}
      aria-label={multiple ? "Avaliações de clientes no Google" : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        {multiple && (
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Avaliação anterior"
            className="absolute -left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition-colors hover:border-gold hover:text-gold-ink lg:-left-14"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <ul className="relative">
          {reviews.map((r, i) => (
            <li
              key={`${r.name}-${r.date ?? i}`}
              aria-hidden={i !== index}
              className={
                i === index
                  ? "relative opacity-100 transition-opacity duration-500"
                  : "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
              }
            >
              <figure className="flex h-full flex-col items-center rounded-2xl border border-line bg-white px-6 py-10 text-center shadow-sm sm:px-10">
                <Stars rating={r.rating} size={20} />
                <blockquote className="mt-6 text-base leading-relaxed text-gray sm:text-lg">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-7 flex flex-col items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-[var(--font-heading)] text-base font-bold text-gold"
                  >
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-semibold text-navy">{r.name}</span>
                    {r.date && (
                      <span className="mt-0.5 block text-xs text-gray/70">
                        {formatDatePtBR(r.date)}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {multiple && (
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próxima avaliação"
            className="absolute -right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition-colors hover:border-gold hover:text-gold-ink lg:-right-14"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {multiple && (
        <div className="mt-6 flex justify-center gap-2">
          {reviews.map((r, i) => (
            <button
              key={`dot-${r.name}-${i}`}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ver avaliação ${i + 1} de ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                aria-hidden
                className={
                  i === index
                    ? "block h-2.5 w-7 rounded-full bg-gold transition-all"
                    : "block h-2.5 w-2.5 rounded-full bg-line transition-all"
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
