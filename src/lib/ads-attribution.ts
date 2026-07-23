import type { Payload } from "payload";

type LeadDetails = Record<string, unknown> | null | undefined;

type Attribution = {
  adCampaign?: string | number;
  adGroup?: string | number;
  adKeyword?: string | number;
  adGclid?: string;
};

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/**
 * Resolve a campanha/grupo/palavra-chave do Google Ads a partir dos
 * parâmetros de atribuição (gclid/utm_*) que o Diagnóstico encaminha dentro
 * de `details` (ver ConversionCTA.tsx e Frente E §5). Roda uma vez, na
 * criação do lead (hook `beforeChange` em Leads.ts) — nunca lança, mesma
 * filosofia de src/lib/rdstation.ts: se não achar nada, devolve campos
 * vazios e a captação segue normalmente.
 */
export async function attributeLeadToAds(
  details: LeadDetails,
  payload: Payload,
): Promise<Attribution> {
  if (!details || typeof details !== "object") return {};

  const gclid = str(details.gclid);
  const utmCampaign = str(details.utm_campaign);
  const utmTerm = str(details.utm_term);
  const utmSource = str(details.utm_source)?.toLowerCase();

  // Só tenta atribuir tráfego que parece vir do Google Ads.
  if (!gclid && !utmCampaign && utmSource !== "google") return {};

  try {
    let campaign: { id: string | number } | undefined;

    if (utmCampaign) {
      const byId = await payload.find({
        collection: "ad-campaigns",
        where: { googleAdsCampaignId: { equals: utmCampaign } },
        limit: 1,
        depth: 0,
      });
      campaign = byId.docs[0];

      if (!campaign) {
        const byName = await payload.find({
          collection: "ad-campaigns",
          where: { name: { equals: utmCampaign } },
          limit: 1,
          depth: 0,
        });
        campaign = byName.docs[0];
      }
    }

    // Enquanto houver só uma campanha ativa, cai nela por padrão — conveniência
    // desta fase de campanha única (ver plano); não é para ser permanente.
    if (!campaign) {
      const active = await payload.find({
        collection: "ad-campaigns",
        where: { status: { equals: "ativa" } },
        limit: 2,
        depth: 0,
      });
      if (active.docs.length === 1) campaign = active.docs[0];
    }

    if (!campaign) return gclid ? { adGclid: gclid } : {};

    let adGroupId: string | number | undefined;
    let adKeywordId: string | number | undefined;

    if (utmTerm) {
      const keywordMatch = await payload.find({
        collection: "ad-keywords",
        where: { text: { equals: utmTerm } },
        limit: 1,
        depth: 1,
      });
      const kw = keywordMatch.docs[0];
      const group = kw?.adGroup as { id: string | number; campaign?: unknown } | undefined;
      if (kw && group && typeof group === "object") {
        const groupCampaignId =
          typeof group.campaign === "object" && group.campaign
            ? (group.campaign as { id: string | number }).id
            : group.campaign;
        if (String(groupCampaignId) === String(campaign.id)) {
          adKeywordId = kw.id as string | number;
          adGroupId = group.id;
        }
      }
    }

    return {
      adCampaign: campaign.id,
      adGroup: adGroupId,
      adKeyword: adKeywordId,
      adGclid: gclid,
    };
  } catch (e) {
    payload.logger.error(`[ads-attribution] falha ao resolver atribuição: ${e}`);
    return gclid ? { adGclid: gclid } : {};
  }
}
