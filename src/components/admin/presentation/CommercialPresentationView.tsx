import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 16px" }}>
      <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#C99A3E", fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Carregando Apresentador Comercial...</div>}>
        <CommercialPresentationClient initialId={initialId} />
      </Suspense>
    </div>
  );
}
