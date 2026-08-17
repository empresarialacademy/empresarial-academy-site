import Link from "next/link";

/**
 * Link injetado após o menu nativo do EA HUB (via admin.components.afterNavLinks
 * em payload.config.ts) para o Gerador de Contratos. Mesmo padrão de
 * EaMarketingManagerNavLink.tsx — views custom não entram em nenhum grupo do
 * menu automaticamente.
 */
export function ContractGeneratorNavLink() {
  return (
    <div style={{ padding: "0 var(--base, 20px) calc(var(--base, 20px) / 2)" }}>
      <Link
        href="/eahub/contratos/novo"
        className="nav__link"
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        Gerador de Contratos
      </Link>
    </div>
  );
}
