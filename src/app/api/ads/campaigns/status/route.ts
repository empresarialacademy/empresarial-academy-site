import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { setCampaignsStatus, extractGoogleAdsErrorMessage } from '@/lib/google-ads';

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient();
    const body = await req.json();

    const campaignIds: string[] = Array.isArray(body?.campaignIds) ? body.campaignIds.map(String) : [];
    const action: 'enable' | 'pause' = body?.action === 'enable' ? 'enable' : 'pause';

    if (campaignIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma campanha selecionada.' }, { status: 400 });
    }

    const { docs } = await payload.find({
      collection: 'ad-campaigns',
      where: { id: { in: campaignIds } },
      limit: campaignIds.length,
      depth: 0,
    });

    const withGoogleId = docs.filter((d) => Boolean((d as { googleAdsCampaignId?: string }).googleAdsCampaignId));

    if (withGoogleId.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma das campanhas selecionadas tem ID do Google Ads vinculado.' },
        { status: 400 },
      );
    }

    const googleIds = withGoogleId.map((d) => String((d as { googleAdsCampaignId?: string }).googleAdsCampaignId));
    const result = await setCampaignsStatus(googleIds, action);

    if (!result.ok) {
      const error = result.reason === 'no-refresh-token' ? 'Google Ads não está conectado.' : result.reason;
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    // Mantém o Payload em sincronia sem esperar o próximo sync completo.
    await Promise.all(
      withGoogleId.map((d) =>
        payload.update({
          collection: 'ad-campaigns',
          id: d.id,
          data: { status: action === 'enable' ? 'ativa' : 'pausada' },
        }),
      ),
    );

    return NextResponse.json({ success: true, updated: withGoogleId.length, skipped: docs.length - withGoogleId.length });
  } catch (error: unknown) {
    console.error('Erro ao alterar status de campanhas:', error);
    return NextResponse.json({ success: false, error: extractGoogleAdsErrorMessage(error) }, { status: 500 });
  }
}
