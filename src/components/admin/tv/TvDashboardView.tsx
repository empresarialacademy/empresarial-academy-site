import { getPendingStatus } from "@/lib/pending-status";
import { getPayloadClient } from "@/lib/payload";
import { TvDashboardClient } from "./TvDashboardClient";

export async function TvDashboardView() {
  const payload = await getPayloadClient();
  const pendingStatus = await getPendingStatus();

  // Buscar totais para KPIs iniciais
  const [leadsTotalRes, leadsRecentRes, contractsTotalRes, contractsSignedRes, apisRes] = await Promise.all([
    payload.find({ collection: "leads", limit: 1, depth: 0 }),
    payload.find({
      collection: "leads",
      where: {
        createdAt: {
          greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      limit: 50,
      depth: 0,
    }),
    payload.find({ collection: "contracts", limit: 1, depth: 0 }),
    payload.find({
      collection: "contracts",
      where: { status: { equals: "assinado" } },
      limit: 10,
      depth: 0,
    }),
    payload.find({ collection: "api-inventory", limit: 50, depth: 0 }),
  ]);

  const recentLeads = leadsRecentRes.docs as Array<{
    score?: number | null;
    weakestPillar?: string | null;
  }>;
  const scores = recentLeads.map((l) => l.score).filter((s): s is number => typeof s === "number");
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 58;

  const pillarCounts: Record<string, number> = {};
  recentLeads.forEach((l) => {
    if (l.weakestPillar) {
      pillarCounts[l.weakestPillar] = (pillarCounts[l.weakestPillar] || 0) + 1;
    }
  });
  let topBottleneck = "Fluxo de Alta Performance";
  let maxCount = 0;
  Object.entries(pillarCounts).forEach(([pillar, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topBottleneck = pillar;
    }
  });

  const totalAlerts =
    (pendingStatus.eaPost?.pendingApprovalCount ?? 0) +
    (pendingStatus.eaPost?.tokenAlerts?.length ?? 0) +
    (pendingStatus.eaPost?.cronAlerts?.length ?? 0) +
    pendingStatus.contractsAwaitingSignature.length +
    pendingStatus.expiringCredentials.length;

  const initialKpis = {
    totalAlerts,
    pendingApprovals: pendingStatus.eaPost?.pendingApprovalCount ?? 0,
    contractsPending: pendingStatus.contractsAwaitingSignature.length,
    signedContracts: contractsSignedRes.totalDocs,
    totalContracts: contractsTotalRes.totalDocs,
    totalLeads: leadsTotalRes.totalDocs,
    leadsLast7Days: leadsRecentRes.totalDocs,
    avgScore,
    topBottleneck,
    totalApis: apisRes.totalDocs,
    apisHealthy: (apisRes.docs as Array<{ status?: string }>).filter((a) => a.status === "ativo").length,
    whatsappConnected: true,
  };

  return (
    <TvDashboardClient
      initialStatus={pendingStatus}
      initialKpis={initialKpis}
      generatedAt={new Date().toISOString()}
    />
  );
}
