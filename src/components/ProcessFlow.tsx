import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { MetodoServico, TrilhaMetodo } from "@/lib/content";

/**
 * Fluxograma do método de trabalho de um serviço: um ciclo (não uma linha do
 * tempo) — as etapas são desenhadas em círculo, conectadas por um anel
 * pontilhado com pequenas setas indicando o sentido horário, e o detalhe de
 * cada etapa (ícone + título + descrição) fica abaixo, sem numeração nem
 * conector vertical (pedido do Thiago, 2026-07-26: "vá direto para o
 * título").
 *
 * Por que HTML/CSS/SVG e não uma imagem: o site é otimizado para buscadores e
 * assistentes de IA (ver §9 do PROJECT_STATUS) — um fluxograma em PNG seria
 * invisível para eles. As posições no círculo são calculadas em coordenadas
 * polares no próprio server component (sem JS no cliente), então funcionam
 * mesmo sem hidratação.
 */
function polar(index: number, total: number, radiusPct: number) {
  const angleDeg = (index / total) * 360 - 90; // 0 = topo, sentido horário
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPct * Math.cos(angleRad)}%`,
    top: `${50 + radiusPct * Math.sin(angleRad)}%`,
    angleDeg,
  };
}

function CircularDiagram({ etapas }: { etapas: TrilhaMetodo["etapas"] }) {
  const n = etapas.length;
  const NODE_RADIUS = 40;

  return (
    <div className="rounded-3xl bg-navy px-6 py-14 shadow-xl sm:px-10">
      <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px]">
        {/* Brilho difuso atrás do anel, para dar profundidade ao dourado. */}
        <div
          aria-hidden
          className="absolute inset-[6%] rounded-full bg-gold/20 blur-2xl"
        />

        {/* Anel-guia sólido, do mesmo raio dos nós, com brilho. */}
        <div
          aria-hidden
          className="absolute rounded-full border-[3px] border-gold/70 shadow-[0_0_30px_rgba(193,161,96,0.45)]"
          style={{
            left: `${50 - NODE_RADIUS}%`,
            top: `${50 - NODE_RADIUS}%`,
            width: `${NODE_RADIUS * 2}%`,
            height: `${NODE_RADIUS * 2}%`,
          }}
        />

        {/* Setas de sentido horário, no meio do arco entre cada par de nós. */}
        {etapas.map((etapa, i) => {
          const mid = polar(i + 0.5, n, NODE_RADIUS);
          return (
            <span
              key={`arrow-${etapa.n}`}
              aria-hidden
              className="absolute text-gold drop-shadow-[0_0_6px_rgba(193,161,96,0.8)]"
              style={{
                left: mid.left,
                top: mid.top,
                transform: `translate(-50%, -50%) rotate(${mid.angleDeg + 90}deg)`,
              }}
            >
              <Icon name="arrow-right" className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
          );
        })}

        {/* Nós (ícone apenas — o detalhe textual fica na grade abaixo). */}
        {etapas.map((etapa, i) => {
          const pos = polar(i, n, NODE_RADIUS);
          return (
            <span
              key={etapa.n}
              className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-navy text-gold shadow-[0_0_22px_rgba(193,161,96,0.55)] sm:h-[4.5rem] sm:w-[4.5rem]"
              style={{ left: pos.left, top: pos.top }}
              title={etapa.titulo}
            >
              <Icon name={etapa.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
          );
        })}

        {/* Centro: contagem de etapas, foco visual do ciclo. */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
          <span className="font-[var(--font-heading)] text-4xl font-bold text-gold drop-shadow-[0_0_18px_rgba(193,161,96,0.6)] sm:text-5xl">
            {n}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70 sm:text-xs">
            etapas
          </span>
        </div>
      </div>
    </div>
  );
}

function TrilhaBloco({ trilha, ramificado }: { trilha: TrilhaMetodo; ramificado: boolean }) {
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

      <CircularDiagram etapas={trilha.etapas} />

      <ul
        className={cn(
          "mt-10 grid gap-5",
          ramificado ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {trilha.etapas.map((etapa) => (
          <li
            key={etapa.n}
            className="rounded-xl border border-line bg-white p-5"
          >
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-navy text-gold"
            >
              <Icon name={etapa.icon} className="h-4 w-4" />
            </span>
            <h4 className="mt-3 font-semibold text-navy">{etapa.titulo}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-gray">
              {etapa.desc}
            </p>
          </li>
        ))}
      </ul>
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
            ramificado ? "grid gap-14 md:grid-cols-2 md:gap-12" : "",
          )}
        >
          {metodo.trilhas.map((trilha, i) => (
            <TrilhaBloco
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
