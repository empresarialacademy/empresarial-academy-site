import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

const PILLARS_CONFIG = [
  {
    key: "Fluxo de Alta Performance",
    name: "Fluxo de Alta Performance",
    desc: "Mapeamento de processos, rotinas, alçadas e melhoria contínua.",
    tip: "Mapeie o processo que mais gera dor hoje e defina alçadas de decisão claras. Operação que depende só do dono não escala.",
  },
  {
    key: "Arquitetura do Crescimento",
    name: "Arquitetura do Crescimento",
    desc: "Organograma, recrutamento, rituais 1:1, feedback e avaliação.",
    tip: "Desenhe um organograma funcional simples e implante 1:1 regulares com a equipe. Estrutura clara sustenta o crescimento.",
  },
  {
    key: "Objetivos Estratégicos",
    name: "Objetivos Estratégicos",
    desc: "Análise estratégica, metas (OKRs), desdobramento e foco.",
    tip: "Escreva os 3 objetivos mais importantes dos próximos 90 dias e desdobre em metas por área. Time sem foco comum trabalha duro e anda pouco.",
  },
  {
    key: "Métricas de Sucesso",
    name: "Métricas de Sucesso",
    desc: "Métricas de sanidade (margem/caixa), DRE, Pareto e gestão à vista.",
    tip: "Troque métrica de vaidade por métrica de sanidade (margem líquida, fluxo de caixa, retenção) e separe resultado contábil de saldo de banco.",
  },
  {
    key: "Gestão de Desafios",
    name: "Gestão de Desafios",
    desc: "Mapeamento de riscos, reserva de emergência e gestão de crise.",
    tip: "Mapeie os principais riscos do negócio e comece uma reserva financeira de emergência. Empresa sem plano de crise decide no desespero.",
  },
  {
    key: "Evolução Constante",
    name: "Evolução Constante",
    desc: "Inovação, capacitação contínua, revisão de modelo e tendências.",
    tip: "Reserve tempo na agenda para pensar no futuro do negócio. Quem não questiona o próprio modelo é questionado pelo mercado primeiro.",
  },
];

function parseScore(val: unknown): { pct: number; label: string } | null {
  if (typeof val !== "string") return null;
  const match = /(\d+)\s*%/.exec(val);
  const labelMatch = /\(([^)]+)\)/.exec(val);
  if (!match) return null;
  return {
    pct: Number(match[1]),
    label: labelMatch ? labelMatch[1].trim() : "",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const listRecent = searchParams.get("list") === "recent";

    const payload = await getPayloadClient();

    if (listRecent) {
      const { docs } = await payload.find({
        collection: "leads",
        where: {
          or: [
            { hasDiagnostic: { equals: true } },
            { source: { equals: "Diagnóstico de Maturidade Empresarial" } },
            { source: { equals: "Diagnóstico de Maturidade Empresarial — Início" } },
          ],
        },
        sort: "-createdAt",
        limit: 25,
      });

      const items = docs.map((rawDoc) => {
        const d = rawDoc as unknown as {
          id: string | number;
          diagnosticId?: string;
          name: string;
          company?: string;
          createdAt: string;
          details?: Record<string, unknown>;
        };
        const details = (d.details || {}) as Record<string, unknown>;
        return {
          id: d.id,
          diagnosticId: d.diagnosticId || `EA-DIAG-${d.id}`,
          name: d.name,
          company: d.company || "",
          createdAt: d.createdAt,
          overallScore: (details["Maturidade Geral"] as string) || "Pendente",
        };
      });

      return NextResponse.json({ ok: true, items });
    }

    if (!id) {
      return NextResponse.json({ error: "Informe o ID do Diagnóstico (ex: EA-DIAG-2026-X8K2M) ou ID do Lead." }, { status: 400 });
    }

    // Busca por diagnosticId ou id numérico ou e-mail
    const { docs } = await payload.find({
      collection: "leads",
      where: {
        or: [
          { diagnosticId: { equals: id } },
          { email: { equals: id } },
        ],
      },
      limit: 1,
    });

    let rawLead = docs[0];

    // Fallback se id for o id numérico do payload
    if (!rawLead && !Number.isNaN(Number(id))) {
      try {
        rawLead = await payload.findByID({
          collection: "leads",
          id: Number(id),
        });
      } catch {
        // no-op
      }
    }

    if (!rawLead) {
      return NextResponse.json({ error: `Diagnóstico com ID "${id}" não encontrado.` }, { status: 404 });
    }

    const lead = rawLead as unknown as {
      id: string | number;
      diagnosticId?: string;
      name: string;
      email: string;
      company?: string;
      whatsapp?: string;
      instagram?: string;
      createdAt: string;
      details?: Record<string, unknown>;
    };

    const details = (lead.details || {}) as Record<string, unknown>;
    const overall = parseScore(details["Maturidade Geral"]) || { pct: 0, label: "Em Análise" };
    const cargo = (details["Cargo"] as string) || "Sócio / Diretor";
    const faturamento = (details["Faturamento anual"] as string) || "Não informado";

    const pillars = PILLARS_CONFIG.map((cfg) => {
      const score = parseScore(details[cfg.key]);
      return {
        ...cfg,
        pct: score ? score.pct : 0,
        label: score ? score.label : "—",
        hasScore: score !== null,
      };
    });

    const scoredPillars = pillars.filter((p) => p.hasScore);
    const weakestPillar = scoredPillars.length > 0
      ? scoredPillars.reduce((min, p) => (p.pct < min.pct ? p : min), scoredPillars[0])
      : pillars[0];

    return NextResponse.json({
      ok: true,
      data: {
        leadId: lead.id,
        diagnosticId: lead.diagnosticId || `EA-DIAG-${lead.id}`,
        name: lead.name,
        email: lead.email,
        company: lead.company || "Empresa Cliente",
        whatsapp: lead.whatsapp || "",
        instagram: lead.instagram || "",
        cargo,
        faturamento,
        createdAt: lead.createdAt,
        overall,
        pillars,
        weakestPillar,
      },
    });
  } catch (err) {
    console.error("[diagnostic/lookup] erro:", err);
    return NextResponse.json({ error: "Erro ao buscar dados do diagnóstico." }, { status: 500 });
  }
}
