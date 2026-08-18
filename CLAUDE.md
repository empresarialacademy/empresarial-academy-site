# Empresarial Academy — site institucional

> Lido automaticamente pelo Claude Code no início de qualquer sessão nesta pasta.
> Leia isto ANTES de editar qualquer arquivo.

## ⚠️ REGRA CRÍTICA: nunca trabalhar aqui sem checar sessões concorrentes

Este repositório (`C:\dev\empresarial-academy-site`) já teve **múltiplos incidentes reais**,
na mesma sessão de trabalho, de duas sessões de Claude Code (ou mais) editando esta pasta ao
mesmo tempo. Escalaram em gravidade: sobrescrever o deploy de produção → apagar uma seção de
um painel → **apagar arquivos inteiros e desregistrar uma coleção inteira do `payload.config.ts`**,
desligando uma feature sem intenção aparente. Detalhes completos em `PROJECT_STATUS.md`,
seções "Sessão 2026-08-17" e "Sessão 2026-08-17 (b)".

**Antes de editar qualquer arquivo neste repositório, em qualquer sessão:**

1. Rodar `git status --short` e `git log --oneline -5`. Se houver mudanças não commitadas que
   você não fez, ou commits recentes que não reconhece, **outra sessão pode estar ativa agora**.
2. Se for uma tarefa de código de qualquer tamanho (não uma checagem rápida de 1 arquivo),
   **trabalhar num git worktree separado**, não direto nesta pasta:
   - Claude Code: usar a ferramenta `EnterWorktree` (ou pedir ao usuário "trabalhe num worktree").
   - Terminal: `git worktree add ../empresarial-academy-site-<nome-da-tarefa> -b feature/<nome>`.
3. **Nunca commitar nem fazer deploy sem rodar `git status --short` imediatamente antes** —
   se aparecer algo inesperado (arquivo apagado que você não apagou, coleção sumida de um
   arquivo de config), **parar e restaurar com `git checkout HEAD -- <arquivo>` antes de
   continuar** — nunca commitar por cima de uma mudança que você não entende a origem.
4. Depois de `vercel --prod`, sempre confirmar com `vercel inspect <domínio>` que o
   deployment ID aliasado é o que você acabou de publicar — outra sessão pode ter feito deploy
   entre o seu `vercel --prod` e a checagem.

## Deploy

Deploy é **sempre via Vercel CLI** (`vercel --prod`), nunca por `git push`. O repositório
`empresarialacademy/empresarial-academy-site` no GitHub tem um branch `main` órfão (histórico
antigo de uma versão paralela abandonada) que ainda pode estar conectado ao projeto na Vercel
com auto-deploy — um push acidental em `main` reintroduziria essa versão antiga por cima do
site real. Nunca dar push em `main`. Push em `master` (o branch real) é seguro, mas não aciona
deploy sozinho — o deploy continua manual via CLI.

## Continuidade

`PROJECT_STATUS.md` é o arquivo de continuidade deste projeto — 1 arquivo por repo, atualizado
a cada sessão relevante. Ler antes de assumir o estado de qualquer feature; atualizar ao final
de qualquer tarefa não trivial.
