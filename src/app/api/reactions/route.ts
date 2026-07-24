import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

type VoteState = "like" | "dislike" | null;
type ReactableCollection = "posts" | "materials";

const REACTABLE_COLLECTIONS: ReactableCollection[] = ["posts", "materials"];

function isVoteState(v: unknown): v is VoteState {
  return v === "like" || v === "dislike" || v === null;
}

/**
 * Registra curtir/não curtir de Artigos e Materiais. O navegador do
 * visitante controla o próprio voto atual (localStorage, 1 voto por
 * navegador — ver `LikeDislike.tsx`) e manda a transição (`from` → `to`);
 * aqui só aplicamos o delta nos contadores. Sem autenticação — ação pública.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collection, slug, from, to } = body as {
      collection?: string;
      slug?: string;
      from?: unknown;
      to?: unknown;
    };

    if (
      !collection ||
      !REACTABLE_COLLECTIONS.includes(collection as ReactableCollection) ||
      !slug ||
      typeof slug !== "string" ||
      !isVoteState(from) ||
      !isVoteState(to) ||
      from === to
    ) {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: collection as ReactableCollection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const doc = docs[0] as { id: string | number; likes?: number; dislikes?: number } | undefined;
    if (!doc) {
      return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
    }

    const likeDelta = (to === "like" ? 1 : 0) - (from === "like" ? 1 : 0);
    const dislikeDelta = (to === "dislike" ? 1 : 0) - (from === "dislike" ? 1 : 0);
    const likes = Math.max(0, (doc.likes ?? 0) + likeDelta);
    const dislikes = Math.max(0, (doc.dislikes ?? 0) + dislikeDelta);

    // UPDATE direto no banco (em vez de `payload.update`): artigos/materiais
    // antigos, publicados antes da regra "obrigatório só ao publicar" (capa/
    // tags), não têm esses campos preenchidos — `payload.update` revalida o
    // documento inteiro e rejeitaria esse voto por causa deles. Like/dislike
    // é só um contador público, não precisa (nem deve) passar por essa
    // validação de conteúdo.
    const pool = (payload.db as { pool?: { query: (sql: string, params: unknown[]) => Promise<unknown> } }).pool;
    if (!pool) throw new Error("Pool do Postgres indisponível.");
    await pool.query(`UPDATE ${collection} SET likes = $1, dislikes = $2 WHERE id = $3`, [
      likes,
      dislikes,
      doc.id,
    ]);

    return NextResponse.json({ likes, dislikes });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("[reactions] falha ao registrar voto:", error);
    return NextResponse.json({ error: "Falha ao registrar voto." }, { status: 500 });
  }
}
