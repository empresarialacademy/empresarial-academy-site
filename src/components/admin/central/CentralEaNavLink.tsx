import Link from "next/link";

/**
 * Link injetado após o menu nativo do /admin (via admin.components.afterNavLinks
 * em payload.config.ts) para a "Central EA" — hub de todos os sistemas.
 */
export function CentralEaNavLink() {
  return (
    <div style={{ padding: "0 var(--base, 20px) calc(var(--base, 20px) / 2)" }}>
      <Link
        href="/admin/central-ea"
        className="nav__link"
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        Central EA
      </Link>
    </div>
  );
}
