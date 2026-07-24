'use client';
import React, { useRef, useState } from 'react';
import { useForm } from '@payloadcms/ui';

type Feedback = { kind: 'ok' | 'err'; msg: string } | null;

/**
 * Importa um arquivo .md (com YAML frontmatter) e preenche os campos do
 * Artigo/Material via /api/parse-markdown. Campos inexistentes na coleção
 * atual são ignorados pelo Payload (o mesmo botão serve Posts e Materials).
 */
export const ImportMarkdownButton = () => {
  const { dispatchFields } = useForm();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setFeedback(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-markdown', { method: 'POST', body: formData });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || `Falha ao processar o arquivo (HTTP ${response.status}).`);
      }

      const { frontmatter, lexical, error } = await response.json();
      if (error) throw new Error(error);

      const set = (path: string, value: unknown) => dispatchFields({ type: 'UPDATE', path, value });

      if (frontmatter) {
        if (frontmatter.title) set('title', frontmatter.title);
        if (frontmatter.slug) set('slug', frontmatter.slug);
        if (frontmatter.meta_description) {
          set('excerpt', frontmatter.meta_description);
          set('description', frontmatter.meta_description);
          set('seo.metaDescription', frontmatter.meta_description);
        }
        if (frontmatter.keywords) set('seo.metaKeywords', frontmatter.keywords);
        if (frontmatter.status) set('status', frontmatter.status);
        if (frontmatter.tags) {
          // Campos `array` do Payload não aceitam um UPDATE direto com o array
          // pronto — o form precisa da metadata interna `rows`, criada linha a
          // linha via ADD_ROW (sem isso, o ArrayField quebra com "Cannot read
          // properties of undefined (reading 'map')" ao tentar renderizar).
          const arr: string[] = Array.isArray(frontmatter.tags)
            ? frontmatter.tags
            : String(frontmatter.tags).split(',').map((t: string) => t.trim());
          arr.forEach((t) => {
            dispatchFields({
              type: 'ADD_ROW',
              path: 'tags',
              subFieldState: { tag: { value: t, initialValue: t, valid: true } },
            });
          });
        }
        if (frontmatter.categoryId) set('category', frontmatter.categoryId);
        if (frontmatter.authorId) set('author', frontmatter.authorId);
      }

      if (lexical) set('content', lexical);

      setFeedback({ kind: 'ok', msg: 'Conteúdo importado. Revise, adicione a capa e visualize antes de publicar.' });
    } catch (error) {
      setFeedback({ kind: 'err', msg: (error as Error).message });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 16,
        background: 'var(--theme-elevation-50)',
        borderRadius: 8,
        border: '1px solid var(--theme-elevation-150)',
        borderTop: '3px solid #C1A160',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>Importar de arquivo .md</strong>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--theme-elevation-600)' }}>
        Selecione um arquivo <code>.md</code> (com frontmatter YAML). Título, resumo, SEO, tags e o
        conteúdo são preenchidos automaticamente. A capa e o arquivo para download você adiciona nos
        campos abaixo.
      </p>
      <input
        type="file"
        accept=".md,text/markdown"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
        id="import-markdown-file"
      />
      <label
        htmlFor="import-markdown-file"
        style={{
          cursor: loading ? 'wait' : 'pointer',
          background: loading ? 'var(--theme-elevation-300)' : '#1D2B3C',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 4,
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {loading ? 'Importando…' : 'Carregar arquivo .md'}
      </label>
      {feedback && (
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 13,
            color: feedback.kind === 'ok' ? 'var(--theme-success-600)' : 'var(--theme-error-600)',
          }}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
};
