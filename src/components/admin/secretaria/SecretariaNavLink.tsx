import Link from "next/link";

/**
 * Link para a Secretária Virtual no menu lateral do EA HUB (/eahub).
 */
export function SecretariaNavLink() {
  return (
    <div style={{ padding: "0 var(--base, 20px) calc(var(--base, 20px) / 2)" }}>
      <Link
        href="/eahub/secretaria"
        className="nav__link"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span style={{ fontSize: "14px" }}>🤖</span>
        <span>EA Assessor</span>
      </Link>
    </div>
  );
}
