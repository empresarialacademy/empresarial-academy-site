import { NextResponse } from "next/server";
import matter from "gray-matter";
import { getPayloadClient } from "@/lib/payload";
import { convertMarkdownToLexical, defaultEditorConfig } from "@payloadcms/richtext-lexical";

/**
 * Importador de conteúdo `.md` para o EA HUB. Recebe um arquivo Markdown com
 * YAML frontmatter e devolve `{ frontmatter, lexical }` para o
 * ImportMarkdownButton preencher os campos do Artigo/Material no admin.
 *
 * O corpo é convertido para Lexical com `defaultEditorConfig` — gera só nós
 * padrão (parágrafos, títulos, listas, negrito, links), 100% compatíveis com
 * o editor EA (que apenas ADICIONA barra fixa + paleta de cor/tamanho; a
 * paleta é aplicada à mão, nunca vem do markdown). Acesso restrito a usuários
 * autenticados do admin.
 */
export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient();

    // Só usuários autenticados do admin podem importar.
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const text = await file.text();
    const { data: frontmatter, content } = matter(text);

    // Resolve relacionamentos por nome/título.
    if (frontmatter.category) {
      const catRes = await payload.find({
        collection: "categories",
        where: { title: { equals: frontmatter.category } },
        limit: 1,
      });
      if (catRes.docs.length > 0) frontmatter.categoryId = catRes.docs[0].id;
    }
    if (frontmatter.author) {
      const authorRes = await payload.find({
        collection: "users",
        where: { name: { equals: frontmatter.author } },
        limit: 1,
      });
      if (authorRes.docs.length > 0) frontmatter.authorId = authorRes.docs[0].id;
    }

    const lexicalState = convertMarkdownToLexical({
      // @ts-expect-error - Payload 3.85 typings pedem SanitizedServerEditorConfig; defaultEditorConfig é ServerEditorConfig e funciona.
      editorConfig: defaultEditorConfig,
      markdown: content,
    });

    return NextResponse.json({ frontmatter, lexical: lexicalState });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erro ao fazer parse do markdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
