import type { ListViewServerProps } from "payload";
import Link from "next/link";
import Image from "next/image";
import { DeleteLinkButton } from "./DeleteLinkButton";
import { isBasicAuthProtectedPath } from "@/lib/basic-auth-protected-paths";

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
 * List view custom da coleção `system-links` (registrada em
 * admin.components.views.list): apresenta os sistemas da EA como um portfólio
 * de cartões — é o "cartão de visita" da empresa. Adicionar usa o formulário
 * nativo de criação; editar abre o registro; remover é inline (DeleteLinkButton).
 */
export async function SystemLinksListView(props: ListViewServerProps) {
  const { payload, data, collectionSlug, newDocumentURL } = props as ListViewServerProps & {
    newDocumentURL?: string;
  };

  // `data.docs` já vem paginado; para o portfólio (poucos itens) buscamos todos ordenados.
  const { docs } = await payload.find({
    collection: "system-links",
    limit: 200,
    depth: 0,
    sort: "order",
  });
  const links = (docs as unknown as SystemLinkDoc[]) ?? ((data?.docs as unknown as SystemLinkDoc[]) || []);

  const adminRoute = "/eahub";
  const createUrl = newDocumentURL || `${adminRoute}/collections/${collectionSlug}/create`;

  return (
    <div style={{ padding: "1.5rem 2rem" }}>
      <header
        style={{
          background: NAVY,
          color: "#fff",
          padding: "1.5rem 1.75rem",
          borderRadius: 8,
          borderBottom: `3px solid ${GOLD}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 44, height: "auto" }} />
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>Sistemas EA</h1>
            <p style={{ margin: "0.2rem 0 0", color: GOLD, fontSize: "0.85rem" }}>
              O portfólio de sistemas e plataformas da Empresarial Academy.
            </p>
          </div>
        </div>
        <Link
          href={createUrl}
          style={{
            background: GOLD,
            color: NAVY,
            fontWeight: 600,
            textDecoration: "none",
            padding: "0.6rem 1rem",
            borderRadius: 6,
            whiteSpace: "nowrap",
          }}
        >
          + Adicionar sistema
        </Link>
      </header>

      {links.length === 0 ? (
        <p>Nenhum sistema cadastrado ainda. Use &quot;Adicionar sistema&quot;.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {links.map((link) => {
            const url = (link.url ?? "").trim();
            const isExternal = /^https?:\/\//.test(url);
            const editUrl = `${adminRoute}/collections/${collectionSlug}/${link.id}`;
            return (
              <div
                key={link.id}
                style={{
                  background: "var(--theme-elevation-50)",
                  border: "1px solid var(--theme-elevation-150)",
                  borderTop: `3px solid ${url ? GOLD : "var(--theme-elevation-200)"}`,
                  borderRadius: 8,
                  padding: "1.1rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  opacity: url ? 1 : 0.7,
                }}
              >
                <strong style={{ fontSize: "1rem" }}>{link.name}</strong>
                {link.description ? (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--theme-elevation-700)" }}>
                    {link.description}
                  </p>
                ) : null}
                {url ? (
                  <code style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)", wordBreak: "break-all" }}>{url}</code>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>Em breve (sem link)</span>
                )}

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem", flexWrap: "wrap" }}>
                  {url ? (
                    isExternal ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--theme-text)" }}
                      >
                        Abrir ↗
                      </a>
                    ) : (
                      <Link
                        href={url}
                        style={{ fontSize: "0.8rem", fontWeight: 600 }}
                        prefetch={isBasicAuthProtectedPath(url) ? false : undefined}
                      >
                        Abrir
                      </Link>
                    )
                  ) : null}
                  <Link href={editUrl} style={{ fontSize: "0.8rem" }}>
                    Editar
                  </Link>
                  <span style={{ marginLeft: "auto" }}>
                    <DeleteLinkButton id={link.id} name={link.name} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
