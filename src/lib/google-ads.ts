import { GoogleAdsApi, enums } from 'google-ads-api';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export function isGoogleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET &&
      process.env.GOOGLE_DEVELOPER_TOKEN &&
      process.env.GOOGLE_CUSTOMER_ID,
  );
}

export async function getGoogleAdsClient() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: 'ads-settings' }) as unknown as { refreshToken?: string };
  
  if (!settings?.refreshToken) {
    throw new Error('Google Ads não está conectado. Vá no EA ADS Manager (dentro do EA HUB) e autorize o acesso.');
  }

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || '',
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_CUSTOMER_ID || '',
    // Conta MCC (EA MKT HUB) — as campanhas rodam na própria MCC, então
    // login_customer_id == customer_id.
    login_customer_id: process.env.GOOGLE_CUSTOMER_ID || '',
    refresh_token: settings.refreshToken,
  });

  return { client, customer, enums };
}

export type CampaignMetricsRow = {
  googleAdsCampaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
};

type FetchResult = { ok: true; rows: CampaignMetricsRow[] } | { ok: false; reason: string };

export async function fetchDailyCampaignMetrics(sinceDate: string): Promise<FetchResult> {
  if (!isGoogleAdsConfigured()) return { ok: false, reason: "not-configured" };

  try {
    const { customer } = await getGoogleAdsClient();

    const results = await customer.query(`
      SELECT campaign.id, segments.date, metrics.impressions, metrics.clicks,
             metrics.cost_micros, metrics.conversions
      FROM campaign
      WHERE segments.date >= '${sinceDate}'
    `);

    const rows: CampaignMetricsRow[] = (results as Array<Record<string, Record<string, unknown>>>).map((r) => ({
      googleAdsCampaignId: String(r.campaign?.id ?? ""),
      date: String(r.segments?.date ?? ""),
      impressions: Number(r.metrics?.impressions ?? 0),
      clicks: Number(r.metrics?.clicks ?? 0),
      cost: Number(r.metrics?.cost_micros ?? 0) / 1_000_000,
      conversions: Number(r.metrics?.conversions ?? 0),
    }));

    return { ok: true, rows };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.message.includes('não está conectado')) {
      return { ok: false, reason: "no-refresh-token" };
    }
    console.error("[google-ads] falha ao buscar métricas:", e);
    return { ok: false, reason: "exception" };
  }
}

export const OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/ads/callback` : 'http://localhost:3000/api/ads/callback',
  scope: 'https://www.googleapis.com/auth/adwords',
};
