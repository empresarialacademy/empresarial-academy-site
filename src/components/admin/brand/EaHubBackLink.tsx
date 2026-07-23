import Link from "next/link";

/**
 * Link de retorno ao EA HUB para as views custom em tela cheia
 * (marketing-manager, ads-performance). Essas views NÃO renderizam a barra
 * de navegação lateral do Payload, então sem este link o único caminho de
 * volta seria o botão do navegador. `href` default = home do EA HUB.
 */
export function EaHubBackLink({
  href = "/eahub",
  label = "Voltar ao EA HUB",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.85rem",
        fontWeight: 600,
        textDecoration: "none",
        color: "var(--theme-elevation-600, #5b626e)",
        marginBottom: "1rem",
      }}
    >
      <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>←</span>
      {label}
    </Link>
  );
}
