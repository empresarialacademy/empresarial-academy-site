import type { AdminViewServerProps } from "payload";
import Image from "next/image";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

type SystemLinkDoc = {
  id: string | number;
  name: string;
  url?: string | null;
  description?: string | null;
  order?: number | null;
};

/**
 * "Central EA" — todos os sistemas da Empresarial Academy num só lugar
 * (site, LP, EA ADS, EA Impulsiona, EA Recovery, portal de pós-vendas,
 * playbook de vendas...). Os cards vêm da coleção `system-links`
 * (src/collections/SystemLinks.ts) — o Thiago adiciona/edita direto por lá
 * conforme cria novos sistemas, sem precisar de código novo.
 */
export async function CentralEaView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao admin.</div>;
  }

  const { docs } = await payload.find({
    collection: "system-links",
    limit: 100,
    depth: 0,
    sort: "order",
  });
  const links = docs as unknown as SystemLinkDoc[];

  return (
    <div>
      <header
        style={{
          background: NAVY,
          color: "#fff",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          borderBottom: `3px solid ${GOLD}`,
        }}
      >
        <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 56, height: "auto" }} />
        <div>
          <h1 style={{ margin: 0, color: "#fff" }}>Central EA</h1>
          <p style={{ margin: "0.25rem 0 0", color: GOLD }}>
            Todos os sistemas da Empresarial Academy, num só lugar.
          </p>
        </div>
      </header>

      <div
        style={{
          padding: "1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {links.map((link) => {
          const hasUrl = Boolean(link.url && link.url.trim());
          const cardStyle = {
            display: "block",
            textDecoration: "none",
            color: "inherit",
            background: "var(--theme-elevation-50)",
            border: "1px solid var(--theme-elevation-150)",
            borderTop: `3px solid ${hasUrl ? GOLD : "var(--theme-elevation-200)"}`,
            borderRadius: 6,
            padding: "1.1rem 1.3rem",
            opacity: hasUrl ? 1 : 0.6,
          } as const;

          const content = (
            <>
              <strong>{link.name}</strong>
              {link.description ? (
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "var(--theme-elevation-700)" }}>
                  {link.description}
                </p>
              ) : null}
              {!hasUrl ? (
                <span style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>
                  Em breve
                </span>
              ) : null}
            </>
          );

          return hasUrl ? (
            <a key={link.id} href={link.url!} target="_blank" rel="noopener noreferrer" style={cardStyle}>
              {content}
            </a>
          ) : (
            <div key={link.id} style={cardStyle}>
              {content}
            </div>
          );
        })}

        {links.length === 0 ? (
          <p>
            Nenhum sistema cadastrado ainda. Adicione em &quot;Central EA → Links de sistemas&quot;.
          </p>
        ) : null}
      </div>
    </div>
  );
}
