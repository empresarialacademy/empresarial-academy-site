import { NextResponse } from 'next/server';
import { getGoogleAdsClient, isGoogleAdsConfigured, extractGoogleAdsErrorMessage } from '@/lib/google-ads';

/**
 * Forecast de mercado (volume de busca + faixa de CPC) via KeywordPlanIdeaService,
 * destravado pela aprovação do Basic Access do developer token em 06/08/2026 —
 * antes só dava pra pegar isso manualmente pela UI do Planejador de Palavras-chave
 * (última vez em 23/07, já desatualizado). Não confundir com /api/ads/forecast,
 * que é uma análise da IA sobre gasto JÁ ocorrido (sempre zero com a campanha
 * pausada) — este endpoint não depende de a campanha estar ativa.
 *
 * geoTargetConstants/2076 = Brasil · languageConstants/1014 = Português
 */
const KEYWORDS = [
  'consultoria de gestão empresarial',
  'consultoria empresarial para pequenas empresas',
  'diagnóstico empresarial gratuito',
  'consultoria para pequenas e médias empresas',
  'mentoria para pequenas empresas',
];

export async function GET() {
  try {
    if (!isGoogleAdsConfigured()) {
      return NextResponse.json({ error: 'Google Ads não configurado (env vars).' }, { status: 400 });
    }

    const { customer } = await getGoogleAdsClient();

    const result = await customer.keywordPlanIdeas.generateKeywordIdeas({
      customer_id: process.env.GOOGLE_CUSTOMER_ID,
      language: 'languageConstants/1014',
      geo_target_constants: ['geoTargetConstants/2076'],
      keyword_plan_network: 'GOOGLE_SEARCH',
      keyword_seed: { keywords: KEYWORDS },
      page_size: 30,
    } as never);

    return NextResponse.json({ success: true, keywords: KEYWORDS, raw: result });
  } catch (error: unknown) {
    console.error('Erro no forecast de keywords:', error);
    return NextResponse.json(
      { success: false, error: extractGoogleAdsErrorMessage(error), raw: JSON.stringify(error) },
      { status: 500 },
    );
  }
}
