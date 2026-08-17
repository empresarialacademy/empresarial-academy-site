import type { ListViewServerProps } from "payload";
import Link from "next/link";
import Image from "next/image";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

const PHASE_ORDER = ["prep", "semana-1", "semana-2", "semana-3", "semana-4"] as const;
const PHASE_LABEL: Record<string, string> = {
  prep: "Preparação · 17 a 23/08",
  "semana-1": "Semana 1 · Lançamento · 24 a 30/08",
  "semana-2": "Semana 2 · 31/08 a 06/09",
  "semana-3": "Semana 3 · 07 a 13/09",
  "semana-4": "Semana 4 · 14 a 20/09",
};

const PILLAR_LABEL: Record<string, string> = {
  preparacao: "Preparação",
  lancamento: "Lançamento",
  gestao: "Gestão",
  vendas: "Vendas",
  lideranca: "Liderança",
};
const PILLAR_COLOR: Record<string, { bg: string; fg: string }> = {
  preparacao: { bg: "rgba(107,114,128,0.14)", fg: "#4B5563" },
  lancamento: { bg: "rgba(193,161,96,0.18)", fg: "#8A6D31" },
  gestao: { bg: "rgba(29,43,60,0.10)", fg: NAVY },
  vendas: { bg: "rgba(62,92,118,0.12)", fg: "#3E5C76" },
  lideranca: { bg: "rgba(140,122,91,0.16)", fg: "#6E5E43" },
};

const CHANNEL_LABEL: Record<string, string> = {
  "ig-feed": "IG Feed",
  "ig-reels": "IG Reels",
  "ig-stories": "IG Stories",
  facebook: "Facebook",
  "li-post": "LI Post",
  "li-artigo": "LI Artigo",
  "yt-shorts": "YT Shorts",
  "yt-video": "YT Vídeo",
};

const STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  "em-producao": "Em produção",
  concluido: "Concluído",
};
const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  planejado: { bg: "var(--theme-elevation-100)", fg: "var(--theme-elevation-600)" },
  "em-producao": { bg: "rgba(199,137,43,0.16)", fg: "#8A5F1E" },
  concluido: { bg: "rgba(46,125,91,0.16)", fg: "#2E7D5B" },
};

type Entry = {
  id: string | number;
  date: string;
  phase: string;
  pillar: string;
  channels?: string[] | null;
  format?: string | null;
  theme: string;
  sourceLabel?: string | null;
  copyIdea?: string | null;
  ctaOrAction?: string | null;
  status: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short", timeZone: "UTC" });
}

/**
 * List view custom da coleção `content-calendar`: agrupa os itens por semana
 * (campo `phase`) e apresenta como um relatório navy/dourado, no mesmo padrão
 * visual do SystemLinksListView e do EA Marketing Manager. Substitui a tabela
 * padrão do Payload porque a leitura por semana é o formato que o Thiago usa
 * pra planejar (mesma estrutura do calendário entregue em 17/08/2026).
 */
export async function ContentCalendarListView(props: ListViewServerProps) {
  const { payload, collectionSlug, newDocumentURL } = props as ListViewServerProps & {
    newDocumentURL?: string;
  };

  const { docs } = await payload.find({
    collection: "content-calendar",
    limit: 500,
    depth: 0,
    sort: "date",
  });
  const entries = docs as unknown as Entry[];

  const adminRoute = "/eahub";
  const createUrl = newDocumentURL || `${adminRoute}/collections/${collectionSlug}/create`;

  const byPhase = new Map<string, Entry[]>();
  for (const entry of entries) {
    const list = byPhase.get(entry.phase) ?? [];
    list.push(entry);
    byPhase.set(entry.phase, list);
  }

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
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 44, height: "auto" }} />
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>Calendário de Conteúdo</h1>
            <p style={{ margin: "0.2rem 0 0", color: GOLD, fontSize: "0.85rem" }}>
              Instagram, Facebook, YouTube e LinkedIn — lançamento do site e reaproveitamento de blog/materiais.
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
          + Adicionar item
        </Link>
      </header>

      {entries.length === 0 ? (
        <p>Nenhum item cadastrado ainda. Use &quot;Adicionar item&quot;.</p>
      ) : (
        PHASE_ORDER.filter((phase) => byPhase.has(phase)).map((phase) => (
          <section key={phase} style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--theme-elevation-600)",
                borderBottom: "1px solid var(--theme-elevation-150)",
                paddingBottom: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {PHASE_LABEL[phase] ?? phase}
            </h2>
            <div style={{ overflowX: "auto", border: "1px solid var(--theme-elevation-150)", borderRadius: 6 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 820 }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    {["Data", "Pilar", "Canais", "Tema / fonte", "CTA", "Status", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "0.6rem 0.9rem",
                          color: "#F4F1E9",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(byPhase.get(phase) ?? []).map((entry, i) => {
                    const pillar = PILLAR_COLOR[entry.pillar] ?? PILLAR_COLOR.preparacao;
                    const status = STATUS_COLOR[entry.status] ?? STATUS_COLOR.planejado;
                    const editUrl = `${adminRoute}/collections/content-calendar/${entry.id}`;
                    return (
                      <tr
                        key={entry.id}
                        style={{
                          background: i % 2 === 1 ? "var(--theme-elevation-50)" : "transparent",
                          borderTop: "1px solid var(--theme-elevation-150)",
                        }}
                      >
                        <td style={{ padding: "0.6rem 0.9rem", whiteSpace: "nowrap", color: "var(--theme-elevation-700)" }}>
                          {formatDate(entry.date)}
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.5rem",
                              borderRadius: 4,
                              background: pillar.bg,
                              color: pillar.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {PILLAR_LABEL[entry.pillar] ?? entry.pillar}
                          </span>
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "var(--theme-elevation-700)" }}>
                          {(entry.channels ?? []).map((c) => CHANNEL_LABEL[c] ?? c).join(" · ")}
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem", maxWidth: 320 }}>
                          <div style={{ fontWeight: 600 }}>{entry.theme}</div>
                          {entry.sourceLabel ? (
                            <div style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)", marginTop: 2 }}>
                              {entry.sourceLabel}
                            </div>
                          ) : null}
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "var(--theme-elevation-700)" }}>
                          {entry.ctaOrAction ?? ""}
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.5rem",
                              borderRadius: 4,
                              background: status.bg,
                              color: status.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {STATUS_LABEL[entry.status] ?? entry.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.6rem 0.9rem" }}>
                          <Link href={editUrl} style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
