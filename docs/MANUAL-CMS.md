# Manual do Painel — Blog e Materiais

**Empresarial Academy · Conhecimento que Impulsiona**

Este manual ensina a publicar e gerenciar o conteúdo do site sem depender de ninguém técnico. Tudo acontece no painel administrativo (CMS).

---

## 1. Acessando o painel

1. Abra `https://SEU-DOMINIO/admin` (enquanto o domínio não está apontado: `https://empresarial-academy-site-marchi-thiago1.vercel.app/admin`).
2. Entre com seu e-mail e senha.
3. Para **trocar a senha**: clique no seu avatar (canto da tela) → **Account** → preencha "New Password" → **Save**.

> ⏱️ **Importante:** o site usa cache de 60 segundos. Depois de publicar ou editar algo, pode levar **até 1 minuto** para a mudança aparecer no site. Não é erro — é otimização de velocidade.

---

## 2. Blog

### 2.1 Publicar um artigo novo

1. No menu lateral, grupo **Conteúdo** → **Artigos** (Posts) → botão **Create New**.
2. Preencha:

| Campo | O que colocar | Dica |
|---|---|---|
| **Título** | O título do artigo | Direto e específico. Bom: "Funil de vendas em 4 etapas". Evite títulos genéricos. |
| **Slug** | Endereço do artigo na web | É gerado sozinho a partir do título. Só mexa se quiser encurtar. Vira `/blog/seu-slug`. |
| **Resumo (Excerpt)** | 1–2 frases sobre o artigo | Aparece no card do blog e no Google. Capriche: é o "anúncio" do artigo. |
| **Imagem de capa** | Foto/arte do artigo | Opcional. Sem capa, o site gera automaticamente uma capa elegante nas cores da marca. Se subir imagem: ideal 1200×675px (16:9). |
| **Conteúdo** | O texto do artigo | Use os botões do editor: títulos (H2/H3), negrito, listas, links. Estruture com subtítulos a cada 3–4 parágrafos. |
| **Categoria** | Tema do artigo | Escolha uma existente ou crie em **Categorias**. |
| **Autor** | Quem escreveu | Normalmente você. |
| **Status** | Rascunho ou Publicado | **Só aparece no site quando "Publicado"** e com data de publicação já passada. |
| **Data de publicação** | Quando entra no ar | Pode agendar: uma data futura segura o artigo até lá. |
| **SEO → Meta Title/Description** | Título e descrição para o Google | Opcional. Vazio = usa título e resumo. |

3. Clique em **Save**. Se o status for "Publicado", em até 1 minuto o artigo está no ar em `/blog`.

### 2.2 Editar ou despublicar

- **Editar:** Artigos → clique no artigo → altere → **Save**.
- **Tirar do ar sem apagar:** mude o Status para **Rascunho** → Save.
- **Apagar de vez:** dentro do artigo, menu "..." → **Delete** (não tem volta).

### 2.3 Boas práticas de artigo (SEO)

- Título com a **palavra que o cliente buscaria** no Google.
- Resumo que responda "por que ler isso?".
- Subtítulos (H2) a cada bloco de ideia — Google e leitores adoram.
- Termine com uma chamada: convide para a avaliação gratuita, um material ou o WhatsApp.
- Frequência vale mais que volume: 1 artigo bom por semana supera 4 de uma vez por mês.

---

## 3. Materiais Gratuitos (e-books, planilhas, checklists)

Os materiais são a principal **máquina de captação de leads**: o visitante só baixa depois de deixar nome e e-mail — e você recebe cada lead por e-mail e no painel.

### 3.1 Subir um material novo (3 passos)

**Passo 1 — Suba o arquivo:**
1. Grupo **Conteúdo** → **Arquivos de Materiais** (Material Files) → **Create New**.
2. Arraste o PDF/planilha → **Save**.

**Passo 2 — (Se precisar) crie a categoria:**
1. **Categorias de Materiais** → **Create New** → nome (ex.: "Vendas", "Gestão") → **Save**.

**Passo 3 — Crie o material:**
1. **Materiais** → **Create New**.
2. Preencha:

| Campo | O que colocar |
|---|---|
| **Título** | Nome do material (ex.: "Guia do Funil de Vendas") |
| **Descrição** | 1–2 frases vendendo o valor: o que a pessoa ganha baixando? |
| **Imagem de capa** | Opcional — sem capa, o site gera uma capa automática na identidade da marca |
| **Arquivo** | Selecione o arquivo subido no Passo 1 |
| **Tipo (Kind)** | E-book, Planilha, Checklist ou Template — vira o selo dourado no card |
| **Categoria** | A do Passo 2 |
| **Destaque (Featured)** | Marcado = aparece na Home |
| **Status** | **Publicado** para ir ao ar |

3. **Save**. Em até 1 minuto está em `/materiais`.

### 3.2 Acompanhando resultados

- **Contador de downloads:** cada material mostra o número no site e no painel.
- **Leads:** grupo **Captação** → **Leads** — todo mundo que baixou material, assinou newsletter, preencheu contato ou fez o diagnóstico está lá, com origem e data. Os mesmos leads também chegam no seu e-mail.

---

## 4. Depoimentos

1. Grupo **Conteúdo** → **Depoimentos** → **Create New**.
2. Nome, cargo/empresa, texto do depoimento, foto (opcional) e nota (1–5).
3. **Destaque** marcado = candidato a aparecer na Home; Status **Publicado** = visível em `/depoimentos`.

> Use apenas depoimentos **reais e autorizados** pelo cliente.

---

## 5. Perguntas frequentes do painel

**Salvei e não apareceu no site.**
Aguarde 1 minuto (cache) e recarregue a página do site (Ctrl+F5). Confira também se o Status é "Publicado" e se a data de publicação não está no futuro.

**Posso escrever o artigo aos poucos?**
Sim — deixe como **Rascunho** e vá salvando. Só publique quando terminar.

**Que tamanho de imagem usar?**
Capas: 1200×675px (16:9), JPG, até ~300KB. Fotos de depoimento: quadradas, a partir de 200×200px.

**Apaguei algo sem querer.**
Itens deletados não têm lixeira. Na dúvida, prefira mudar o Status para Rascunho em vez de deletar.

**Esqueci a senha.**
Na tela de login, use "Forgot password?" — o link de redefinição chega no seu e-mail.

---

*Manual gerado em 02/07/2026 · Site Empresarial Academy (Next.js + Payload CMS)*
