'use client';
import React, { useRef, useState } from 'react';
import { useForm } from '@payloadcms/ui';

export const ImportMarkdownButton = () => {
  const { dispatchFields } = useForm();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/dev/parse-markdown', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao processar o arquivo Markdown. Status: ' + response.status);
      }

      const { frontmatter, lexical, error } = await response.json();
      
      if (error) {
         throw new Error(error);
      }

      // Preenche o Frontmatter
      if (frontmatter) {
        if (frontmatter.title) dispatchFields({ type: 'UPDATE', path: 'title', value: frontmatter.title });
        if (frontmatter.slug) dispatchFields({ type: 'UPDATE', path: 'slug', value: frontmatter.slug });
        
        // meta_description preenche o excerpt (resumo) e o SEO Meta Description
        if (frontmatter.meta_description) {
          dispatchFields({ type: 'UPDATE', path: 'excerpt', value: frontmatter.meta_description });
          dispatchFields({ type: 'UPDATE', path: 'seo.metaDescription', value: frontmatter.meta_description });
        }
        
        // keywords
        if (frontmatter.keywords) dispatchFields({ type: 'UPDATE', path: 'seo.metaKeywords', value: frontmatter.keywords });
        
        if (frontmatter.status) dispatchFields({ type: 'UPDATE', path: 'status', value: frontmatter.status });
        
        // Arrays de Tags (se não for string, converte. Se for string, separa)
        if (frontmatter.tags) {
          const tagsArray = Array.isArray(frontmatter.tags) ? frontmatter.tags : frontmatter.tags.split(',').map((t: string) => t.trim());
          const formattedTags = tagsArray.map((t: string) => ({ tag: t, id: Math.random().toString(36).substring(7) }));
          dispatchFields({ type: 'UPDATE', path: 'tags', value: formattedTags });
        }

        // Relacionamentos resolvidos no backend
        if (frontmatter.categoryId) dispatchFields({ type: 'UPDATE', path: 'category', value: frontmatter.categoryId });
        if (frontmatter.authorId) dispatchFields({ type: 'UPDATE', path: 'author', value: frontmatter.authorId });
      }

      // Preenche o conteúdo Rico
      if (lexical) {
        dispatchFields({ type: 'UPDATE', path: 'content', value: lexical });
      }

      alert('Metadados e Conteúdo importados com sucesso!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      alert('Erro ao importar o Markdown: ' + error.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px', border: '1px solid #cce0ff' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#004aad' }}>🤖 Assistente IA: Importador de Conteúdo</h4>
      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
        Selecione o arquivo <code>.md</code> gerado pela IA (com YAML Frontmatter). Nós extrairemos os metadados e o conteúdo Lexical.
      </p>
      <input 
        type="file" 
        accept=".md" 
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
        id="import-markdown-file"
      />
      <label 
        htmlFor="import-markdown-file" 
        style={{
          cursor: loading ? 'wait' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#D4AF37', // EA Gold
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        {loading ? 'Importando...' : 'Carregar Arquivo .md'}
      </label>
    </div>
  );
};
