import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { EaHubBackLink } from "@/components/admin/brand/EaHubBackLink";
import { ContractGeneratorForm } from "./ContractGeneratorForm";

/**
 * View custom registrada em payload.config.ts → admin.components.views
 * (path "/contratos/novo"). Server Component: mesmo padrão de guard de
 * AdsPerformanceView.tsx (views custom não são protegidas pelo
 * redirecionamento de login padrão do Payload, então checa
 * `initPageResult.req.user` diretamente).
 *
 * Só monta o formulário (client component) — toda a lógica de campos,
 * cálculo em tempo real e chamada à API fica em ContractGeneratorForm.tsx.
 */
export async function ContractGeneratorView({ initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    redirect("/eahub/login?redirect=%2Feahub%2Fcontratos%2Fnovo");
  }

  return (
    <div className="ea-view" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <EaHubBackLink />
      <h1 style={{ marginBottom: 4 }}>Gerador de Contratos</h1>
      <p style={{ color: "var(--theme-elevation-600)", marginTop: 0, marginBottom: "1.5rem" }}>
        Preencha os dados, revise a minuta e envie para assinatura eletrônica. O texto gerado segue exatamente a
        lógica jurídica do gerador de referência.
      </p>
      <ContractGeneratorForm />
    </div>
  );
}
