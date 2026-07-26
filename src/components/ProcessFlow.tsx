import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { MetodoServico, TrilhaMetodo } from "@/lib/content";

/**
 * Fluxograma do método de trabalho de um serviço.
 *
 * Por que HTML/CSS e não uma imagem: o site é otimizado para buscadores e
 * assistentes de IA (ver §9 do PROJECT_STATUS). Um fluxograma em PNG/SVG seria
 * invisível para eles — em texto real, cada etapa vira conteúdo indexável e
 * citável. De quebra, escala sozinho no mobile e é lido por leitor de tela.
 *
 * Layout: trilha vertical com numeração e conector. Aguenta descrição longa
 * (o que uma fileira horizontal de 6 cartões não aguentaria) e, quando o
 * método tem mais de uma trilha, as colunas lado a lado comunicam a
 * bifurcação — caso de Palestras: "do escopo" vs. "personalizada".
 */
function Trilha({ trilha, ramificado }: { trilha: TrilhaMetodo; ramificado: boolean }) {
  return (
    <div>
      {trilha.rotulo && (
        <div className="mb-8 rounded-xl border border-gold/30 bg-navy/[0.03] p-5">
          <h3 className="font-[var(--font-heading)] text-lg font-bold text-navy">
            {trilha.rotulo}
          </h3>
          {trilha.descricao && (
            <p className="mt-1 text-sm text-gray">{trilha.descricao}</p>
          )}
        </div>
      )}
      <ol className="relative">
        {trilha.etapas.map((etapa, i) => {
          const ultima = i === trilha.etapas.length - 1;
          return (
            <li key={etapa.n} className="relative flex gap-5 pb-8 last:pb-0">
              {/* Conector vertical entre as etapas (decorativo). */}
              {!ultima && (
                <span
                  aria-hidden
                  className="absolute left-6 top-12 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-gold/60 to-gold/15"
                />
              )}
              <span
                aria-hidden
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold shadow-sm"
              >
                <Icon name={etapa.icon} className="h-5 w-5" />
              </span>
              <div className="pt-1">
                <span className="font-[var(--font-heading)] text-xs font-bold uppercase tracking-widest text-gold-ink">
                  Etapa {etapa.n}
                </span>
                <h4
                  className={cn(
                    "mt-1 font-semibold text-navy",
                    ramificado ? "text-base" : "text-lg",
                  )}
                >
                  {etapa.titulo}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-gray">{etapa.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProcessFlow({ metodo }: { metodo: MetodoServico }) {
  const ramificado = metodo.trilhas.length > 1;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-[var(--font-heading)] text-2xl font-bold text-navy md:text-3xl">
          {metodo.titulo}
        </h2>
        {metodo.subtitulo && (
          <p className="mt-3 max-w-3xl text-gray">{metodo.subtitulo}</p>
        )}

        <div
          className={cn(
            "mt-12",
            ramificado
              ? "grid gap-10 md:grid-cols-2 md:gap-12"
              : "max-w-3xl",
          )}
        >
          {metodo.trilhas.map((trilha, i) => (
            <Trilha
              key={trilha.rotulo ?? i}
              trilha={trilha}
              ramificado={ramificado}
            />
          ))}
        </div>

        {metodo.ligacaoGestao360 && (
          <div className="mt-14 rounded-2xl border-l-2 border-gold bg-white p-7">
            <h3 className="font-[var(--font-heading)] text-sm font-semibold uppercase tracking-wide text-gold-ink">
              Onde entra o método Gestão 360
            </h3>
            <p className="mt-3 text-navy">{metodo.ligacaoGestao360}</p>
          </div>
        )}
      </div>
    </section>
  );
}
