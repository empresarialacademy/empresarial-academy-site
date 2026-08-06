import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import {
  computeCampaignScorecard,
  type AttributedDeal,
  type CampaignScorecard,
  type CompetitorRow,
  type DailyMetric,
  type DealPackage,
  type DealStatus,
} from "@/lib/ads-insights";
import { AdsMatrix } from "./AdsMatrix";
import { AdsCampaignDetail } from "./AdsCampaignDetail";
import { AdsForecastPanel } from "./AdsForecastPanel";
import { AdsCompetitorsPanel } from "./AdsCompetitorsPanel";
import { SyncAdsButton } from "./AdsClientActions";
import { EaHubBackLink } from "@/components/admin/brand/EaHubBackLink";

type CampaignDoc = {
  id: string | number;
  name: string;
  status: string;
  dailyBudgetTarget: number;
  monthlyBudgetTarget: number;
  cpcCeiling: number;
  forecastClicks?: number | null;
  forecastImpressions?: number | null;
  forecastCost?: number | null;
  forecastCtr?: number | null;
  forecastAvgCpc?: number | null;
  forecastDailyBudget?: number | null;
  forecastCapturedAt?: string | null;
  forecastNotes?: string | null;
};

type DailyMetricDoc = {
  id: string | number;
  campaign: string | number;
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
};

type AdGroupDoc = {
  id: string | number;
  campaign: string | number;
  name: string;
  status: string;
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
};

type KeywordDoc = {
  id: string | number;
  adGroup: string | number;
  text: string;
  matchType: string;
  status: string;
  rollupImpressions: number;
  rollupClicks: number;
  rollupCost: number;
  rollupConversions: number;
  plannerCompetition?: string | null;
};

type LeadDealDoc = {
  id: string | number;
  adCampaign: string | number | null;
  dealStatus: DealStatus | null;
  dealPackage: DealPackage | null;
  dealValue: number | null;
  dealMonths: number | null;
};

/**
 * View custom registrada em payload.config.ts → admin.components.views.
 * Server Component: recebe `payload`/`searchParams` como props diretas (sem
 * round-trip por API pública — é uma tela só de admin). Views custom NÃO são
 * protegidas pelo redirecionamento de login padrão do Payload (confirmado em
 * @payloadcms/next/dist/views/Root/index.js — `isCustomAdminView` isenta a
 * rota da checagem); e o usuário logado também não vem como prop `user` de
 * nível superior (só `DefaultTemplate` recebe isso) — por isso o guard usa
 * `initPageResult.req.user` diretamente.
 */
export async function AdsPerformanceView({ payload, searchParams, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    redirect("/eahub/login?redirect=%2Feahub%2Fads-performance");
  }

  const { docs: campaignDocs } = await payload.find({
    collection: "ad-campaigns",
    limit: 50,
    depth: 0,
    sort: "name",
  });
  const campaigns = campaignDocs as unknown as CampaignDoc[];

  const adsSettings = (await payload.findGlobal({ slug: "ads-settings" })) as unknown as { refreshToken?: string };
  const isConnected = Boolean(adsSettings?.refreshToken);
  const oauthSuccess = searchParams?.oauth === "success";

  if (campaigns.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <EaHubBackLink />
        <h1>EA ADS Manager</h1>
        {oauthSuccess && (
          <div style={{ padding: 12, backgroundColor: "#e6f4ea", color: "#137333", marginBottom: 16, borderRadius: 4 }}>
            Google Ads conectado com sucesso!
          </div>
        )}
        <div style={{ padding: 16, backgroundColor: "#fef7e0", color: "#b06000", marginBottom: 24, borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {isConnected
              ? "Se o Sincronizar der erro de autenticação (ex.: invalid_grant), reconecte o Google Ads abaixo."
              : "O EA ADS precisa de acesso à sua conta do Google Ads para puxar os dados reais e analisar a performance."}
          </span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/ads/oauth" style={{ padding: "8px 16px", backgroundColor: "#1a73e8", color: "#fff", textDecoration: "none", borderRadius: 4, fontWeight: "bold" }}>
            {isConnected ? "Reconectar Google Ads" : "Conectar Google Ads"}
          </a>
        </div>
        <p>
          Nenhuma campanha cadastrada ainda. Crie uma em &quot;Marketing → Campanhas de Ads&quot;
          (ou conecte seu Google Ads e aperte em Sincronizar).
        </p>
        {isConnected && <SyncAdsButton />}
      </div>
    );
  }

  const campaignIds = campaigns.map((c) => c.id);

  const [{ docs: dailyDocs }, { docs: groupDocs }, { docs: leadDocs }] = await Promise.all([
    payload.find({
      collection: "ad-metrics-daily",
      where: { campaign: { in: campaignIds } },
      limit: 3000,
      depth: 0,
      sort: "date",
    }),
    payload.find({
      collection: "ad-groups",
      where: { campaign: { in: campaignIds } },
      limit: 200,
      depth: 0,
      sort: "name",
    }),
    payload.find({
      collection: "leads",
      where: { adCampaign: { in: campaignIds } },
      limit: 3000,
      depth: 0,
    }),
  ]);

  const dailyMetrics = dailyDocs as unknown as DailyMetricDoc[];
  const adGroups = groupDocs as unknown as AdGroupDoc[];
  const leads = leadDocs as unknown as LeadDealDoc[];

  const groupIds = adGroups.map((g) => g.id);
  const [{ docs: keywordDocs }, { docs: competitorDocs }] = await Promise.all([
    payload.find({
      collection: "ad-keywords",
      where: { adGroup: { in: groupIds.length > 0 ? groupIds : [-1] } },
      limit: 500,
      depth: 0,
      sort: "text",
    }),
    payload.find({
      collection: "ad-competitors",
      limit: 200,
      depth: 0,
      sort: "name",
    }),
  ]);
  const keywords = keywordDocs as unknown as KeywordDoc[];
  const competitors = competitorDocs as unknown as CompetitorRow[];

  // Agrupa por campanha para calcular o placar de cada uma.
  const scorecards: CampaignScorecard[] = campaigns.map((campaign) => {
    const metrics: DailyMetric[] = dailyMetrics
      .filter((m) => String(m.campaign) === String(campaign.id))
      .map((m) => ({
        date: typeof m.date === "string" ? m.date.slice(0, 10) : String(m.date),
        impressions: m.impressions ?? 0,
        clicks: m.clicks ?? 0,
        cost: m.cost ?? 0,
        conversions: m.conversions ?? 0,
      }));

    const deals: AttributedDeal[] = leads
      .filter((l) => String(l.adCampaign) === String(campaign.id))
      .map((l) => ({
        dealStatus: l.dealStatus ?? "em_andamento",
        dealPackage: l.dealPackage ?? "nenhum",
        dealValue: l.dealValue,
        dealMonths: l.dealMonths,
      }));

    return computeCampaignScorecard({ campaign, dailyMetrics: metrics, attributedDeals: deals });
  });

  const dailyBudgets = new Map(campaigns.map((c) => [String(c.id), c.dailyBudgetTarget]));

  const selectedParam = searchParams?.campaign;
  const selectedIdRaw = Array.isArray(selectedParam) ? selectedParam[0] : selectedParam;
  const selected =
    campaigns.find((c) => String(c.id) === String(selectedIdRaw)) ?? campaigns[0];
  const selectedScorecard = scorecards.find((s) => String(s.campaignId) === String(selected.id))!;

  const selectedDailyMetrics = dailyMetrics
    .filter((m) => String(m.campaign) === String(selected.id))
    .map((m) => ({
      date: typeof m.date === "string" ? m.date.slice(0, 10) : String(m.date),
      impressions: m.impressions ?? 0,
      clicks: m.clicks ?? 0,
      cost: m.cost ?? 0,
      conversions: m.conversions ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const selectedGroups = adGroups.filter((g) => String(g.campaign) === String(selected.id));
  const keywordsByGroup = new Map<string, KeywordDoc[]>();
  for (const k of keywords) {
    const key = String(k.adGroup);
    if (!keywordsByGroup.has(key)) keywordsByGroup.set(key, []);
    keywordsByGroup.get(key)!.push(k);
  }

  // Forecast pré-investimento da campanha selecionada (se capturado).
  const hasForecast = (selected.forecastClicks ?? 0) > 0 && (selected.forecastCost ?? 0) > 0;
  const selectedGroupIds = new Set(selectedGroups.map((g) => String(g.id)));
  const selectedKeywords = keywords.filter((k) => selectedGroupIds.has(String(k.adGroup)));
  const keywordsWithoutVolume = selectedKeywords.filter(
    (k) => (k.plannerCompetition ?? "sem_dados") === "sem_dados",
  ).length;

  return (
    <div style={{ padding: "var(--base, 24px)", maxWidth: 1100 }}>
      <EaHubBackLink />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>EA ADS Manager</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/eahub/globals/ads-settings"
          style={{ padding: "6px 12px", border: "1px solid var(--theme-elevation-150)", borderRadius: 4, textDecoration: "none", color: "inherit", fontSize: 13 }}
        >
          ⚙️ Configurações do EA ADS
        </a>
      </div>

      {oauthSuccess && (
        <div style={{ padding: 12, backgroundColor: "#e6f4ea", color: "#137333", marginBottom: 16, borderRadius: 4 }}>
          Google Ads conectado com sucesso!
        </div>
      )}
      <div style={{ padding: 16, backgroundColor: "#fef7e0", color: "#b06000", marginBottom: 24, borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          {isConnected
            ? "Se o Sincronizar der erro de autenticação (ex.: invalid_grant), reconecte o Google Ads abaixo."
            : "O EA ADS precisa de acesso à sua conta do Google Ads para puxar os dados reais e analisar a performance."}
        </span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/ads/oauth" style={{ padding: "8px 16px", backgroundColor: "#1a73e8", color: "#fff", textDecoration: "none", borderRadius: 4, fontWeight: "bold" }}>
          {isConnected ? "Reconectar Google Ads" : "Conectar Google Ads"}
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{ color: "var(--theme-elevation-600)", margin: 0, maxWidth: '600px' }}>
          Visão rápida por campanha, com sugestões automáticas — clique num card para aprofundar.
        </p>
        <SyncAdsButton />
      </div>

      <AdsMatrix scorecards={scorecards} dailyBudgets={dailyBudgets} selectedId={String(selected.id)} />

      {hasForecast ? (
        <AdsForecastPanel
          forecast={{
            clicks: selected.forecastClicks!,
            impressions: selected.forecastImpressions ?? 0,
            cost: selected.forecastCost!,
            ctrPct: selected.forecastCtr ?? 0,
            avgCpc: selected.forecastAvgCpc ?? 0,
            dailyBudget: selected.forecastDailyBudget ?? 0,
            capturedAt: selected.forecastCapturedAt,
            notes: selected.forecastNotes,
          }}
          keywordsWithoutVolume={keywordsWithoutVolume}
          keywordsTotal={selectedKeywords.length}
        />
      ) : null}

      <AdsCampaignDetail
        campaign={selected}
        scorecard={selectedScorecard}
        dailyMetrics={selectedDailyMetrics}
        adGroups={selectedGroups}
        keywordsByGroup={keywordsByGroup}
      />

      <AdsCompetitorsPanel rows={competitors} />
    </div>
  );
}
