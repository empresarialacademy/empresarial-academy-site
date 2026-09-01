import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { getPendingStatus } from "@/lib/pending-status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getPayloadClient();

    // 1. Status de Pendências Gerais
    const pendingStatus = await getPendingStatus();

    // 2. Métricas de Leads e Diagnóstico DME
    const [leadsTotalRes, leadsRecentRes] = await Promise.all([
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
    ]);

    const totalLeads = leadsTotalRes.totalDocs;
    const recentLeads = leadsRecentRes.docs as Array<{
      score?: number | null;
      weakestPillar?: string | null;
      source?: string | null;
      createdAt: string;
    }>;
    const leadsLast7Days = leadsRecentRes.totalDocs;

    // Calcular média de score dos leads recentes
    const scores = recentLeads.map((l) => l.score).filter((s): s is number => typeof s === "number");
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 58;

    // Pilar mais fraco predominante
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

    // 3. Métricas de Contratos
    const [contractsTotalRes, contractsSignedRes] = await Promise.all([
      payload.find({ collection: "contracts", limit: 1, depth: 0 }),
      payload.find({
        collection: "contracts",
        where: { status: { equals: "assinado" } },
        limit: 10,
        sort: "-updatedAt",
        depth: 0,
      }),
    ]);

    const totalContracts = contractsTotalRes.totalDocs;
    const signedContracts = contractsSignedRes.totalDocs;

    // 4. Métricas de Inventário de APIs
    const apisRes = await payload.find({
      collection: "api-inventory",
      limit: 50,
      depth: 0,
    });
    const totalApis = apisRes.totalDocs;
    const apisHealthy = (apisRes.docs as Array<{ status?: string }>).filter((a) => a.status === "ativo").length;

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      pendingStatus,
      kpis: {
        totalAlerts:
          (pendingStatus.eaPost?.pendingApprovalCount ?? 0) +
          (pendingStatus.eaPost?.tokenAlerts?.length ?? 0) +
          (pendingStatus.eaPost?.cronAlerts?.length ?? 0) +
          pendingStatus.contractsAwaitingSignature.length +
          pendingStatus.expiringCredentials.length,
        pendingApprovals: pendingStatus.eaPost?.pendingApprovalCount ?? 0,
        contractsPending: pendingStatus.contractsAwaitingSignature.length,
        signedContracts,
        totalContracts,
        totalLeads,
        leadsLast7Days,
        avgScore,
        topBottleneck,
        totalApis,
        apisHealthy,
        whatsappConnected: true,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao carregar métricas da TV.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

