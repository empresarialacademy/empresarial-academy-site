import { GoogleAdsApi, enums } from 'google-ads-api';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * A `google-ads-api` não lança `Error` padrão — decodifica a falha da API do
 * Google num objeto próprio (`{ errors: [{ message, error_code }] }`, do proto
 * `GoogleAdsFailure`), às vezes sem `.message` na raiz. Sem isso, o front acaba
 * mostrando literalmente "Erro: undefined" (ex.: developer token em nível de
 * teste tentando ler a conta real — erro comum até o Basic Access ser aprovado).
 */
export function extractGoogleAdsErrorMessage(error: unknown): string {
  const e = error as {
    message?: string;
    errors?: Array<{ message?: string; error_code?: unknown }>;
    response?: { data?: { error?: { message?: string } } };
  };
  const fromFailure = e?.errors?.[0]?.message;
  if (fromFailure) return fromFailure;
  if (e?.message) return e.message;
  const fromRest = e?.response?.data?.error?.message;
  if (fromRest) return fromRest;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isGoogleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET &&
      process.env.GOOGLE_DEVELOPER_TOKEN &&
      process.env.GOOGLE_CUSTOMER_ID &&
      process.env.GOOGLE_LOGIN_CUSTOMER_ID,
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
    // Conta-cliente onde as campanhas rodam de fato (770-135-7894), vinculada
    // à MCC "EA MKT HUB" (confirmado por e-mail do Google em 24/07 — a MCC não
    // roda campanha nela mesma, é só a conta administradora).
    customer_id: process.env.GOOGLE_CUSTOMER_ID || '',
    // Conta MCC — autentica em nome da conta-cliente acima.
    login_customer_id: process.env.GOOGLE_LOGIN_CUSTOMER_ID || process.env.GOOGLE_CUSTOMER_ID || '',
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
    const today = new Date().toISOString().slice(0, 10);

    const results = await customer.query(`
      SELECT campaign.id, segments.date, metrics.impressions, metrics.clicks,
             metrics.cost_micros, metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${sinceDate}' AND '${today}'
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
  } catch (e: unknown) {
    const message = extractGoogleAdsErrorMessage(e);
    if (message.includes('não está conectado')) {
      return { ok: false, reason: "no-refresh-token" };
    }
    console.error("[google-ads] falha ao buscar métricas:", message);
    return { ok: false, reason: "exception" };
  }
}

/**
 * "Quanto tem de crédito no Google Ads": a API do Google Ads NÃO expõe o saldo
 * real de contas pré-pagas self-serve (confirmado — não é um campo que existe
 * no `account_budget`, esse resource só reflete um "limite de gastos" que
 * normalmente só é configurado em contas faturadas/gerenciadas por agência).
 * Para a conta do Thiago (pagamento manual/pré-pago, sem limite configurado),
 * a query abaixo tende a devolver `hasLimit: false` — nesse caso o painel usa
 * os números locais (orçamento diário somado + gasto sincronizado) como proxy
 * e linka pro faturamento real do Google para o valor exato.
 */
export type AccountBudgetSummary =
  | { ok: true; hasLimit: true; approvedLimit: number; spent: number; remaining: number }
  | { ok: true; hasLimit: false }
  | { ok: false; reason: string };

export async function fetchAccountBudgetSummary(): Promise<AccountBudgetSummary> {
  if (!isGoogleAdsConfigured()) return { ok: false, reason: "not-configured" };

  try {
    const { customer } = await getGoogleAdsClient();

    const results = await customer.query(`
      SELECT account_budget.approved_spending_limit_type,
             account_budget.approved_spending_limit_micros,
             account_budget.adjusted_spending_limit_micros,
             account_budget.amount_served_micros
      FROM account_budget
      WHERE account_budget.status = 'APPROVED'
    `);

    const rows = results as Array<Record<string, Record<string, unknown>>>;
    let approvedLimitMicros = 0;
    let servedMicros = 0;
    let anyFinite = false;

    for (const r of rows) {
      const type = Number(r.account_budget?.approved_spending_limit_type ?? 0);
      const limitMicros = Number(
        r.account_budget?.adjusted_spending_limit_micros ?? r.account_budget?.approved_spending_limit_micros ?? 0,
      );
      // SpendingLimitType.INFINITE (2) = sem teto — não entra na soma.
      if (type !== enums.SpendingLimitType.INFINITE && limitMicros > 0) {
        anyFinite = true;
        approvedLimitMicros += limitMicros;
      }
      servedMicros += Number(r.account_budget?.amount_served_micros ?? 0);
    }

    if (!anyFinite) return { ok: true, hasLimit: false };

    const approvedLimit = approvedLimitMicros / 1_000_000;
    const spent = servedMicros / 1_000_000;
    return { ok: true, hasLimit: true, approvedLimit, spent, remaining: Math.max(approvedLimit - spent, 0) };
  } catch (e: unknown) {
    const message = extractGoogleAdsErrorMessage(e);
    if (message.includes("não está conectado")) {
      return { ok: false, reason: "no-refresh-token" };
    }
    console.error("[google-ads] falha ao buscar account_budget:", message);
    return { ok: false, reason: "exception" };
  }
}

export type CampaignStatusAction = "enable" | "pause";

/** Ativa (ENABLED) ou pausa (PAUSED) uma ou mais campanhas de uma vez via mutate em lote. */
export async function setCampaignsStatus(
  googleAdsCampaignIds: string[],
  action: CampaignStatusAction,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isGoogleAdsConfigured()) return { ok: false, reason: "not-configured" };
  if (googleAdsCampaignIds.length === 0) return { ok: false, reason: "no-campaigns" };

  try {
    const { customer } = await getGoogleAdsClient();
    const customerId = process.env.GOOGLE_CUSTOMER_ID || "";
    const status = action === "enable" ? enums.CampaignStatus.ENABLED : enums.CampaignStatus.PAUSED;

    await customer.campaigns.update(
      googleAdsCampaignIds.map((id) => ({
        resource_name: `customers/${customerId}/campaigns/${id}`,
        status,
      })),
    );

    return { ok: true };
  } catch (e: unknown) {
    const message = extractGoogleAdsErrorMessage(e);
    if (message.includes("não está conectado")) {
      return { ok: false, reason: "no-refresh-token" };
    }
    console.error("[google-ads] falha ao alterar status de campanhas:", message);
    return { ok: false, reason: message };
  }
}

export const OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/ads/callback` : 'http://localhost:3000/api/ads/callback',
  scope: 'https://www.googleapis.com/auth/adwords',
};
