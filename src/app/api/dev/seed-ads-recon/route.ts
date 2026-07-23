import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

/**
 * Carga dos DADOS REAIS coletados em 2026-07-23 na conta Google Ads do
 * Thiago (308-507-1783) e em buscas reais no Google (SERP):
 *
 * 1. Campanha planejada da Frente E (cria se não existir) com a PREVISÃO
 *    OFICIAL do Planejador de Palavras-chave (plano salvo planId=1427489442).
 * 2. Volume/lances/concorrência por palavra-chave (Planejador, Brasil,
 *    jul/2025–jun/2026).
 * 3. Concorrentes observados nos anúncios/orgânico de 3 buscas reais.
 *
 * Idempotente (upsert por chave natural). Como o seed-system-links, PODE
 * rodar contra o Neon (são dados reais de produção) — bloqueada apenas no
 * runtime de produção da Vercel.
 */

const CAMPAIGN_NAME = "Consultoria PME — Pesquisa (Frente E)";
const CAPTURED_AT = "2026-07-23T12:00:00.000Z";

const FORECAST = {
  forecastClicks: 141,
  forecastImpressions: 8601,
  forecastCost: 620,
  forecastCtr: 1.6,
  forecastAvgCpc: 4.41,
  forecastDailyBudget: 20,
  forecastCapturedAt: CAPTURED_AT,
  forecastNotes:
    "Previsão oficial do Planejador de Palavras-chave (plano salvo na conta, planId 1427489442; Brasil, ago/2026, Maximizar cliques, ~R$20/dia — o orçamento planejado é R$33/dia, então há folga). Distribuição prevista do custo: SP 46%, MG 8%, RJ 6%, SC 6%, RS 5%, outros 29%.",
};

/** Grupos e palavras EXATOS da Frente E (matchType: frase/exata). */
const GROUPS: Array<{ name: string; keywords: Array<{ text: string; matchType: "frase" | "exata" }> }> = [
  {
    name: "Consultoria empresarial (PME)",
    keywords: [
      { text: "consultoria empresarial para pme", matchType: "frase" },
      { text: "consultoria de gestão empresarial", matchType: "frase" },
      { text: "consultoria para pequena empresa", matchType: "frase" },
      { text: "consultoria empresarial para pequenas empresas", matchType: "exata" },
      { text: "consultoria de gestão para pme", matchType: "exata" },
    ],
  },
  {
    name: "Organizar processos / sair da operação",
    keywords: [
      { text: "consultoria para organizar a empresa", matchType: "frase" },
      { text: "como organizar os processos da empresa", matchType: "frase" },
      { text: "empresa que depende do dono", matchType: "frase" },
      { text: "como sair da operação da empresa", matchType: "frase" },
      { text: "consultoria para organizar processos", matchType: "exata" },
    ],
  },
  {
    name: "Diagnóstico empresarial gratuito",
    keywords: [
      { text: "diagnóstico empresarial gratuito", matchType: "frase" },
      { text: "avaliação de maturidade empresarial", matchType: "frase" },
      { text: "diagnóstico de gestão da empresa", matchType: "frase" },
      { text: "diagnóstico empresarial gratuito", matchType: "exata" },
    ],
  },
];

/** Dados do Planejador (Brasil) — só 3 palavras têm volume mensurável. */
type PlannerCompetition = "sem_dados" | "baixa" | "media" | "alta";
const PLANNER: Record<
  string,
  { plannerVolume: string; plannerCompetition: PlannerCompetition; plannerTopBidLow?: number; plannerTopBidHigh?: number; plannerYoY?: string }
> = {
  "consultoria de gestão empresarial": {
    plannerVolume: "100 – 1 mil",
    plannerCompetition: "media",
    plannerTopBidLow: 6.96,
    plannerTopBidHigh: 31.72,
    plannerYoY: "-90%",
  },
  "consultoria empresarial para pequenas empresas": {
    plannerVolume: "10 – 100",
    plannerCompetition: "media",
    plannerTopBidLow: 5.12,
    plannerTopBidHigh: 21.08,
    plannerYoY: "+900%",
  },
  "diagnóstico empresarial gratuito": {
    plannerVolume: "10 – 100",
    plannerCompetition: "alta",
    plannerYoY: "0%",
  },
};

/** Concorrentes observados em buscas reais no Google (23/07, gl=br). */
const COMPETITORS = [
  // Busca: consultoria de gestão empresarial
  { name: "Weedu", domain: "weedu.com.br", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria Gestao Empresarial — Resultado em 60 Dias", adSnippet: "Consultoria 5x mais barata. Método com seu time. Resultado em 60 dias. 150+ empresas. Cancele sem multa. Diagnóstico gratuito.", appearances: 2 },
  { name: "Aya Gestão", domain: "ayagestao.com", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria Gestão Empresa SP", adSnippet: "Consultoria empresarial para pequenas empresas em São Paulo. Diagnóstico.", appearances: 1 },
  { name: "IBM Consulting", domain: "ibm.com", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria de Gestão - Consultoria de Negócios", adSnippet: "Foco enterprise — não concorre pelo mesmo cliente PME.", appearances: 1 },
  { name: "Rox Consultoria", domain: "roxconsultoria.com", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria Empresarial - Diagnóstico Sem Compromisso", adSnippet: "Consultoria para pequenas e médias empresas. WhatsApp direto. Diagnóstico gratuito.", appearances: 2 },
  { name: "Harpia Consultoria", domain: "lp.harpiaconsultoria.com.br", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria completa empresas", adSnippet: "Receba um Diagnóstico Gratuito — reduzir custos e aumentar a lucratividade. Finanças, estratégia e processos.", appearances: 1 },
  { name: "Litis Consultoria", domain: "litisconsultoria.com.br", keywordText: "consultoria de gestão empresarial", type: "patrocinado", adTitle: "Consultoria Empresarial", adSnippet: "Licenças e alvarás — concorrência tangencial, não é consultoria de gestão.", appearances: 1 },
  // Busca: diagnóstico empresarial gratuito
  { name: "Weedu", domain: "weedu.com.br", keywordText: "diagnóstico empresarial gratuito", type: "patrocinado", adTitle: "Diagnostico Gratis - Agende Ja", adSnippet: "Identificamos onde seu lucro some e implementamos o método lado a lado. 150+ empresas. Diagnóstico gratuito.", appearances: 2 },
  { name: "GEG Gestão", domain: "geg-gestao.netlify.app", keywordText: "diagnóstico empresarial gratuito", type: "patrocinado", adTitle: "Diagnóstico Empresarial Grátis", adSnippet: "Fale agora no WhatsApp e receba orientação rápida. (Site amador em netlify.app.)", appearances: 1 },
  { name: "Sebrae", domain: "sebrae.com.br", keywordText: "diagnóstico empresarial gratuito", type: "organico", adTitle: "Diagnóstico de Gestão Unificado", adSnippet: "Domina o orgânico: diagnóstico gratuito institucional (PR/SC). Player estatal gratuito — difícil competir nesta palavra.", appearances: 1 },
  { name: "Mid Falconi", domain: "midfalconi.com", keywordText: "diagnóstico empresarial gratuito", type: "organico", adTitle: "Diagnosticador de Maturidade Empresarial", adSnippet: "Avalia a gestão em cinco pilares críticos, gratuito — conceito quase idêntico ao Diagnóstico da EA.", appearances: 1 },
  { name: "TaaS", domain: "taasbr.digital", keywordText: "diagnóstico empresarial gratuito", type: "organico", adTitle: "Diagnóstico Empresarial Gratuito para PMEs", adSnippet: "Análise em 6 áreas: Comercial, Operações, Financeiro...", appearances: 1 },
  // Busca: consultoria empresarial para pequenas empresas
  { name: "Bora Desenvolver", domain: "boradesenvolver.com.br", keywordText: "consultoria empresarial para pequenas empresas", type: "patrocinado", adTitle: "Agende um Diagnóstico", adSnippet: "Consultoria para pequenas e médias empresas que buscam crescer com estratégia. Agende seu diagnóstico comercial.", appearances: 1 },
  { name: "Rox Consultoria", domain: "roxconsultoria.com", keywordText: "consultoria empresarial para pequenas empresas", type: "patrocinado", adTitle: "Feita Para Pequenas Empresas - Acelere sua PME em 90 dias", adSnippet: "Diagnóstico gratuito e sem compromisso. Descubra onde sua margem está sendo perdida. Foco em Lucro Real.", appearances: 2 },
] as const;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de carga — bloqueada no runtime de produção." }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const log: Array<{ item: string; action: string }> = [];

  // 1) Campanha planejada (upsert por nome) + previsão oficial.
  const existingCampaign = await payload.find({
    collection: "ad-campaigns",
    where: { name: { equals: CAMPAIGN_NAME } },
    limit: 1,
    depth: 0,
  });
  let campaignId: string | number;
  if (existingCampaign.docs[0]) {
    campaignId = existingCampaign.docs[0].id;
    await payload.update({ collection: "ad-campaigns", id: campaignId, data: FORECAST });
    log.push({ item: CAMPAIGN_NAME, action: "forecast-atualizado" });
  } else {
    const created = await payload.create({
      collection: "ad-campaigns",
      data: {
        name: CAMPAIGN_NAME,
        status: "rascunho",
        dailyBudgetTarget: 33,
        monthlyBudgetTarget: 1000,
        cpcCeiling: 18,
        notes:
          "Campanha REAL planejada (Frente E) — ainda não publicada no Google Ads. Conta: 308-507-1783.",
        ...FORECAST,
      },
    });
    campaignId = created.id;
    log.push({ item: CAMPAIGN_NAME, action: "criada" });
  }

  // 2) Grupos + palavras (upsert) com dados do Planejador.
  for (const group of GROUPS) {
    const existingGroup = await payload.find({
      collection: "ad-groups",
      where: { and: [{ campaign: { equals: campaignId } }, { name: { equals: group.name } }] },
      limit: 1,
      depth: 0,
    });
    const groupId =
      existingGroup.docs[0]?.id ??
      (
        await payload.create({
          collection: "ad-groups",
          data: { campaign: campaignId, name: group.name, status: "ativo" },
        })
      ).id;
    if (!existingGroup.docs[0]) log.push({ item: `grupo: ${group.name}`, action: "criado" });

    for (const kw of group.keywords) {
      const planner = PLANNER[kw.text] ?? { plannerVolume: "—", plannerCompetition: "sem_dados" };
      const plannerData = { ...planner, plannerCapturedAt: CAPTURED_AT };
      const existingKw = await payload.find({
        collection: "ad-keywords",
        where: {
          and: [
            { adGroup: { equals: groupId } },
            { text: { equals: kw.text } },
            { matchType: { equals: kw.matchType } },
          ],
        },
        limit: 1,
        depth: 0,
      });
      if (existingKw.docs[0]) {
        await payload.update({ collection: "ad-keywords", id: existingKw.docs[0].id, data: plannerData });
        log.push({ item: `palavra: ${kw.text} (${kw.matchType})`, action: "planejador-atualizado" });
      } else {
        await payload.create({
          collection: "ad-keywords",
          data: { adGroup: groupId, text: kw.text, matchType: kw.matchType, status: "ativa", ...plannerData },
        });
        log.push({ item: `palavra: ${kw.text} (${kw.matchType})`, action: "criada" });
      }
    }
  }

  // 3) Concorrentes (upsert por nome + palavra + tipo).
  for (const c of COMPETITORS) {
    const existing = await payload.find({
      collection: "ad-competitors",
      where: {
        and: [
          { name: { equals: c.name } },
          { keywordText: { equals: c.keywordText } },
          { type: { equals: c.type } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    const data = { ...c, seenAt: CAPTURED_AT };
    if (existing.docs[0]) {
      await payload.update({ collection: "ad-competitors", id: existing.docs[0].id, data });
      log.push({ item: `concorrente: ${c.name} × ${c.keywordText}`, action: "atualizado" });
    } else {
      await payload.create({ collection: "ad-competitors", data });
      log.push({ item: `concorrente: ${c.name} × ${c.keywordText}`, action: "criado" });
    }
  }

  return NextResponse.json({ ok: true, campaignId, total: log.length, log });
}
