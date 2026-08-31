import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { EaHubBackLink } from "@/components/admin/brand/EaHubBackLink";
import { CommercialPresentationClient } from "./CommercialPresentationClient";

/**
 * View custom registrada em payload.config.ts → admin.components.views
 * (path "/apresentacao"). Server Component: mesmo padrão de guard de
 * AdsPerformanceView.tsx e ContractGeneratorView.tsx.
 */
export async function CommercialPresentationView({ initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    redirect("/eahub/login?redirect=%2Feahub%2Fapresentacao");
  }

  return (
    <div className="ea-view" style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px" }}>
      <EaHubBackLink />
      <CommercialPresentationClient />
    </div>
  );
}
