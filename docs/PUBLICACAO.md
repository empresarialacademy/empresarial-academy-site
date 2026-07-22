# Checklist de Publicação (Go-Live) — Empresarial Academy

Guia para colocar o site no ar com segurança e performance de produção.

## 1. Infraestrutura e hospedagem
- [ ] **Mover o projeto para fora do OneDrive** (ou pausar a sincronização). O OneDrive desidrata binários nativos (sharp) e deixa o build lento/instável.
- [ ] Hospedar em ambiente **Node** (Vercel recomendado, ou VPS Linux). Não usar hospedagem PHP compartilhada.
- [ ] Em hospedagem Linux/Vercel o **otimizador de imagem do Next** (webp/avif) funciona — a Performance sobe para 90+. Garantir `sharp` instalado.

## 2. Banco de dados (SQLite → PostgreSQL)
- [ ] Criar um **PostgreSQL gerenciado** (Neon, Supabase ou similar).
- [ ] Trocar o adapter em `src/payload.config.ts` de `@payloadcms/db-sqlite` para `@payloadcms/db-postgres`.
- [ ] Definir `DATABASE_URI` com a connection string do Postgres.
- [ ] Gerar e rodar **migrations** do Payload (`payload migrate:create` + `payload migrate`) — produção não faz `push` automático.

## 3. Variáveis de ambiente
- [ ] `PAYLOAD_SECRET` — segredo forte e único (não reutilizar o de dev).
- [ ] `DATABASE_URI` — Postgres de produção.
- [ ] Chaves do provedor de e-mail e de storage (itens 4 e 5).
- [ ] `NODE_ENV=production`.

## 4. E-mail (formulário de contato)
- [ ] Configurar um **email adapter** no Payload (ex.: `@payloadcms/email-resend` ou SMTP). Hoje o e-mail só é registrado no console.
- [ ] Conectar o endpoint `src/app/api/contato/route.ts` ao provedor (há um `TODO` marcado) e/ou a um **CRM** (RD Station, ActiveCampaign).
- [ ] Testar recebimento real de um lead.

## 5. Armazenamento de mídia (uploads)
- [ ] Em serverless, o sistema de arquivos é efêmero. Configurar um **storage adapter** (S3 / Cloudflare R2) para `media` e `material-files` (`@payloadcms/storage-s3`).
- [ ] Migrar os uploads existentes (se houver) para o bucket.

## 6. Domínio e SEO
- [ ] Definir o domínio oficial e atualizar `siteConfig.url` em `src/lib/site-config.ts`.
- [ ] Decidir `.com` vs `.com.br` e configurar **redirect 301** do secundário para o principal (canonical único).
- [ ] Verificar `sitemap.xml` e `robots.txt` no domínio real.
- [ ] **Google Search Console**: adicionar a propriedade e enviar o sitemap.
- [ ] Confirmar Open Graph/Twitter (a imagem OG é gerada automaticamente).

## 7. Analytics e consentimento
- [ ] Adicionar **GA4** (ou Plausible) e o **Search Console**.
- [ ] Se usar cookies de analytics, incluir **banner de consentimento (LGPD)** e a página de cookies.

## 8. Conteúdo real (substituir os exemplos)
- [ ] Criar o **usuário admin** em `/admin` (primeiro acesso).
- [ ] **Substituir o material de exemplo** "Guia Rápido" pelo arquivo real (PDF/planilha) — hoje é um placeholder de imagem.
- [ ] Publicar **artigos** reais no Blog (apagar o post de exemplo, se houver).
- [ ] Cadastrar **depoimentos** reais (marcar "Destaque" para a Home).
- [ ] Subir **fotos reais** (fundador/equipe) e, se desejar, imagens novas sem texto em inglês.
- [ ] Conferir telefone, e-mail e redes sociais.

## 9. Segurança
- [ ] HTTPS (TLS) ativo no domínio.
- [ ] Headers de segurança já configurados em `next.config.ts` (revisar em produção).
- [ ] Rate limiting / proteção anti-bot adicional no formulário (já há honeypot + validação server-side).
- [ ] Backups automáticos do banco.

## 10. QA final (pré-lançamento)
- [ ] Lighthouse no **domínio de produção** (meta: Performance 90+, A11y/BP/SEO 100). Local: 85/100/100/100.
- [ ] Testar formulários (envio, validação, LGPD).
- [ ] Navegação em **mobile, tablet e desktop**.
- [ ] **Cross-browser**: Chrome, Edge, Firefox, Safari.
- [ ] Verificar 404, busca, downloads (contador) e RSS.
- [ ] Revisar Política de Privacidade e Termos com o jurídico.

---

## Status atual do projeto (local)
- ✅ Sprints 0–7 implementados: fundação, layout, páginas institucionais, Blog (CMS), Central de Downloads (CMS), Depoimentos/FAQ/Busca/Legais, SEO/Perf/A11y, testes.
- ✅ Lighthouse (mobile, local): **Performance 85 · Acessibilidade 100 · Best Practices 100 · SEO 100**.
- ✅ Links internos: sem quebras. Formulário de contato: validação server-side OK.
- ⏳ Pendências de produção: itens 1–9 acima (infra, banco, e-mail, storage, domínio, conteúdo real).
