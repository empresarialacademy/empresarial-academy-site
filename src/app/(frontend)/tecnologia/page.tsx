import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { tecnologiaIA } from "@/lib/content";
import { getActiveSystemLinks } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Tecnologia",
  description:
    "Os sistemas próprios que sustentam a operação da Empresarial Academy — infraestrutura construída para escalar gestão, conteúdo e atendimento com método.",
  alternates: { canonical: "/tecnologia" },
};

/**
 * Página institucional pública — o portfólio de sistemas próprios da EA como
 * prova de infraestrutura, para apresentação a clientes. Separada do EA HUB
 * (/eahub, uso interno atrás de login): aqui não há contador operacional
 * (leads, contratos), só o que é apresentável — nome, descrição e link de
 * cada sistema já publicado, vindos da mesma coleção `system-links` que o
 * Thiago já mantém para o hub interno.
 */
export default async function Page() {
  const systems = await getActiveSystemLinks();

  return (
    <main>
      <PageHero
        title="Tecnologia própria a serviço da gestão"
        subtitle="Não usamos ferramentas genéricas de prateleira: construímos sistemas próprios para planejar, atender e sustentar cada etapa da operação — do primeiro contato ao resultado entregue."
        crumbs={[{ label: "Tecnologia" }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title={tecnologiaIA.titulo}
          subtitle="Tecnologia como ferramenta de gestão, não como vitrine."
        />
        <div className="mt-8 grid gap-4 text-gray md:grid-cols-3">
          {tecnologiaIA.paragrafos.map((p) => (
            <p key={p.slice(0, 24)} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            title="Sistemas em operação"
            subtitle="Cada sistema abaixo está ativo e em uso — não é protótipo, é a infraestrutura que roda a Empresarial Academy hoje."
          />
          <ol className="mt-12 space-y-0">
            {systems.map((system, i) => {
              const s = system as unknown as { id: string | number; name: string; url?: string | null; description?: string | null };
              return (
                <li
                  key={s.id}
                  className="grid gap-4 border-t border-line py-8 last:border-b md:grid-cols-[80px_1fr_auto] md:items-center"
                >
                  <span className="font-[var(--font-heading)] text-3xl font-bold text-gold-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{s.name}</h3>
                    {s.description ? <p className="mt-1 text-sm text-gray">{s.description}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionHeading
            title="Método e tecnologia, na mesma estrutura"
            subtitle="Cada sistema listado acima existe para sustentar um resultado de gestão — não para substituir o método, e sim para garantir que ele seja aplicado com consistência."
            align="center"
            invert
          />
          <div className="mt-10">
            <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="lg">
              Faça uma avaliação gratuita
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
