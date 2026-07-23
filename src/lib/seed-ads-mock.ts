import type { Payload } from "payload";
import { DIAGNOSTIC_ORIGIN } from "@/lib/diagnostic-email";

/**
 * Dados de EXEMPLO do painel de Ads — sizing/palavras vêm da campanha real
 * planejada em `Funil Inbound (Google Ads)/Frente E - Anúncios Google Ads.md`
 * (1 campanha Search, ~R$33/dia, 3 grupos, 14 palavras). O Google Ads real
 * segue adiado (ver [[plano-aquisicao-clientes-ads]]) — isto só existe para
 * validar o painel/motor de recomendação antes da conta existir.
 *
 * Chamado por src/app/api/dev/seed-ads-mock/route.ts, que trava o acesso
 * fora de dev e fora do SQLite (nunca roda contra o Neon de produção).
 */

const MOCK_CAMPAIGN_ID = "mock-consultoria-pme";

type KeywordSeed = {
  text: string;
  matchType: "frase" | "exata";
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
};

type GroupSeed = { name: string; keywords: KeywordSeed[] };

const GROUPS: GroupSeed[] = [
  {
    name: "Consultoria empresarial (PME)",
    keywords: [
      { text: "consultoria empresarial para pme", matchType: "frase", impressions: 220, clicks: 16, cost: 190, conversions: 2 },
      { text: "consultoria de gestão empresarial", matchType: "frase", impressions: 130, clicks: 7, cost: 84, conversions: 1 },
      { text: "consultoria para pequena empresa", matchType: "frase", impressions: 95, clicks: 5, cost: 50, conversions: 0 },
      { text: "consultoria empresarial para pequenas empresas", matchType: "exata", impressions: 35, clicks: 4, cost: 92, conversions: 0 },
      { text: "consultoria de gestão para pme", matchType: "exata", impressions: 22, clicks: 2, cost: 18, conversions: 0 },
    ],
  },
  {
    name: "Organizar processos / sair da operação",
    keywords: [
      { text: "consultoria para organizar a empresa", matchType: "frase", impressions: 80, clicks: 5, cost: 58, conversions: 0 },
      { text: "como organizar os processos da empresa", matchType: "frase", impressions: 70, clicks: 4, cost: 46, conversions: 0 },
      { text: "empresa que depende do dono", matchType: "frase", impressions: 55, clicks: 9, cost: 162, conversions: 0 },
      { text: "como sair da operação da empresa", matchType: "frase", impressions: 40, clicks: 3, cost: 33, conversions: 0 },
      { text: "consultoria para organizar processos", matchType: "exata", impressions: 15, clicks: 1, cost: 11, conversions: 0 },
    ],
  },
  {
    name: "Diagnóstico empresarial gratuito",
    keywords: [
      { text: "diagnóstico empresarial gratuito", matchType: "frase", impressions: 260, clicks: 22, cost: 165, conversions: 3 },
      { text: "avaliação de maturidade empresarial", matchType: "frase", impressions: 110, clicks: 6, cost: 54, conversions: 1 },
      { text: "diagnóstico de gestão da empresa", matchType: "frase", impressions: 85, clicks: 4, cost: 34, conversions: 0 },
      { text: "diagnóstico empresarial gratuito", matchType: "exata", impressions: 48, clicks: 4, cost: 36, conversions: 1 },
    ],
  },
];

const ROLLUP_WINDOW_DAYS = 30;

/** Gerador determinístico simples (LCG) — variação plausível sem depender de Math.random. */
function makeRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function buildDailyMetrics(totals: { impressions: number; clicks: number; cost: number; conversions: number }) {
  const rng = makeRng(42);
  const days: { date: string; impressions: number; clicks: number; cost: number; conversions: number }[] = [];
  const weights = Array.from({ length: ROLLUP_WINDOW_DAYS }, (_, i) => {
    const dow = i % 7;
    const weekendDip = dow === 5 || dow === 6 ? 0.6 : 1;
    return weekendDip * (0.75 + rng() * 0.5);
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // Distribui conversões nos dias de maior peso (tráfego), não uniformemente.
  const conversionDayIdx = [...weights.keys()]
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, totals.conversions);

  let allocatedClicks = 0;
  let allocatedCost = 0;
  let allocatedImpr = 0;

  for (let i = 0; i < ROLLUP_WINDOW_DAYS; i++) {
    const share = weights[i] / weightSum;
    const isLast = i === ROLLUP_WINDOW_DAYS - 1;
    const impressions = isLast ? totals.impressions - allocatedImpr : Math.round(totals.impressions * share);
    const clicks = isLast ? totals.clicks - allocatedClicks : Math.round(totals.clicks * share);
    const cost = isLast ? Math.round((totals.cost - allocatedCost) * 100) / 100 : Math.round(totals.cost * share * 100) / 100;
    allocatedImpr += impressions;
    allocatedClicks += clicks;
    allocatedCost += cost;

    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (ROLLUP_WINDOW_DAYS - 1 - i));

    days.push({
      date: date.toISOString().slice(0, 10),
      impressions: Math.max(impressions, 0),
      clicks: Math.max(clicks, 0),
      cost: Math.max(cost, 0),
      conversions: conversionDayIdx.includes(i) ? 1 : 0,
    });
  }
  return days;
}

const MOCK_LEADS = [
  {
    name: "Fernanda Alves (exemplo)",
    email: "fernanda.exemplo@example.com",
    company: "Alves Materiais de Construção",
    keywordText: "consultoria empresarial para pme",
    dealStatus: "ganho" as const,
    dealPackage: "essencial" as const,
    dealMonths: 4,
  },
  {
    name: "Ricardo Souza (exemplo)",
    email: "ricardo.exemplo@example.com",
    company: "Souza Contabilidade",
    keywordText: "diagnóstico empresarial gratuito",
    dealStatus: "perdido" as const,
    dealPackage: "nenhum" as const,
    dealMonths: null,
  },
  {
    name: "Patrícia Lima (exemplo)",
    email: "patricia.exemplo@example.com",
    company: "Lima Distribuidora",
    keywordText: "consultoria empresarial para pme",
    dealStatus: "em_andamento" as const,
    dealPackage: "nenhum" as const,
    dealMonths: null,
  },
  {
    name: "Marcos Teixeira (exemplo)",
    email: "marcos.exemplo@example.com",
    company: "Teixeira Logística",
    keywordText: "diagnóstico empresarial gratuito",
    dealStatus: "ganho" as const,
    dealPackage: "implementacao" as const,
    dealMonths: null,
  },
];

const MOCK_NON_ADS_LEADS = [
  { name: "Beatriz Nogueira (exemplo)", email: "beatriz.exemplo@example.com", source: "Newsletter" },
  { name: "João Pereira (exemplo)", email: "joao.exemplo@example.com", source: "Download de material" },
];

export async function seedAdsMockData(payload: Payload) {
  // Limpa dados de exemplo anteriores (idempotente).
  for (const slug of ["ad-metrics-daily", "ad-keywords", "ad-groups", "ad-campaigns"] as const) {
    const { docs } = await payload.find({ collection: slug, limit: 1000, depth: 0 });
    for (const doc of docs) await payload.delete({ collection: slug, id: doc.id });
  }
  for (const mock of [...MOCK_LEADS, ...MOCK_NON_ADS_LEADS]) {
    const { docs } = await payload.find({
      collection: "leads",
      where: { email: { equals: mock.email } },
      limit: 5,
      depth: 0,
    });
    for (const doc of docs) await payload.delete({ collection: "leads", id: doc.id });
  }

  const campaign = await payload.create({
    collection: "ad-campaigns",
    data: {
      name: "[Exemplo] Consultoria PME — Pesquisa",
      googleAdsCampaignId: MOCK_CAMPAIGN_ID,
      status: "rascunho",
      dailyBudgetTarget: 33,
      monthlyBudgetTarget: 1000,
      cpcCeiling: 18,
      notes:
        "Dados de EXEMPLO gerados por /api/dev/seed-ads-mock para validar o painel antes de o Google Ads existir de verdade. Google Ads real segue ADIADO — não é uma campanha ativa.",
    },
  });

  const campaignTotals = { impressions: 0, clicks: 0, cost: 0, conversions: 0 };

  for (const group of GROUPS) {
    const groupTotals = group.keywords.reduce(
      (acc, k) => ({
        impressions: acc.impressions + k.impressions,
        clicks: acc.clicks + k.clicks,
        cost: acc.cost + k.cost,
        conversions: acc.conversions + k.conversions,
      }),
      { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    );

    const adGroup = await payload.create({
      collection: "ad-groups",
      data: {
        campaign: campaign.id,
        name: group.name,
        status: "ativo",
        rollupWindowDays: ROLLUP_WINDOW_DAYS,
        rollupImpressions: groupTotals.impressions,
        rollupClicks: groupTotals.clicks,
        rollupCost: groupTotals.cost,
        rollupConversions: groupTotals.conversions,
        rollupUpdatedAt: new Date().toISOString(),
      },
    });

    for (const kw of group.keywords) {
      await payload.create({
        collection: "ad-keywords",
        data: {
          adGroup: adGroup.id,
          text: kw.text,
          matchType: kw.matchType,
          status: "ativa",
          rollupWindowDays: ROLLUP_WINDOW_DAYS,
          rollupImpressions: kw.impressions,
          rollupClicks: kw.clicks,
          rollupCost: kw.cost,
          rollupConversions: kw.conversions,
          rollupUpdatedAt: new Date().toISOString(),
        },
      });
    }

    campaignTotals.impressions += groupTotals.impressions;
    campaignTotals.clicks += groupTotals.clicks;
    campaignTotals.cost += groupTotals.cost;
    campaignTotals.conversions += groupTotals.conversions;
  }

  const dailyRows = buildDailyMetrics(campaignTotals);
  for (const row of dailyRows) {
    await payload.create({
      collection: "ad-metrics-daily",
      data: { campaign: campaign.id, ...row, source: "manual" },
    });
  }

  for (const lead of MOCK_LEADS) {
    await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        company: lead.company,
        source: DIAGNOSTIC_ORIGIN,
        consent: true,
        details: {
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: MOCK_CAMPAIGN_ID,
          utm_term: lead.keywordText,
          gclid: `mock-gclid-${lead.email}`,
        },
        dealStatus: lead.dealStatus,
        dealPackage: lead.dealPackage,
        dealMonths: lead.dealMonths ?? undefined,
      },
    });
  }

  for (const lead of MOCK_NON_ADS_LEADS) {
    await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        source: lead.source,
        consent: true,
      },
    });
  }

  return {
    campaignId: campaign.id,
    groups: GROUPS.length,
    keywords: GROUPS.reduce((n, g) => n + g.keywords.length, 0),
    dailyRows: dailyRows.length,
    campaignTotals,
    leadsWithAdsAttribution: MOCK_LEADS.length,
    leadsWithoutAds: MOCK_NON_ADS_LEADS.length,
  };
}
