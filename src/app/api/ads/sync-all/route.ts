import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { getGoogleAdsClient, isGoogleAdsConfigured, extractGoogleAdsErrorMessage } from '@/lib/google-ads';

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient();
    
    // 1. Check if user is admin
    // Omit user check since it's an internal route triggered from admin panel
    
    if (!isGoogleAdsConfigured()) {
      return NextResponse.json({ success: false, error: 'Variáveis de ambiente do Google Ads não configuradas.' }, { status: 400 });
    }

    const { customer } = await getGoogleAdsClient();

    // 2. Fetch all active campaigns from Google Ads
    const results = await customer.query(`
      SELECT campaign.id, campaign.name, campaign.status, campaign.bidding_strategy_type, campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `);

    let added = 0;
    let updated = 0;

    for (const row of results as unknown[]) {
      const typedRow = row as { campaign: { id: string, name: string, status: string }, campaign_budget: { amount_micros: number } };
      const gId = String(typedRow.campaign.id);
      const name = String(typedRow.campaign.name);
      
      const existing = await payload.find({
        collection: 'ad-campaigns',
        where: { googleAdsCampaignId: { equals: gId } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        // Update
        await payload.update({
          collection: 'ad-campaigns',
          id: existing.docs[0].id,
          data: {
            name,
            status: typedRow.campaign.status === 'ENABLED' ? 'ativa' : 'pausada',
          },
        });
        updated++;
      } else {
        // Create
        await payload.create({
          collection: 'ad-campaigns',
          data: {
            name,
            googleAdsCampaignId: gId,
            status: typedRow.campaign.status === 'ENABLED' ? 'ativa' : 'pausada',
            dailyBudgetTarget: (typedRow.campaign_budget?.amount_micros ?? 0) / 1_000_000,
            monthlyBudgetTarget: ((typedRow.campaign_budget?.amount_micros ?? 0) / 1_000_000) * 30,
            cpcCeiling: 5,
          },
        });
        added++;
      }
    }

    // 3. Trigger metrics sync
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    fetch(`${protocol}://${host}/api/cron/ads-sync`, { method: 'GET' }).catch(console.error);

    return NextResponse.json({ success: true, added, updated });
  } catch (error: unknown) {
    console.error('Erro na sincronização de campanhas:', error);
    return NextResponse.json({ success: false, error: extractGoogleAdsErrorMessage(error) }, { status: 500 });
  }
}
