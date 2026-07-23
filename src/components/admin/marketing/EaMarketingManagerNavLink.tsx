import Link from "next/link";

/**
 * Link injetado após o menu nativo do /admin (via admin.components.afterNavLinks
 * em payload.config.ts) para o hub "EA Marketing Manager". Views custom não
 * entram em nenhum grupo do menu automaticamente — o Payload só agrupa
 * coleções/globals pelo próprio `admin.group`.
 */
export function EaMarketingManagerNavLink() {
  return (
    <div style={{ padding: "0 var(--base, 20px) calc(var(--base, 20px) / 2)" }}>
      <Link
        href="/admin/marketing-manager"
        className="nav__link"
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        EA Marketing Manager
      </Link>
    </div>
  );
}
