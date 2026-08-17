/**
 * Motor de recomendação do painel de Ads — 100% regras/limiares explícitos,
 * sem I/O e sem ML. Dimensionado para 1 campanha de Pesquisa, ~R$1.000/mês,
 * 3 grupos, ~14 palavras-chave (ver Frente E). Os limiares abaixo são a
 * única fonte de verdade usada pelas telas do painel — ajustar aqui, não
 * espalhar números mágicos pelos componentes.
 */

export const ADS_INSIGHTS_THRESHOLDS = {
  /** Teto de CPC (R$) usado só se a campanha não tiver o próprio `cpcCeiling`. */
  CPC_CEILING_FALLBACK: 20,
  /** CAC de referência (R$) — ~25% da 1ª mensalidade do Essencial (R$6.900). */
  CAC_TARGET: 1725,
  /** CAC acima de CAC_TARGET × este fator dispara alerta. */
  CAC_WARNING_RATIO: 1.5,
  /** Cliques mínimos para o placar sair de "coletando dados" — alinhado ao
   * "não mexer nas 2-3 primeiras semanas" da própria Frente E. */
  MIN_CLICKS_FOR_SIGNAL: 30,
  /** Gasto (R$) acima do qual "zero conversões" vira sinal de alerta. */
  ZERO_CONVERSION_SPEND_FLAG: 150,
  /** Cliques mínimos para sinalizar uma palavra-chave individual (evita ruído de 1 clique). */
  MIN_CLICKS_FOR_KEYWORD_FLAG: 5,
  /** Abaixo desta fração do orçamento diário = subinvestindo. */
  BUDGET_UNDERSPEND_RATIO: 0.6,
  /** Acima desta fração do orçamento diário = sobreinvestindo. */
  BUDGET_OVERSPEND_RATIO: 1.15,
  /** CTR abaixo disto é fraco para Pesquisa em frase/exata. */
  CTR_LOW_THRESHOLD: 0.03,
  /** Múltiplo de ROI (receita/gasto) considerado saudável. */
  ROI_GOOD_MULTIPLE: 3,
} as const;

/** Minutos sem sincronizar antes do painel disparar sync automático ao abrir a tela. */
export const ADS_AUTO_SYNC_STALE_MINUTES = 20;

export type DealPackage = "nenhum" | "essencial" | "implementacao" | "outro";
export type DealStatus = "em_andamento" | "ganho" | "perdido";

/** Valor padrão (R$) de cada pacote quando `dealValue` não foi preenchido à mão. */
const PACKAGE_DEFAULT_VALUE: Record<DealPackage, (months: number) => number> = {
  nenhum: () => 0,
  essencial: (months) => 6900 * Math.max(months, 1),
  implementacao: () => 12000,
  outro: () => 0,
};

export type DailyMetric = {
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
};

export type AttributedDeal = {
  dealStatus: DealStatus;
  dealPackage: DealPackage;
  dealValue?: number | null;
  dealMonths?: number | null;
};

function dealRevenue(deal: AttributedDeal): number {
  if (deal.dealStatus !== "ganho") return 0;
  if (typeof deal.dealValue === "number" && deal.dealValue > 0) return deal.dealValue;
  return PACKAGE_DEFAULT_VALUE[deal.dealPackage]?.(deal.dealMonths ?? 3) ?? 0;
}

export type ScorecardStatus = "coletando" | "atencao" | "estavel" | "saudavel";

export type CampaignScorecardInput = {
  campaign: { id: string | number; name: string; dailyBudgetTarget: number; cpcCeiling: number };
  dailyMetrics: DailyMetric[];
  attributedDeals: AttributedDeal[];
};

export type CampaignScorecard = {
  campaignId: string | number;
  campaignName: string;
  status: ScorecardStatus;
  recommendation: string;
  totals: { impressions: number; clicks: number; cost: number; conversions: number };
  ctr: number;
  avgCpc: number;
  leadsCount: number;
  cac: number | null;
  revenue: number;
  roiMultiple: number | null;
  spendRatio: number;
};

const money = (n: number) => `R$${n.toFixed(2).replace(".", ",")}`;

export function computeCampaignScorecard({
  campaign,
  dailyMetrics,
  attributedDeals,
}: CampaignScorecardInput): CampaignScorecard {
  const T = ADS_INSIGHTS_THRESHOLDS;

  const totals = dailyMetrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      cost: acc.cost + m.cost,
      conversions: acc.conversions + m.conversions,
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
  );

  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const avgCpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
  const leadsCount = attributedDeals.length;
  const cac = leadsCount > 0 ? totals.cost / leadsCount : null;
  const revenue = attributedDeals.reduce((sum, d) => sum + dealRevenue(d), 0);
  const roiMultiple = totals.cost > 0 ? revenue / totals.cost : null;

  const days = dailyMetrics.length || 1;
  const avgDailySpend = totals.cost / days;
  const dailyBudget = campaign.dailyBudgetTarget || 1;
  const spendRatio = avgDailySpend / dailyBudget;
  const cpcCeiling = campaign.cpcCeiling || T.CPC_CEILING_FALLBACK;

  let status: ScorecardStatus = "estavel";
  let recommendation = "Dentro do esperado — manter como está.";

  if (totals.clicks < T.MIN_CLICKS_FOR_SIGNAL) {
    status = "coletando";
    recommendation = `Ainda sem dados suficientes (${totals.clicks} de ${T.MIN_CLICKS_FOR_SIGNAL} cliques) — aguardar antes de otimizar.`;
  } else if (avgCpc > cpcCeiling) {
    status = "atencao";
    recommendation = `CPC médio (${money(avgCpc)}) acima do teto (${money(cpcCeiling)}) — revisar lances ou pausar as palavras mais caras.`;
  } else if (cac !== null && cac > T.CAC_TARGET * T.CAC_WARNING_RATIO) {
    status = "atencao";
    recommendation = `CAC (${money(cac)}) muito acima da meta (${money(T.CAC_TARGET)}) — revisar negativas/segmentação antes de subir orçamento.`;
  } else if (spendRatio < T.BUDGET_UNDERSPEND_RATIO) {
    status = "atencao";
    recommendation = `Investindo só ${(spendRatio * 100).toFixed(0)}% do orçamento diário — considerar subir o teto de CPC.`;
  } else if (spendRatio > T.BUDGET_OVERSPEND_RATIO) {
    status = "atencao";
    recommendation = `Gastando acima do orçamento diário (${(spendRatio * 100).toFixed(0)}%) — revisar teto de CPC/lances.`;
  } else if (revenue > 0 && roiMultiple !== null && roiMultiple >= T.ROI_GOOD_MULTIPLE) {
    status = "saudavel";
    recommendation = `ROI acima de ${T.ROI_GOOD_MULTIPLE}x — manter e considerar aumentar orçamento.`;
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status,
    recommendation,
    totals,
    ctr,
    avgCpc,
    leadsCount,
    cac,
    revenue,
    roiMultiple,
    spendRatio,
  };
}

export type Flag = { code: string; label: string; recommendation: string };

export type AdGroupFlagInput = {
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
};

export function computeAdGroupFlags(group: AdGroupFlagInput): Flag[] {
  const T = ADS_INSIGHTS_THRESHOLDS;
  const flags: Flag[] = [];
  const ctr = group.rollupImpressions > 0 ? group.rollupClicks / group.rollupImpressions : 0;

  if (group.rollupClicks >= T.MIN_CLICKS_FOR_SIGNAL && ctr < T.CTR_LOW_THRESHOLD) {
    flags.push({
      code: "low_ctr",
      label: "CTR baixo",
      recommendation: "Testar novos títulos/descrições nos anúncios deste grupo.",
    });
  }
  if (group.rollupCost >= T.ZERO_CONVERSION_SPEND_FLAG && group.rollupConversions === 0) {
    flags.push({
      code: "no_conversion_spend",
      label: "Gasto sem conversão",
      recommendation: "Revisar as palavras-chave deste grupo — gasto relevante sem retorno.",
    });
  }
  return flags;
}

export type KeywordFlagInput = {
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
};

export function computeKeywordFlags(keyword: KeywordFlagInput, cpcCeiling: number): Flag[] {
  const T = ADS_INSIGHTS_THRESHOLDS;
  const flags: Flag[] = [];
  const ceiling = cpcCeiling || T.CPC_CEILING_FALLBACK;
  const cpc = keyword.rollupClicks > 0 ? keyword.rollupCost / keyword.rollupClicks : 0;

  if (
    keyword.rollupClicks >= T.MIN_CLICKS_FOR_KEYWORD_FLAG &&
    keyword.rollupCost >= T.ZERO_CONVERSION_SPEND_FLAG &&
    keyword.rollupConversions === 0
  ) {
    flags.push({
      code: "negative_candidate",
      label: "Candidata a negativa",
      recommendation: "Gasto alto e nenhuma conversão — considerar negativar ou pausar.",
    });
  }
  if (keyword.rollupClicks > 0 && cpc > ceiling) {
    flags.push({
      code: "cpc_above_ceiling",
      label: "CPC acima do teto",
      recommendation: "Reduzir o lance manual ou monitorar de perto.",
    });
  }
  if (keyword.rollupConversions > 0) {
    const kwCac = keyword.rollupCost / keyword.rollupConversions;
    if (kwCac <= T.CAC_TARGET) {
      flags.push({
        code: "good_performer",
        label: "Bom desempenho",
        recommendation: "CAC baixo — considerar aumentar o lance para ganhar mais posição.",
      });
    }
  }
  if (
    keyword.rollupImpressions > 0 &&
    keyword.rollupImpressions < 50 &&
    keyword.rollupClicks < T.MIN_CLICKS_FOR_KEYWORD_FLAG
  ) {
    flags.push({
      code: "low_volume",
      label: "Baixo volume",
      recommendation: "Poucas impressões — informativo, ainda sem sinal suficiente.",
    });
  }
  return flags;
}

// ═══════════════ Forecast pré-investimento (simulação) ═══════════════

/**
 * Premissas dos cenários — ajustar aqui conforme dados reais chegarem.
 * A base (cliques/custo) vem da PREVISÃO OFICIAL do Google (Planejador de
 * Palavras-chave, campos forecast* da campanha); as taxas abaixo são as
 * únicas suposições nossas.
 */
export const FORECAST_ASSUMPTIONS = {
  /** Fração dos cliques que vira lead (conclui o lead-gate do Diagnóstico). */
  LEAD_CONVERSION: { conservador: 0.04, base: 0.07, otimista: 0.12 },
  /** Fração dos leads que fecha contrato (Chamada de Diagnóstico → Proposta). */
  CLOSE_RATE: { conservador: 0.05, base: 0.1, otimista: 0.2 },
  /** Receita por cliente fechado: Pacote Essencial, ciclo mínimo (R$6.900 × 3). */
  REVENUE_PER_CLIENT: 6900 * 3,
} as const;

export type ForecastScenarioKey = "conservador" | "base" | "otimista";

export type ForecastScenario = {
  key: ForecastScenarioKey;
  label: string;
  leadsPerMonth: number;
  cac: number | null;
  clientsPerMonth: number;
  revenuePerMonth: number;
  roiMultiple: number | null;
};

export type GoogleForecast = {
  clicks: number;
  impressions: number;
  cost: number;
  ctrPct: number;
  avgCpc: number;
  dailyBudget: number;
  capturedAt?: string | null;
  notes?: string | null;
};

const SCENARIO_LABELS: Record<ForecastScenarioKey, string> = {
  conservador: "Conservador",
  base: "Base",
  otimista: "Otimista",
};

/** Projeta leads/CAC/clientes/receita a partir da previsão oficial do Google. */
export function computeForecastScenarios(forecast: GoogleForecast): ForecastScenario[] {
  const A = FORECAST_ASSUMPTIONS;
  return (Object.keys(SCENARIO_LABELS) as ForecastScenarioKey[]).map((key) => {
    const leads = forecast.clicks * A.LEAD_CONVERSION[key];
    const clients = leads * A.CLOSE_RATE[key];
    const revenue = clients * A.REVENUE_PER_CLIENT;
    return {
      key,
      label: SCENARIO_LABELS[key],
      leadsPerMonth: leads,
      cac: leads > 0 ? forecast.cost / leads : null,
      clientsPerMonth: clients,
      revenuePerMonth: revenue,
      roiMultiple: forecast.cost > 0 ? revenue / forecast.cost : null,
    };
  });
}

/**
 * Taxa de fechamento (lead → cliente) necessária para a campanha se pagar,
 * dado o nº de leads do cenário. Ex.: 0.08 = 8% dos leads precisam fechar.
 */
export function breakEvenCloseRate(forecast: GoogleForecast, leadsPerMonth: number): number | null {
  if (leadsPerMonth <= 0) return null;
  const clientsNeeded = forecast.cost / FORECAST_ASSUMPTIONS.REVENUE_PER_CLIENT;
  return clientsNeeded / leadsPerMonth;
}

// ═══════════════ Concorrentes observados no Google ═══════════════

export type CompetitorRow = {
  name: string;
  domain?: string | null;
  keywordText: string;
  type: "patrocinado" | "organico" | "local";
  adSnippet?: string | null;
  appearances?: number | null;
};

export type CompetitorSummary = {
  totalAdvertisers: number;
  /** Concorrentes vistos em 2+ buscas — presença dominante nos anúncios. */
  dominant: string[];
  /** Quantos anunciantes usam "diagnóstico gratuito" (a mesma oferta da EA). */
  freeDiagnosisCount: number;
  keywordsCovered: number;
};

export function computeCompetitorSummary(rows: CompetitorRow[]): CompetitorSummary {
  const sponsored = rows.filter((r) => r.type === "patrocinado");
  const byName = new Map<string, Set<string>>();
  for (const r of sponsored) {
    if (!byName.has(r.name)) byName.set(r.name, new Set());
    byName.get(r.name)!.add(r.keywordText);
  }
  const dominant = [...byName.entries()]
    .filter(([, kws]) => kws.size >= 2)
    .map(([name]) => name)
    .sort();
  const freeDiagnosisCount = [...byName.keys()].filter((name) =>
    sponsored.some(
      (r) => r.name === name && /diagn[oó]stico gr[aá]t/i.test(r.adSnippet ?? ""),
    ),
  ).length;
  return {
    totalAdvertisers: byName.size,
    dominant,
    freeDiagnosisCount,
    keywordsCovered: new Set(rows.map((r) => r.keywordText)).size,
  };
}
