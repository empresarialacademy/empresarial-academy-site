import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { getPayloadClient } from '@/lib/payload';
import { convertMarkdownToLexical, defaultEditorConfig } from '@payloadcms/richtext-lexical';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const text = await file.text();
    
    // Separa o frontmatter do conteúdo
    const { data: frontmatter, content } = matter(text);

    // Resolver Relacionamentos no Payload
    const payload = await getPayloadClient();
    
    if (frontmatter.category) {
      const catRes = await payload.find({ 
        collection: 'categories', 
        where: { title: { equals: frontmatter.category } }, 
        limit: 1 
      });
      if (catRes.docs.length > 0) frontmatter.categoryId = catRes.docs[0].id;
    }

    if (frontmatter.author) {
      const authorRes = await payload.find({ 
        collection: 'users', 
        where: { name: { equals: frontmatter.author } }, 
        limit: 1 
      });
      if (authorRes.docs.length > 0) frontmatter.authorId = authorRes.docs[0].id;
    }

    // Converte o Markdown restante para Lexical JSON
    const lexicalState = convertMarkdownToLexical({
      // @ts-expect-error - Payload 3.85 typings require SanitizedServerEditorConfig but defaultEditorConfig is ServerEditorConfig
      editorConfig: defaultEditorConfig,
      markdown: content,
    });

    return NextResponse.json({
      frontmatter,
      lexical: lexicalState,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Erro ao fazer parse do markdown:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
