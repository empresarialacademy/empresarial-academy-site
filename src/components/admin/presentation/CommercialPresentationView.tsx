import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { EaHubBackLink } from "@/components/admin/brand/EaHubBackLink";
import { CommercialPresentationClient } from "./CommercialPresentationClient";
import React, { Suspense } from "react";

/**
 * View custom registrada em payload.config.ts → admin.components.views
 * (path "/apresentacao"). Server Component: mesmo padrão de guard de
 * AdsPerformanceView.tsx e ContractGeneratorView.tsx.
 */
export async function CommercialPresentationView({
  initPageResult,
  searchParams,
}: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    redirect("/eahub/login?redirect=%2Feahub%2Fapresentacao");
  }

  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const initialId = typeof resolvedParams?.id === "string" ? resolvedParams.id : undefined;

  return (
    <div className="ea-view" style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px" }}>
      <EaHubBackLink />
      <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#C1A160", fontWeight: 700 }}>Carregando Apresentador Comercial...</div>}>
        <CommercialPresentationClient initialId={initialId} />
      </Suspense>
    </div>
  );
}
