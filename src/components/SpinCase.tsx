import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CasoPraticoSpin } from "@/lib/content";

/**
 * Apresenta um caso prático usando a estrutura SPIN Selling (Situação,
 * Problema, Implicação, Necessidade de solução) — a mesma técnica que
 * ensinamos em consultoria/mentoria também organiza a prova de que o método
 * funciona. Empresa nunca identificada: só o cenário e as ações reais.
 */
const BLOCOS = [
  { letra: "S", rotulo: "Situação", campo: "situacao" as const },
  { letra: "P", rotulo: "Problema", campo: "problema" as const },
  { letra: "I", rotulo: "Implicação", campo: "implicacao" as const },
];

export function SpinCase({ caso }: { caso: CasoPraticoSpin }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading title={caso.titulo} subtitle={caso.resumo} />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BLOCOS.map((b) => (
            <div
              key={b.letra}
              className="rounded-xl border border-line bg-surface p-6"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-navy font-[var(--font-heading)] text-sm font-bold text-gold"
              >
                {b.letra}
              </span>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-gold-ink">
                {b.rotulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray">
                {caso[b.campo]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border-l-2 border-gold bg-surface p-7">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-navy font-[var(--font-heading)] text-sm font-bold text-gold"
            >
              N
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-ink">
              Necessidade de solução — ações realizadas
            </h3>
          </div>
          <p className="mt-4 text-navy">{caso.necessidadeIntro}</p>
          <ul className="mt-5 space-y-3">
            {caso.acoes.map((acao) => (
              <li key={acao.slice(0, 30)} className="flex gap-3 text-sm text-navy">
                <span className="mt-0.5 text-gold-ink" aria-hidden>
                  ✔
                </span>
                <span className="leading-relaxed">{acao}</span>
              </li>
            ))}
          </ul>
        </div>

        {caso.fechamento && (
          <p className="mt-8 max-w-3xl text-lg font-medium leading-relaxed text-navy">
            {caso.fechamento}
          </p>
        )}
      </div>
    </section>
  );
}
