import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { fetchDailyCampaignMetrics, isGoogleAdsConfigured } from "@/lib/google-ads";

/**
 * Cron diário de sincronização com o Google Ads (vercel.json → crons).
 * Sem GOOGLE_ADS_* configuradas, é um no-op comprovado (`{skipped:true}`) —
 * a conta ainda não existe (Google Ads segue ADIADO, ver plano de
 * aquisição). Quando existir, busca as métricas diárias e faz upsert em
 * `ad-metrics-daily` por campanha+data, casando pelo `googleAdsCampaignId`
 * cadastrado em `ad-campaigns`.
 *
 * Autenticação: mesmo formato do cron de nutrição
 * (src/app/api/cron/nutricao/route.ts) — `Authorization: Bearer
 * ${CRON_SECRET}` ou `?key=`. `?dry=1` só relata o que seria gravado.
 */

const SYNC_WINDOW_DAYS = 7;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const key = url.searchParams.get("key");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const dry = url.searchParams.get("dry") === "1";

  if (!isGoogleAdsConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "google-ads-not-configured" });
  }

  const payload = await getPayloadClient();
  const { docs: campaigns } = await payload.find({
    collection: "ad-campaigns",
    where: { googleAdsCampaignId: { exists: true } },
    limit: 100,
    depth: 0,
  });

  const sinceDate = new Date(Date.now() - SYNC_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);
  const fetched = await fetchDailyCampaignMetrics(sinceDate);
  if (!fetched.ok) {
    return NextResponse.json({ ok: false, reason: fetched.reason });
  }

  const byGoogleId = new Map(
    campaigns
      .filter((c) => typeof c.googleAdsCampaignId === "string" && c.googleAdsCampaignId)
      .map((c) => [c.googleAdsCampaignId as string, c.id]),
  );

  const results: Array<Record<string, unknown>> = [];
  for (const row of fetched.rows) {
    const campaignId = byGoogleId.get(row.googleAdsCampaignId);
    if (!campaignId) {
      results.push({ googleAdsCampaignId: row.googleAdsCampaignId, action: "skipped-no-local-campaign" });
      continue;
    }
    try {
      const existing = await payload.find({
        collection: "ad-metrics-daily",
        where: { and: [{ campaign: { equals: campaignId } }, { date: { equals: row.date } }] },
        limit: 1,
        depth: 0,
      });
      const data = {
        campaign: campaignId,
        date: row.date,
        impressions: row.impressions,
        clicks: row.clicks,
        cost: row.cost,
        conversions: row.conversions,
        source: "api" as const,
      };
      if (dry) {
        results.push({ ...data, action: existing.docs[0] ? "would-update" : "would-create" });
        continue;
      }
      if (existing.docs[0]) {
        await payload.update({ collection: "ad-metrics-daily", id: existing.docs[0].id, data });
        results.push({ campaignId, date: row.date, action: "updated" });
      } else {
        await payload.create({ collection: "ad-metrics-daily", data });
        results.push({ campaignId, date: row.date, action: "created" });
      }
    } catch (e) {
      results.push({ campaignId, date: row.date, action: "error", error: String(e) });
    }
  }

  return NextResponse.json({ ok: true, dry, processed: results.length, results });
}
