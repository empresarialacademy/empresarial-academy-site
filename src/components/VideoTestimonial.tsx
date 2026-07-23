"use client";

import { useRef, useState } from "react";

/**
 * Card de depoimento em vídeo (formato retrato, 9:16). Diferente dos vídeos
 * decorativos dos banners (autoplay mudo), aqui o áudio é o conteúdo — por
 * isso é clique-para-tocar, com controles nativos e som ligado. Pausa os
 * outros cards da grade ao iniciar, para não tocar dois áudios juntos.
 */
export function VideoTestimonial({
  video,
  poster,
  name,
  role,
  caption = true,
}: {
  video: string;
  poster: string;
  name: string;
  role: string;
  /** Legenda com nome/cargo abaixo do vídeo. Desative quando essas
   * informações já aparecem no texto ao lado do card. */
  caption?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    document.querySelectorAll<HTMLVideoElement>("video[data-testimonial]").forEach((v) => {
      if (v !== ref.current) v.pause();
    });
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="relative aspect-[9/16] w-full bg-navy">
        <video
          ref={ref}
          data-testimonial
          src={video}
          poster={poster}
          controls={playing}
          playsInline
          preload="none"
          onPlay={handlePlay}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            onClick={() => {
              setPlaying(true);
              // Chamar play() de forma síncrona no clique — adiar via
              // rAF/setTimeout perde a janela de "gesto do usuário" e o
              // navegador bloqueia o play() silenciosamente.
              ref.current?.play().catch(() => {});
            }}
            aria-label={`Assistir depoimento de ${name}`}
            className="absolute inset-0 flex items-center justify-center bg-navy/20 transition hover:bg-navy/30"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-navy" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="p-5">
          <p className="font-semibold text-navy">{name}</p>
          <p className="text-sm text-gray">{role}</p>
        </figcaption>
      )}
    </figure>
  );
}
