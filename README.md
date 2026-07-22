# Empresarial Academy — Site Institucional

Reconstrução premium do site da **Empresarial Academy**, com foco em **SEO** e **mobile-first**.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + Design System próprio (tokens da marca)
- **next/font** (Montserrat + Open Sans)
- SEO técnico nativo: `metadata`, `sitemap.ts`, `robots.ts`, JSON-LD (Schema.org)

> Próximos módulos planejados: **Payload CMS** (Blog + Central de Downloads administráveis), PostgreSQL e storage de mídia. Ver roadmap.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run format`.

## Estrutura

```
src/
├─ app/                 # Rotas + SEO (layout, page, sitemap, robots)
├─ components/ui/       # Componentes do Design System (Atomic Design)
├─ design-system/       # Tokens da marca
└─ lib/                 # Config do site (contatos, navegação, marca)
public/                 # Imagens e assets estáticos
```

## Identidade da marca (canônica)

- **Cores:** Navy `#1D2B3C` · Dourado `#C1A160` (+ neutros e estados)
- **Fontes:** Montserrat (títulos) · Open Sans (corpo)
- **Slogan:** "Conhecimento que Impulsiona"

## ⚠️ Nota sobre OneDrive

Este projeto está numa pasta sincronizada pelo OneDrive. Recomenda-se **pausar a
sincronização** durante o desenvolvimento (ou mover o projeto para fora do
OneDrive), pois `node_modules` e `.next` geram milhares de arquivos e degradam a
sincronização. Ambos já estão no `.gitignore`.
