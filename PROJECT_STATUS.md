> ⚠️ **PROJETO MOVIDO (2026-07-01):** o código agora vive em `C:\dev\empresarial-academy-site\` (fora do OneDrive, que travava os builds). Esta pasta é um backup congelado — **não editar aqui**. O PROJECT_STATUS.md atualizado está na nova pasta.

# PROJECT_STATUS.md — Memória Oficial do Projeto

> **Como usar (novo chat):** "Leia integralmente o arquivo `PROJECT_STATUS.md`, compreenda o estado atual do projeto e continue o desenvolvimento exatamente do ponto onde ele foi interrompido, respeitando toda a arquitetura, padrões de código, decisões técnicas e objetivos documentados."
>
> **Regra:** este arquivo é atualizado ao final de cada tarefa relevante. Nunca remover histórico — apenas acrescentar/atualizar. Deve refletir o estado real do projeto.

---

## 1. Informações do Projeto

| Item | Valor |
|---|---|
| **Nome** | Site institucional Empresarial Academy |
| **Pasta do código** | `Projeto IA/empresarial-academy-site/` |
| **Objetivo** | Reconstrução premium (do zero) do site da Empresarial Academy, com CMS administrável, mobile-first, SEO avançado e otimização para IAs |
| **Framework** | Next.js (App Router) |
| **Versão Next** | `~15.4.11` (fixado — Payload 3.85 exige `>=15.4.11 <15.5`; **não subir para 15.5+** sem checar peer) |
| **Linguagem** | TypeScript 5.7 |
| **UI** | React 19 + Tailwind CSS 4 |
| **CMS** | Payload CMS 3.85 (admin em `/admin`) |
| **Banco (dev)** | SQLite (`empresarial-academy.db`) — migrar p/ PostgreSQL na produção |
| **Node** | Ambiente roda Node 24 (ver §15 — armadilhas) |
| **Domínio oficial** | `empresarialacademy.com` (**.com** confirmado pelo cliente) |
| **Como rodar** | `npm install` → `npm run dev` (porta 3000) ou `npm run build && npx next start -p 3100` |
| **Cliente / Fundador** | Thiago Marchi |

---

## 2. Objetivo Geral

Reconstruir o site da **Empresarial Academy** (educação corporativa + consultoria/mentoria para PMEs) como uma plataforma premium, que transmita autoridade, confiança e profissionalismo. O site deve:

- Apresentar a marca e a proposta de valor ("Conhecimento que Impulsiona").
- Gerar e capturar **leads qualificados** (e-mail, WhatsApp, Instagram) via formulários e pop-up.
- Oferecer **conteúdo gratuito** (Blog e Central de Materiais) administrável por leigos (CMS).
- Conduzir o visitante por um funil que culmina em mentorias, curso, palestras, consultoria e livro.
- Ser **mobile-first**, rápido, acessível (WCAG) e altamente compreensível por buscadores **e** assistentes de IA (ChatGPT, Claude, Gemini, Perplexity, Copilot).

Produtos/serviços: **Curso Gestão 360** (carro-chefe, 6 pilares), **Mentorias**, **Palestras**, **Consultoria**, **Livro Gestão 360** (em breve), **E-books/Materiais**.

---

## 3. Arquitetura

### Estrutura de pastas (resumo)
```
empresarial-academy-site/
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/            # SITE PÚBLICO — tem o próprio root layout (html/body, Header, Footer)
│  │  │  ├─ layout.tsx          # fontes (next/font), metadata global, JSON-LD Organization+WebSite, Header/Footer/WhatsApp/BackToTop/CapturePopup
│  │  │  ├─ globals.css         # Tailwind 4 @theme (design tokens) + estilos prose-ea + a11y
│  │  │  ├─ page.tsx            # HOME (async; carrossel, produtos, sobre, serviços, materiais, blog, youtube, instagram, CTA)
│  │  │  ├─ institucional/page.tsx
│  │  │  ├─ servicos/page.tsx + curso-gestao-360 / mentorias / palestras / consultoria
│  │  │  ├─ livro-gestao-360/page.tsx
│  │  │  ├─ materiais/page.tsx + [slug]/page.tsx
│  │  │  ├─ blog/page.tsx + [slug]/page.tsx + rss.xml/route.ts
│  │  │  ├─ depoimentos/ faq/ busca/ mapa-do-site/ contato/ privacidade/ termos/
│  │  │  └─ not-found.tsx
│  │  ├─ (payload)/             # PAINEL ADMIN — root layout próprio do Payload (NÃO há app/layout.tsx raiz)
│  │  │  ├─ layout.tsx
│  │  │  ├─ admin/[[...segments]]/page.tsx + not-found.tsx + importMap.js (auto-gerado)
│  │  │  └─ api/[...slug]/route.ts + graphql + graphql-playground
│  │  ├─ api/
│  │  │  ├─ contato/route.ts    # POST → valida + sendLeadEmail
│  │  │  └─ newsletter/route.ts # POST → valida + sendLeadEmail (usado por NewsletterForm, CapturePopup, DownloadButton)
│  │  ├─ baixar/[slug]/route.ts # incrementa contador de downloads e redireciona ao arquivo
│  │  ├─ sitemap.ts             # sitemap dinâmico (rotas + posts)
│  │  ├─ robots.ts              # robots com liberação explícita de crawlers de IA
│  │  ├─ manifest.ts            # PWA manifest
│  │  ├─ llms.txt/route.ts      # descrição do site para IAs (LLMO)
│  │  └─ icon.png               # favicon (a partir do logo)
│  ├─ collections/              # Coleções do Payload (Posts, Categories, Materials, MaterialCategories, MaterialFiles, Testimonials, Media, Users)
│  ├─ components/               # ui/, layout/, blog/, materials/, forms/ + ServiceDetail, HeroCarousel, InstagramFeed, TestimonialCard, CapturePopup
│  ├─ design-system/tokens.ts   # tokens em TS (espelham o @theme)
│  ├─ lib/                      # site-config, content, payload, email, instagram, youtube, legal, materials, slug, format, utils
│  ├─ payload.config.ts         # config do Payload (coleções, sqlite adapter, lexical, sharp)
│  └─ payload-types.ts          # tipos gerados (ver §15 para como regenerar)
├─ public/                      # logo, /images (otimizadas), /uploads (gitignored, mídia do CMS)
├─ docs/PUBLICACAO.md           # checklist de go-live
├─ .env.example                 # template de variáveis
├─ .env / .env.local            # segredos (gitignored)
├─ next.config.ts               # withPayload + headers de segurança + image formats
└─ PROJECT_STATUS.md            # este arquivo
```

### Decisões de arquitetura
- **Dois route groups sem root layout raiz:** `(frontend)` (site) e `(payload)` (admin), cada um com seu `<html>`. Não existe `app/layout.tsx` na raiz. `api/`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `llms.txt`, `icon.png` ficam na raiz de `app/` (não precisam de layout).
- **Server Components por padrão**; client components apenas onde há interatividade (Header menu, carrossel, formulários, pop-up, FAQ, BackToTop, DownloadButton).
- **ISR** nas páginas com conteúdo do CMS (`revalidate = 60`): Home, /blog, /materiais, /depoimentos; e fetch externo com `revalidate` (YouTube 3600s, Instagram/Behold 3600s).
- **Local API do Payload** (`getPayloadClient()` em `src/lib/payload.ts`) para ler/escrever no banco a partir de Server Components e route handlers.
- **Hooks:** não há custom hooks no momento (lógica de UI fica nos próprios client components).
- **Serviços/integrações:** isolados em `src/lib/` (email, instagram, youtube, payload).

---

## 4. Funcionalidades implementadas

| Funcionalidade | Status | Arquivos principais | Observações |
|---|---|---|---|
| Layout global (Header c/ mega menu + menu mobile + busca, Footer, WhatsApp flutuante, voltar-ao-topo, skip-link) | ✅ | `components/layout/*`, `(frontend)/layout.tsx` | aria-current na nav |
| Home (carrossel 5 banners, nºs, produtos, sobre, serviços, materiais, blog, YouTube, Instagram, CTA) | ✅ | `(frontend)/page.tsx`, `HeroCarousel.tsx` | async/ISR |
| Institucional (história, missão/visão/valores, fundador, por que confiar, conquistas) + Person schema | ✅ | `(frontend)/institucional/page.tsx`, `lib/content.ts` | |
| Serviços (hub) + 4 páginas (Curso, Mentorias, Palestras, Consultoria) | ✅ | `servicos/*`, `ServiceDetail.tsx` | Course/Service/FAQ schema |
| Livro Gestão 360 + Book schema | ✅ | `livro-gestao-360/page.tsx` | "em breve" |
| Blog (CMS, lista, artigo, RSS) | ✅ | `blog/*`, `collections/Posts.ts` | Article + FAQ schema |
| Central de Materiais (CMS, lista+filtro+busca, detalhe, contador, captura antes do download) | ✅ | `materiais/*`, `collections/Materials*`, `DownloadButton.tsx`, `baixar/[slug]/route.ts` | |
| Depoimentos (CMS) | ✅ estrutura | `depoimentos/page.tsx`, `collections/Testimonials.ts` | sem conteúdo (ver §12) |
| FAQ + Mapa do Site + Busca global + 404 | ✅ | `faq/`, `mapa-do-site/`, `busca/`, `not-found.tsx` | busca em posts+materials |
| Páginas legais reais (Privacidade LGPD, Termos) | ✅ | `privacidade/`, `termos/`, `lib/legal.ts` | migradas do site antigo |
| Formulário de Contato (validação server-side, máscara, honeypot, LGPD) | ✅ | `forms/ContactForm.tsx`, `api/contato/route.ts` | |
| Newsletter + Pop-up flutuante de captura | ✅ | `forms/NewsletterForm.tsx`, `CapturePopup.tsx`, `api/newsletter/route.ts` | pop-up site-wide, 12s/scroll, localStorage |
| Envio de e-mail (Resend/SMTP, fallback log) | ✅ | `lib/email.ts` | Resend ativo, domínio verificado |
| Integração YouTube (últimos vídeos via RSS) | ✅ | `lib/youtube.ts` | aparece quando há vídeos |
| Integração Instagram (Behold JSON) | ✅ | `lib/instagram.ts`, `InstagramFeed.tsx` | galeria on-brand |
| SEO técnico + JSON-LD + OG image + manifest + sitemap + robots + llms.txt | ✅ | ver §8 | |
| Conteúdo real seedado (admin, 4 artigos, 3 materiais) | ✅ | (seedado via rota temporária, já removida) | ver §14 |

---

## 5. Componentes criados

| Componente | Caminho | Finalidade | Dependências |
|---|---|---|---|
| `Button` | `components/ui/Button.tsx` | Botão/link (variantes primary/secondary/outline, sizes) | next/link |
| `SectionHeading` | `components/ui/SectionHeading.tsx` | Título de seção + régua dourada | lib/utils |
| `Faq` | `components/ui/Faq.tsx` (client) | Acordeão de FAQ | — |
| `Header` | `components/layout/Header.tsx` (client) | Header sticky, mega menu, menu mobile, busca | site-config, Button |
| `Footer` | `components/layout/Footer.tsx` | Rodapé (marca, social IG/LinkedIn/Facebook/YouTube/Linktree, navegação, contato) | site-config |
| `WhatsAppButton` | `components/layout/WhatsAppButton.tsx` | Botão flutuante WhatsApp | lib/utils |
| `BackToTop` | `components/layout/BackToTop.tsx` (client) | Voltar ao topo | — |
| `PageHero` | `components/layout/PageHero.tsx` | Hero de páginas internas + **BreadcrumbList JSON-LD** | site-config |
| `PagePlaceholder` | `components/layout/PagePlaceholder.tsx` | (legado) placeholder; ainda usado por algumas páginas | Button |
| `LegalArticle` | `components/layout/LegalArticle.tsx` | Renderiza conteúdo legal estruturado | lib/legal |
| `HeroCarousel` | `components/HeroCarousel.tsx` (client) | Carrossel de 5 banners da Home (auto-play, dots, setas, a11y) | content.heroSlides, Button |
| `ServiceDetail` | `components/ServiceDetail.tsx` | Página de serviço genérica + Service+FAQPage JSON-LD | content.servicosDetalhe, Faq |
| `InstagramFeed` | `components/InstagramFeed.tsx` (async) | Galeria de posts do Instagram (Behold) ou CTA fallback | lib/instagram |
| `TestimonialCard` | `components/TestimonialCard.tsx` | Card de depoimento | payload-types |
| `CapturePopup` | `components/CapturePopup.tsx` (client) | Pop-up de captura site-wide | NewsletterForm |
| `PostCard` | `components/blog/PostCard.tsx` | Card de artigo | payload-types, lib/format |
| `MaterialCard` | `components/materials/MaterialCard.tsx` | Card de material + DownloadButton | DownloadButton, lib/materials |
| `DownloadButton` | `components/materials/DownloadButton.tsx` (client) | Botão que abre modal de captura e libera download | api/newsletter |
| `MaterialsExplorer` | `components/materials/MaterialsExplorer.tsx` (client) | Filtro por categoria + busca dos materiais | MaterialCard |
| `ContactForm` | `components/forms/ContactForm.tsx` (client) | Formulário de contato | api/contato |
| `NewsletterForm` | `components/forms/NewsletterForm.tsx` (client) | Formulário de newsletter/captação | api/newsletter |

---

## 6. Páginas existentes

| URL | Objetivo | Componentes |
|---|---|---|
| `/` | Home / funil | HeroCarousel, ProductCard, MaterialCard, PostCard, InstagramFeed, Button, SectionHeading |
| `/institucional` | História, missão/visão/valores, fundador | PageHero, SectionHeading, Button (+ Person JSON-LD) |
| `/servicos` | Hub de serviços (6 pilares + cards) | PageHero, SectionHeading (+ ItemList/Service JSON-LD) |
| `/servicos/curso-gestao-360` | Curso (pilares, módulos, ferramentas) | PageHero, SectionHeading, Button (+ Course JSON-LD) |
| `/servicos/mentorias` `/palestras` `/consultoria` | Serviços detalhados | ServiceDetail (+ Service+FAQ JSON-LD) |
| `/livro-gestao-360` | Livro (em breve) | PageHero, Button (+ Book JSON-LD) |
| `/materiais` | Central de downloads | PageHero, MaterialsExplorer, MaterialCard, DownloadButton |
| `/materiais/[slug]` | Detalhe do material | PageHero, DownloadButton, MaterialCard, compartilhar |
| `/blog` | Lista de artigos | PageHero, PostCard |
| `/blog/[slug]` | Artigo (RichText) | PageHero, RichText (+ Article JSON-LD) |
| `/blog/rss.xml` | Feed RSS | route handler |
| `/depoimentos` | Prova social | PageHero, TestimonialCard, Button |
| `/faq` | Perguntas frequentes | PageHero, Faq, Button (+ FAQPage JSON-LD) |
| `/busca` | Busca global (posts+materials) | PageHero (form GET, server-side) |
| `/mapa-do-site` | Mapa do site | PageHero |
| `/contato` | Contato | PageHero, SectionHeading, ContactForm, Faq (+ FAQPage JSON-LD) |
| `/privacidade` `/termos` | Legal (LGPD) | PageHero, LegalArticle |
| `/admin` | Painel CMS (Payload) | — |
| `/llms.txt` `/sitemap.xml` `/robots.txt` `/manifest.webmanifest` | SEO/infra | route handlers |
| `/baixar/[slug]` | Conta download + redireciona | route handler |
| `/diagnostico-maturidade-empresarial.html` | Avaliação gratuita interativa (24 perguntas, 4 pilares) c/ captura de lead antes do resultado | HTML estático em `public/` (destino dos CTAs "Avaliação Gratuita") |

---

## 7. Design System

Tokens definidos em `src/app/(frontend)/globals.css` (`@theme`) e espelhados em `src/design-system/tokens.ts`.

### Cores
| Token | HEX | Uso |
|---|---|---|
| `navy` | `#1D2B3C` | primária (fundos, cabeçalhos) |
| `navy-light` | `#2E4358` | gradientes, faixas |
| `gold` | `#C1A160` | acento (sobre navy, texto grande) |
| `gold-light` | `#D7C089` | realces |
| `gold-ink` | `#8A6A1F` | **dourado escurecido p/ texto pequeno sobre claro (contraste AA)** |
| `ink` | `#15191F` | texto principal |
| `gray` | `#5B626E` | texto secundário (escurecido p/ AA sobre off-white) |
| `line` | `#D9DCE1` | bordas/divisórias |
| `surface` | `#F6F5F1` | fundo off-white |
| `success/warning/danger` | `#2E7D5B` / `#C7892B` / `#B23B3B` | estados |

### Tipografia
- **Títulos:** Montserrat (via `next/font`, `--font-montserrat` → `--font-heading`).
- **Corpo:** Open Sans (`--font-open-sans` → `--font-body`).
- Conteúdo de artigos: classe `.prose-ea` (h2/h3, listas, blockquote, links dourados).

### Componentes visuais
- **Botões:** gold/navy/outline, raio `lg`, foco visível dourado.
- **Cards:** `rounded-2xl border-line bg-white shadow-sm hover:shadow-md`.
- **Ícones:** SVG inline; emojis temáticos nos serviços/materiais.
- **Régua dourada** (linha-e-losango da marca) como divisória de seção.

### Responsividade
- **Mobile-first** (classes Tailwind `sm:`/`md:`/`lg:`). Grids empilham no mobile.
- Alvos de toque ≥24px (corrigido nos dots do carrossel).
- Imagens via `next/image` (lazy, sizes). `prefers-reduced-motion` respeitado.

---

## 8. SEO

| Recurso | Onde | Status |
|---|---|---|
| `<title>`/description/canonical por página | `metadata` em cada page | ✅ |
| Open Graph + Twitter Cards | `(frontend)/layout.tsx` + por página | ✅ |
| **OG image dinâmica** (1200×630, navy/dourado) | `(frontend)/opengraph-image.tsx` | ✅ |
| Manifest (PWA) + theme-color | `app/manifest.ts` + `viewport` | ✅ |
| Sitemap dinâmico (rotas + posts) | `app/sitemap.ts` | ✅ |
| Robots (libera IAs) | `app/robots.ts` | ✅ |
| RSS do blog | `blog/rss.xml/route.ts` | ✅ |
| **Schema.org / JSON-LD** | vários | ✅ |

### JSON-LD implementado
- **Organization** + **WebSite** (com **SearchAction**/sitelinks searchbox) → `(frontend)/layout.tsx`
- **BreadcrumbList** → `PageHero.tsx` (todas as páginas internas)
- **Article** → `blog/[slug]`
- **FAQPage** → `/faq`, `/contato`, páginas de serviço
- **Service** (+ ItemList) → `/servicos` e cada serviço
- **Course** → `/servicos/curso-gestao-360`
- **Book** → `/livro-gestao-360`
- **Person** (Thiago Marchi) → `/institucional`
- **LocalBusiness** → ⚠️ ainda NÃO implementado (oportunidade: adicionar com endereço/horário quando houver dados; bom para "Google Meu Negócio")

---

## 9. Estrutura para IA (GEO / LLMO / AEO)

- **`/llms.txt`** (`app/llms.txt/route.ts`): descreve empresa, serviços, método (6 pilares), público-alvo e contato em Markdown — para ChatGPT, Claude, Gemini, Perplexity, Copilot.
- **`robots.txt`** libera **explicitamente** os crawlers de IA: GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Amazonbot, Bingbot, CCBot, cohere-ai, Meta-ExternalAgent, DuckDuckBot.
- **AEO:** blocos de **perguntas e respostas** (FAQ com FAQPage schema) nas páginas de serviço/contato/FAQ; respostas concisas e diretas.
- **Conteúdo semântico:** H1 único por página, hierarquia de headings, HTML semântico, alt text, dados estruturados ricos.
- **Próximo passo de IA:** adicionar **AggregateRating/Review** quando houver avaliações reais do Google (Featurable) — gera estrelas no resultado e reforça GEO.

---

## 10. Bibliotecas instaladas

| Lib | Versão | Finalidade |
|---|---|---|
| `next` | `~15.4.11` | framework (App Router) |
| `react` / `react-dom` | `^19` | UI |
| `typescript` | `^5.7.3` | tipagem |
| `tailwindcss` + `@tailwindcss/postcss` | `^4` | estilos |
| `payload` | `^3.85.1` | CMS |
| `@payloadcms/next` | `^3.85.1` | integração Next |
| `@payloadcms/db-sqlite` | `^3.85.1` | adapter SQLite (trocar p/ db-postgres na prod) |
| `@payloadcms/richtext-lexical` | `^3.85.1` | editor rich text + render |
| `graphql` | `^16.14.2` | peer do Payload |
| `sharp` | `^0.35.2` | processamento de imagem (uploads/otimização) |
| `resend` | `^6.16` | envio de e-mail (ativo) |
| `nodemailer` | `^9.0.1` | envio via SMTP (alternativa, não usada) |
| `eslint` / `eslint-config-next` | `^9` / `~15.4.11` | lint |
| `prettier` + `prettier-plugin-tailwindcss` | — | formatação |
| `tsx` | `^4.22` | (usado só pelo CLI do Payload — quebra no Node 24, ver §15) |
| **fpdf2** (Python) | — | **fora do projeto**; usado só para gerar os PDFs dos materiais |

---

## 11. Variáveis de ambiente

Template em `.env.example`. Segredos reais em `.env` / `.env.local` (gitignored). **Não expor chaves.**

| Nome | Finalidade | Exemplo |
|---|---|---|
| `PAYLOAD_SECRET` | segredo do Payload (JWT/cripto) | `<hex 32 bytes>` |
| `DATABASE_URI` | conexão do banco | dev: `file:./empresarial-academy.db` · prod: `postgres://...` |
| `LEADS_TO_EMAIL` | para onde os leads chegam | `contato@empresarialacademy.com` |
| `LEADS_FROM_EMAIL` | remetente | `Empresarial Academy <contato@empresarialacademy.com>` |
| `RESEND_API_KEY` | API key da Resend (e-mail) | `re_...` (configurada no .env.local) |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | alternativa SMTP (não usada — MS365 bloqueado) | — |
| `BEHOLD_FEED_URL` | feed JSON do Instagram (Behold) | `https://feeds.behold.so/USNaKuFM84w2pqFmg0Jl` |

> `youtubeChannelId` (`UCMwl07dy4cRIkPM6EB53FOg`) está em `src/lib/site-config.ts` (não é env).
> **No deploy:** levar `PAYLOAD_SECRET`, `DATABASE_URI` (Postgres), `RESEND_API_KEY`, `LEADS_TO/FROM_EMAIL`, `BEHOLD_FEED_URL`.

---

## 12. Pendências (priorizadas)

### 🔴 Alta
- **Deploy / hospedagem:** Vercel + Postgres (Neon) + Storage S3/R2. **Tirar o projeto do OneDrive** (ver §15).
- **Migrar SQLite → PostgreSQL** (trocar adapter em `payload.config.ts`, criar migrations).
- **Storage de mídia** (S3/R2) — em serverless o filesystem é efêmero (uploads do CMS).
- **Apontar domínio** `empresarialacademy.com` (.com) + redirect do `.com.br` se existir.

### 🟠 Média
- **Prova social / Google Meu Negócio:** cliente configurando **Featurable**; ao receber o feed/embed, montar seção on-brand + **AggregateRating schema** + selo. Definir onde exibir (Home, hero, /depoimentos, perto dos CTAs).
- **Depoimentos reais** (do Google ou enviados pelo cliente) — não inventar.
- **LocalBusiness schema** (quando houver endereço/horário públicos).
- **Trocar a senha** do admin (`Empresarial@2026`) e do e-mail thiago@ (apareceu no chat).

### 🟢 Baixa
- **Banco de imagens (`Marketing/Midias/Imagens Site`) é quase todo inutilizável como banner direto:** são peças de Instagram já finalizadas, com headline e logo "queimados" na imagem (texto em inglês com erro de digitação "MANAGEKENT", ou português duplicando o H1 da página: "Mentoria Executiva", "Palestra sob medida...", "Curso Gestão 360", "E-books 360", infográfico 4 quadrantes, card de bio do Thiago). Usar como `background-image` direto faz o texto da imagem colidir com o título real da página.
  - **Resolvido para 7 páginas:** 3 fotos já limpas (`depoimentos.jpg`, `blog.jpg`, `contato.jpg`) + 4 recortadas manualmente isolando só o lado com a foto do Thiago, descartando o lado com texto (`banner-institucional.jpg` ← `banner-sobre.jpg`, `banner-mentorias.jpg` ← `mentoria-executiva.jpg`, `banner-palestras.jpg` ← `palestras.jpg`, `banner-curso.jpg` ← `curso-gestao-360.jpg`). Aplicadas em `/institucional`, `/servicos/mentorias`, `/servicos/palestras`, `/servicos/curso-gestao-360`, `/depoimentos`, `/blog`, `/contato`.
  - **Ainda sem foto própria** (fundo navy tipográfico): `/servicos` (hub), `/servicos/consultoria`, `/livro-gestao-360`, `/materiais`, `/materiais/[slug]`, `/faq`, `/termos`, `/privacidade`, `/mapa-do-site`, `/busca`, Home (carrossel). Não há fonte limpa no banco para essas — falta foto bruta nova (sem texto) do cliente/fotógrafo para fechar o restante.
- Imagens/fotos reais em PT-BR (as do backup têm texto em inglês; hoje o visual é tipográfico + foto real do fundador).
- YouTube: seção aparece sozinha quando houver vídeos no canal.
- Analytics (GA4) + Search Console + banner de cookies (se usar analytics).

---

## 13. Próximos passos (para o próximo Claude começar imediatamente)

1. **Prova social (Google/Featurable):** o cliente está criando o widget no Featurable. Quando ele enviar o **link do feed/JSON** (ou o ID/embed), criar `src/lib/reviews.ts` (fetch server-side, padrão igual ao `lib/instagram.ts`), um componente `GoogleReviews`/seção, e adicionar **AggregateRating + Review JSON-LD**. Colocar a seção na Home (após Serviços) e na página `/depoimentos`; um selo "⭐ no Google" no hero/footer.
2. Caso o cliente prefira, cadastrar depoimentos reais manualmente em `/admin` (coleção `testimonials`, marcar `featured` p/ aparecer na Home — obs.: ainda não há bloco de depoimentos featured na Home; criar se desejado).
3. Quando autorizado: **preparar deploy** (Vercel) — instruções no `docs/PUBLICACAO.md`.

> ⚠️ **Regra do cliente:** o site não pode ter perda nenhuma e deve continuar funcional. Trabalhar de forma incremental, sempre validando com build/start. Atualizar este `PROJECT_STATUS.md` ao fim de cada tarefa.

---

## 14. Histórico das decisões

- **Reconstrução do zero** (não corrigir o site antigo). Conteúdo/imagens antigos usados só como referência.
- **Next.js (App Router) + TypeScript** escolhido por maior aderência a **SEO + mobile-first** (SSR/SSG/ISR).
- **Tailwind CSS 4** (config via `@theme` em CSS).
- **Payload CMS + SQLite** (local), migrar p/ **Postgres** na produção. CMS para Blog, Materiais e Depoimentos administráveis por leigos.
- **Cores canônicas** Navy `#1D2B3C` / Dourado `#C1A160` (o README antigo dizia `#1E3A5F/#D4AF37` — incorreto). Fontes Montserrat/Open Sans.
- **Telefone oficial:** `(11) 93340-0264` (mantido; o briefing trazia `(11) 95661-9990`, descartado por decisão do cliente).
- **Visão:** a do branding master ("referência até 2030, 10.000 empresários"); descartada a versão do briefing.
- **Livro:** nome oficial **"Gestão 360"**.
- **E-mail:** **Resend** (domínio `empresarialacademy.com` verificado por DKIM/SPF/DMARC no DNS da Hostinger). SMTP do Microsoft 365 foi tentado mas **bloqueado por Security Defaults** → abandonado.
- **Instagram:** **Behold** (feed JSON) renderizado on-brand — preferido ao widget genérico.
- **Depoimentos:** **não fabricar** prova social falsa; usar Google/Featurable ou reais.
- **Domínio:** **.com** (`empresarialacademy.com`). DNS fica na Hostinger mesmo após mover a hospedagem.
- **`gold-ink` e `gray` escurecidos** para passar contraste WCAG AA em texto pequeno sobre fundo claro.
- **`robots` + `llms.txt`** para liberar e orientar IAs (GEO/LLMO/AEO).

---

## 15. Problemas conhecidos / Limitações

1. **OneDrive trava o build (CRÍTICO):**
   - `next dev` dá **`EBUSY`** em `.next/react-loadable-manifest.json` (rotas 500). `next build` às vezes dá **`EINVAL: readlink`** em `.next/diagnostics/*`.
   - **Workaround:** `Remove-Item .next -Recurse` antes do build; para `next dev` (ex.: seed), **pausar o OneDrive** (`Stop-Process -Name OneDrive -Force`) e religar (`Start-Process "C:\Program Files\Microsoft OneDrive\OneDrive.exe" /background`).
   - **Solução definitiva:** mover o projeto para fora do OneDrive (será resolvido no deploy).
2. **Otimizador de imagem do Next falha localmente:** libvips/sharp dá `VipsInterpretation space 32` no Windows → serve a imagem-fonte sem converter p/ webp/avif. Mitigado reprocessando as imagens-fonte (sRGB limpo, tamanhos adequados; logo 272KB→38KB). **Funciona normalmente em Linux/Vercel** (Perf sobe p/ 90+).
3. **CLI do Payload quebra no Node 24:** `payload generate:types`/`generate:importmap` dão `undici CacheStorage Illegal constructor` (via `tsx`). O **app (build/dev) funciona**. Para **gerar `payload-types.ts`**, usar uma rota temporária no runtime do Next: `await import(pathToFileURL('node_modules/payload/dist/bin/generateTypes.js'))` com `/* webpackIgnore: true */`, chamando `generateTypes(await config, {log:true})` (e `getPayloadClient()` antes, para push de schema de coleções novas). O importMap do admin é regenerado automaticamente pelo dev server.
4. **Payload dev push (SQLite):** ao adicionar coleções ou reabrir, pode dar `CREATE INDEX ... already exists`. **Workaround:** resetar o `.db` (apagar `empresarial-academy.db*`) e deixar o push recriar o schema; depois re-seedar.
5. **sharp "desidratado" pelo OneDrive:** às vezes `ERR_DLOPEN_FAILED`. Corrigir com `npm install --include=optional --os=win32 --cpu=x64 sharp`.
6. **Lighthouse mobile (local):** Performance ~85–91 (varia; sobe em prod), Acessibilidade 99 (1 aviso `image-redundant-alt` na foto do fundador — alt legítimo, não degradar), Best Practices 100, SEO 100.
7. **Servidor de preview/screenshots** do harness é instável neste ambiente — validação feita via HTTP.

---

## 16. Checklist Geral

| Item | Status |
|---|---|
| Home | ✅ |
| Institucional | ✅ |
| Serviços (hub + 4 detalhes) | ✅ |
| Livro | ✅ |
| Blog (CMS + 4 artigos reais) | ✅ |
| Materiais (CMS + 3 PDFs reais) | ✅ |
| Depoimentos (estrutura) | ✅ / ⏳ conteúdo (Google) |
| FAQ / Busca / Mapa do Site / 404 | ✅ |
| Legal (Privacidade/Termos) | ✅ |
| Formulários (contato, newsletter, pop-up, captura download) | ✅ |
| E-mail (Resend, domínio verificado) | ✅ |
| Integração YouTube | ✅ |
| Integração Instagram (Behold) | ✅ |
| SEO técnico + JSON-LD | ✅ |
| GEO / LLMO / AEO (llms.txt, robots IA) | ✅ |
| Performance | ✅ (~85–91 mobile local) |
| Acessibilidade (WCAG) | ✅ (99) |
| Responsividade mobile-first | ✅ |
| Testes (links, formulários) | ✅ |
| Usuário admin criado | ✅ |
| Prova social (Google) | ⏳ em andamento (cliente) |
| Deploy / Hospedagem | ⏳ pendente |
| Migração p/ Postgres | ⏳ pendente |

---

## 17. Última atualização

- **Data/Hora:** 2026-07-01
- **Auditoria UX/SEO/GEO (executada nesta data):**
  1. **H1 múltiplo corrigido (crítico SEO):** o `HeroCarousel` renderizava 5 `<h1>` no DOM da Home (um por slide). Agora só o primeiro slide é `<h1>`; os demais são `<p>` com o mesmo estilo. Home validada com 1 H1.
  2. **Diagnóstico descobrível (crítico GEO/conversão):** a página `/diagnostico-maturidade-empresarial.html` entrou no `sitemap.ts`, no footer ("Diagnóstico gratuito →"), no `/mapa-do-site` e no `llms.txt`; o HTML estático ganhou canonical, favicon, Open Graph/Twitter e JSON-LD `WebPage` (offer price 0).
  3. **FAQ atualizada (AEO):** a resposta de "Como funciona a avaliação gratuita?" agora descreve o diagnóstico online (24 perguntas, resultado na hora) em vez do fluxo antigo de formulário — resposta citável por IAs e alinhada ao produto real.
  4. **Pop-up de captura suprimido em `/contato`** (visitante já está convertendo; pop-up só gerava atrito). `CapturePopup.tsx` usa `usePathname` + lista `SUPPRESSED_PATHS`.
  - **Recomendações da auditoria NÃO executadas** (registradas para o backlog): trocar emojis por ícones SVG (consistência premium entre sistemas operacionais); barra de progresso no diagnóstico (24 perguntas → mostrar % reduz abandono); salvar leads do diagnóstico também no CMS (hoje só e-mail); micro-animações de entrada com `prefers-reduced-motion`; OG image própria para o diagnóstico; bloco de depoimentos featured na Home (aguarda conteúdo real).

### Sessão anterior (2026-06-29)
- **Resumo da última tarefa:**
  1. **Prova social/Google (Featurable) pausada:** o Place ID do Google exige Google Business Profile; cliente é 100% digital. Avaliado caminho "Service Area Business" (sem endereço público) — mas o Google está pedindo **verificação por vídeo de local físico**, o que travou o processo. Decisão de continuar depois; alternativa já mapeada: depoimentos reais manuais via CMS (`collection: testimonials`, já existe), sem depender do Google.
  2. **`PageHero`** (`src/components/layout/PageHero.tsx`) ganhou suporte a imagem de fundo (`image`/`imageAlt`), com overlay navy/dourado para legibilidade, e altura padronizada (`min-h-[320px] sm:min-h-[360px] md:min-h-[420px]`) em todas as páginas internas.
  3. **`HeroCarousel`** (Home) teve a altura reduzida e padronizada entre os 5 slides (`min-h-[420px] sm:min-h-[480px] md:min-h-[540px]`, antes `py-20 md:py-28` sem teto).
  4. **Header**: fonte do menu desktop aumentada de `text-sm` (14px) para `text-base` (16px) — `src/components/layout/Header.tsx`.
  5. **Banners com imagem real aplicados em 7 páginas** (`/depoimentos`, `/blog`, `/contato`, `/institucional`, `/servicos/mentorias`, `/servicos/palestras`, `/servicos/curso-gestao-360`) — 3 fotos já limpas do banco + 4 recortadas manualmente para isolar só o lado-foto do Thiago (ver §12 Baixa para detalhe do problema com o restante do banco e o que falta).
  6. Servidor de dev antigo na porta 3100 (da sessão anterior) foi encerrado e religado já com as mudanças desta sessão.
  7. **Diagnóstico de Maturidade Empresarial (substitui o Microsoft Forms de avaliação):** ferramenta HTML standalone criada em outro chat foi adaptada e publicada em `public/diagnostico-maturidade-empresarial.html` (acessível em `/diagnostico-maturidade-empresarial.html`). 24 perguntas (4 pilares × 6: Comercial, Operações, Indicadores, Liderança), escala 1–5, score geral + radar + barras + plano de melhoria por pilar. **Adaptações na integração:** (a) **gate de captura de lead** antes de exibir o resultado — nome/empresa/e-mail/WhatsApp + consentimento LGPD + honeypot, envia via `POST /api/newsletter` com origem "Diagnóstico de Maturidade Empresarial" e os scores por pilar no campo `extra` (o e-mail do lead chega ao Thiago com a pontuação completa); o resultado é exibido mesmo se o envio do e-mail falhar; (b) CTA final com **WhatsApp** pré-preenchido com o resultado do usuário + link para `/contato`; (c) link "voltar ao site" e caminhos absolutos (`/logo...`, `/privacidade`). **Rota `/api/newsletter` ganhou o campo opcional `extra: Record<string,string>`** (sanitizado) repassado ao e-mail. **`Button` ganhou a prop `external`** (renderiza `<a>` em vez de `next/link` — necessário para arquivo estático em `public/`). **Todos os CTAs "Avaliação Gratuita"** (Header desktop/mobile, HeroCarousel, institucional, CTA final da Home e de /servicos) apontam para o diagnóstico; os da Home/serviços mudaram o rótulo para "Fazer diagnóstico gratuito". Fluxo completo validado no preview: 24 respostas → gate → lead 200 OK na API (e-mail real saiu via Resend — havia um lead de teste "Teste Claude" para descartar) → resultado 48%/Estruturado renderizado.
- **Estado do servidor:** dev (`npm run dev --prefix empresarial-academy-site -- -p 3100`) rodando em `http://localhost:3100`, validado via preview/screenshot. OneDrive foi pausado durante a sessão (necessário religar manualmente se ainda não tiver religado).
- **Pendente:** prova social (Google vídeo-verificação vs. depoimentos manuais no CMS) — decisão do cliente; fotos brutas sem texto para os banners restantes (ver §12 Baixa).
- **Próxima tarefa sugerida:** decidir prova social; ou avançar Deploy/Postgres (§12 Alta).
