import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CasoPraticoSpin } from "@/lib/content";

/**
 * Apresenta um caso prático real (empresa nunca identificada) em prosa
 * corrida. A estrutura por trás do texto segue o SPIN Selling (Situação,
 * Problema, Implicação, Necessidade de solução), mas SEM rótulo ou letra
 * visível nenhuma — o leitor deve ser conduzido pelo raciocínio sem perceber
 * a técnica, e sair sentindo que precisa do serviço (pedido do Thiago,
 * 2026-07-26). A imagem ao lado existe para arejar o bloco de texto.
 */
export function SpinCase({ caso }: { caso: CasoPraticoSpin }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading title={caso.titulo} subtitle={caso.resumo} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-5 text-navy">
            <p className="leading-relaxed">
              {caso.situacao} {caso.problema}
            </p>
            <p className="leading-relaxed">{caso.implicacao}</p>
            <p className="leading-relaxed">{caso.necessidadeIntro}</p>
            <ul className="space-y-3">
              {caso.acoes.map((acao) => (
                <li key={acao.slice(0, 30)} className="flex gap-3 text-sm">
                  <span className="mt-0.5 text-gold-ink" aria-hidden>
                    ✔
                  </span>
                  <span className="leading-relaxed">{acao}</span>
                </li>
              ))}
            </ul>
            {caso.fechamento && (
              <p className="text-lg font-medium leading-relaxed">
                {caso.fechamento}
              </p>
            )}
          </div>

          {caso.imagemSrc && (
            <div className="mx-auto w-full max-w-xs lg:max-w-none">
              <Image
                src={caso.imagemSrc}
                alt={caso.imagemAlt ?? ""}
                width={450}
                height={559}
                sizes="(max-width: 1024px) 320px, 420px"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
