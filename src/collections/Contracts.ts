import type { CollectionConfig } from "payload";
import { buildContractHtml, PLANOS, type ContractInput, type ContractType } from "@/lib/contract-text";
import { generateSignToken, hashContractText } from "@/lib/contract-token";

/**
 * Contratos gerados pelo EA HUB e enviados para assinatura eletrônica.
 *
 * Convenção de acesso igual a src/collections/Leads.ts: leitura/gestão só
 * para usuários logados do admin. A geração/envio (view custom "Gerador de
 * Contratos") e a assinatura pública (rota /assinar/[token] + API de
 * assinatura) usam a Local API do Payload, que por padrão ignora `access`
 * (overrideAccess: true) — por isso field-level `access.update: () => false`
 * abaixo bloqueia edição pelas rotas normais (admin UI, REST, GraphQL) sem
 * impedir a escrita pelo próprio código-servidor.
 *
 * Igual ao padrão de EmailLogs.ts (auditoria append-only): os campos de
 * evidência de assinatura nunca são editáveis pela UI do admin, só gravados
 * pela rota de assinatura no momento do aceite.
 */

const CONTRACT_TYPE_OPTIONS: { label: string; value: ContractType }[] = [
  { label: "Mentoria Executiva Gestão 360", value: "mentoria" },
  { label: "Consultoria de Negócios Hands-On Gestão 360", value: "consultoria" },
  { label: "Conselho Gestão 360", value: "conselho" },
  { label: "Diagnóstico Executivo 360 (avulso)", value: "diagnostico" },
  { label: "Projeto Personalizado", value: "projeto" },
];

export const Contracts: CollectionConfig = {
  slug: "contracts",
  labels: { singular: "Contrato", plural: "Contratos" },
  // Título já começa pelo nome do cliente ("Nome · Plano") de propósito:
  // ordena a lista por cliente primeiro, data mais recente como critério de
  // desempate (pedido do Thiago, 17/08/2026).
  defaultSort: ["title", "-createdAt"],
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "contractType", "status", "clienteEmail", "createdAt"],
    group: "Contratos",
    description:
      "Contratos gerados a partir do Gerador de Contratos (EA HUB) e enviados para assinatura eletrônica pelo link /assinar/[token].",
    components: {
      edit: {
        SaveButton: "@/components/admin/contracts/ContractSaveButton#ContractSaveButton",
      },
    },
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Título (gerado)",
      admin: {
        readOnly: true,
        description: "Gerado automaticamente a partir do tipo de contrato e do nome do cliente.",
      },
      access: { update: () => false },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "rascunho",
      label: "Status",
      admin: { position: "sidebar" },
      options: [
        { label: "Rascunho", value: "rascunho" },
        { label: "Enviado para assinatura", value: "enviado" },
        { label: "Assinado", value: "assinado" },
        { label: "Cancelado", value: "cancelado" },
      ],
    },
    {
      name: "contractType",
      type: "select",
      required: true,
      label: "Tipo de contrato",
      options: CONTRACT_TYPE_OPTIONS,
    },
    {
      name: "horizonte",
      type: "select",
      label: "Horizonte",
      admin: {
        description: "Só para Mentoria e Consultoria.",
        condition: (data) => data?.contractType === "mentoria" || data?.contractType === "consultoria",
      },
      options: [
        { label: "Trimestral (3 meses)", value: "trimestral" },
        { label: "Semestral (6 meses)", value: "semestral" },
        { label: "Anual (12 meses)", value: "anual" },
      ],
    },
    {
      name: "valorMensal",
      type: "number",
      label: "Valor mensal / único (R$)",
      admin: {
        description: "Não se aplica ao Projeto Personalizado (usa projValorTotal).",
        condition: (data) => data?.contractType !== "projeto",
      },
    },

    // ─── Projeto personalizado ───
    {
      type: "collapsible",
      label: "Projeto personalizado",
      admin: { condition: (data) => data?.contractType === "projeto" },
      fields: [
        { name: "projNome", type: "text", label: "Nome do projeto" },
        { name: "projDescricao", type: "textarea", label: "Escopo geral" },
        {
          name: "etapas",
          type: "array",
          label: "Etapas do projeto",
          fields: [
            { name: "nome", type: "text", label: "Nome da etapa" },
            { name: "prazo", type: "text", label: "Prazo" },
            { name: "descricao", type: "textarea", label: "Entrega desta etapa" },
          ],
        },
        { name: "projDuracao", type: "text", label: "Duração total" },
        { name: "projDataEntrega", type: "date", label: "Entrega final prevista" },
        { name: "projValorTotal", type: "number", label: "Valor total do projeto (R$)" },
        { name: "projParcelas", type: "number", label: "Número de parcelas", defaultValue: 1 },
        { name: "projValorParcela", type: "number", label: "Valor de cada parcela (R$)" },
      ],
    },

    // ─── Contratante ───
    {
      name: "tipoPessoa",
      type: "select",
      required: true,
      defaultValue: "PF",
      label: "Tipo de pessoa",
      options: [
        { label: "Física", value: "PF" },
        { label: "Jurídica", value: "PJ" },
      ],
    },
    { name: "pfNome", type: "text", label: "Nome completo (PF)", admin: { condition: (data) => data?.tipoPessoa === "PF" } },
    { name: "pfCpf", type: "text", label: "CPF (PF)", admin: { condition: (data) => data?.tipoPessoa === "PF" } },
    { name: "pjRazao", type: "text", label: "Razão social (PJ)", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "pjFantasia", type: "text", label: "Nome fantasia (PJ)", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "pjCnpj", type: "text", label: "CNPJ (PJ)", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "pjRepNome", type: "text", label: "Nome do representante legal", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "pjRepCpf", type: "text", label: "CPF do representante", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "pjRepCargo", type: "text", label: "Cargo do representante", admin: { condition: (data) => data?.tipoPessoa === "PJ" } },
    { name: "clienteEndereco", type: "textarea", label: "Endereço completo" },
    { name: "clienteEmail", type: "email", required: true, label: "E-mail do cliente" },
    { name: "clienteTelefone", type: "text", label: "Telefone do cliente" },

    // ─── Datas e pagamento ───
    { name: "dataInicio", type: "date", label: "Data de início da vigência" },
    { name: "diaVencimento", type: "number", label: "Dia de vencimento mensal", defaultValue: 10, min: 1, max: 28 },
    {
      name: "formaPagamento",
      type: "select",
      defaultValue: "PIX",
      label: "Forma de pagamento",
      options: ["PIX", "Boleto bancário", "Transferência bancária (TED/DOC)", "Cartão de crédito recorrente"].map(
        (v) => ({ label: v, value: v }),
      ),
    },
    { name: "clausulaReajuste", type: "checkbox", label: "Incluir cláusula de reajuste anual por IPCA", defaultValue: true },

    // ─── Abatimento do Diagnóstico ───
    { name: "temDiagnostico", type: "checkbox", label: "Cliente já contratou e pagou o Diagnóstico Executivo 360" },
    {
      name: "diagValor",
      type: "number",
      label: "Valor pago no diagnóstico (R$)",
      defaultValue: 5900,
      admin: { condition: (data) => Boolean(data?.temDiagnostico) },
    },
    {
      name: "diagData",
      type: "date",
      label: "Data da contratação do diagnóstico",
      admin: { condition: (data) => Boolean(data?.temDiagnostico) },
    },
    {
      name: "diagForaPrazo",
      type: "checkbox",
      label: "Conceder abatimento mesmo fora do prazo padrão de 30 dias",
      admin: { condition: (data) => Boolean(data?.temDiagnostico) },
    },

    // ─── Bônus e cláusulas especiais ───
    { name: "bonusMesGratis", type: "checkbox", label: "Mês adicional gratuito de fechamento" },
    { name: "bonusVisitaExtra", type: "checkbox", label: "Visita presencial extra sem custo no primeiro mês" },
    { name: "bonusIndicacao", type: "checkbox", label: "Desconto por indicação (Programa Indique um Sócio)" },
    {
      name: "indicacaoPerc",
      type: "number",
      label: "Percentual de desconto na primeira mensalidade (%)",
      defaultValue: 10,
      admin: { condition: (data) => Boolean(data?.bonusIndicacao) },
    },
    { name: "bonusIsencaoMulta", type: "checkbox", label: "Isenção de multa rescisória no primeiro trimestre" },
    { name: "bonusParcelamento", type: "checkbox", label: "Parcelamento da primeira mensalidade" },
    {
      name: "parcelamentoN",
      type: "number",
      label: "Número de parcelas",
      defaultValue: 2,
      admin: { condition: (data) => Boolean(data?.bonusParcelamento) },
    },
    { name: "paragrafoLivre", type: "textarea", label: "Parágrafo adicional livre (opcional)" },

    // ─── Assinatura ───
    { name: "localAssinatura", type: "text", label: "Local de assinatura", defaultValue: "São Paulo/SP" },
    { name: "dataAssinatura", type: "date", label: "Data de assinatura (texto do contrato)" },

    // ─── Texto gerado (imutável fora de rascunho) ───
    {
      name: "contractHtml",
      type: "code",
      label: "Texto do contrato (HTML gerado)",
      admin: {
        language: "html",
        readOnly: true,
        description: "Gerado pelo servidor a partir dos campos acima. Não editável diretamente.",
      },
      access: { update: () => false },
    },
    {
      name: "contractHash",
      type: "text",
      label: "Hash SHA-256 do texto",
      admin: { position: "sidebar", readOnly: true },
      access: { update: () => false },
    },
    {
      name: "signToken",
      type: "text",
      unique: true,
      index: true,
      label: "Token de assinatura",
      admin: { position: "sidebar", readOnly: true },
      access: { update: () => false },
    },

    // ─── Evidência de assinatura (append-only, só o servidor grava) ───
    {
      type: "collapsible",
      label: "Evidência de assinatura",
      admin: { position: "sidebar" },
      fields: [
        {
          name: "signedAt",
          type: "date",
          label: "Assinado em",
          admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
          access: { update: () => false },
        },
        {
          name: "signerIp",
          type: "text",
          label: "IP do signatário",
          admin: { readOnly: true },
          access: { update: () => false },
        },
        {
          name: "signerNameConfirmed",
          type: "text",
          label: "Nome digitado na assinatura",
          admin: { readOnly: true },
          access: { update: () => false },
        },
        {
          name: "signerDocumentConfirmed",
          type: "text",
          label: "CPF/CNPJ digitado na assinatura",
          admin: { readOnly: true },
          access: { update: () => false },
        },
        {
          name: "signatureHashAtSigning",
          type: "text",
          label: "Hash recomputado no momento da assinatura",
          admin: {
            readOnly: true,
            description: "Deve ser idêntico a contractHash. Se divergir, o texto foi alterado após o envio.",
          },
          access: { update: () => false },
        },
        {
          name: "signerMismatchAcknowledged",
          type: "checkbox",
          label: "Signatário declarou representação/autorização apesar de divergência",
          admin: {
            readOnly: true,
            description:
              "Marcado quando o nome ou documento digitado na assinatura divergia do cadastrado e o signatário confirmou explicitamente ser representante legal ou pessoa autorizada.",
          },
          access: { update: () => false },
        },
        {
          name: "signedPdf",
          type: "upload",
          relationTo: "contract-documents",
          label: "Certificado de Assinatura Eletrônica (PDF)",
          admin: { readOnly: true, description: "Gerado automaticamente ao assinar. Contém o certificado e o contrato integral." },
          access: { update: () => false },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // Título automático (useAsTitle) — nome do cliente primeiro (pra ordenar
      // a lista por cliente, ver admin.defaultSort acima), depois o plano.
      ({ data }) => {
        const tipo = data?.contractType as ContractType | undefined;
        const planoNome = tipo ? PLANOS[tipo]?.nome : undefined;
        const nome = data?.tipoPessoa === "PJ" ? data?.pjRazao : data?.pfNome;
        data.title = [nome, planoNome].filter(Boolean).join(" · ") || "Contrato sem título";
        return data;
      },
      // Imutabilidade do texto gerado: uma vez que o contrato saiu de
      // "rascunho", contractHtml/contractHash não podem mais mudar por esta
      // via (mesmo que field access não bloqueasse, é uma segunda trava).
      ({ data, originalDoc, operation }) => {
        if (operation === "update" && originalDoc && originalDoc.status !== "rascunho") {
          if (typeof data.contractHtml !== "undefined") data.contractHtml = originalDoc.contractHtml;
          if (typeof data.contractHash !== "undefined") data.contractHash = originalDoc.contractHash;
        }
        return data;
      },
      // Contrato assinado é definitivo: nenhum campo pode mudar depois disso
      // (pedido do Thiago, 17/08/2026) — quem precisar de algo diferente
      // duplica o contrato (ContractSaveButton.tsx) em vez de editar este.
      // A própria rota de assinatura (api/contracts/[token]/sign) grava tudo
      // num único payload.update, então a transição "enviado" → "assinado"
      // nunca passa por aqui com originalDoc já assinado.
      //
      // Exceção estreita (achado na revisão de 17/08/2026): se a geração do
      // certificado em PDF falhar no momento da assinatura, o contrato fica
      // "assinado" sem `signedPdf` — sem essa exceção, não haveria NENHUMA
      // forma de anexar o certificado depois. Só permite passar um update
      // cujo ÚNICO campo alterado é `signedPdf` (nunca texto, valor ou
      // qualquer evidência de assinatura).
      ({ operation, originalDoc, data }) => {
        if (operation === "update" && originalDoc?.status === "assinado") {
          const changedKeys = Object.keys(data || {}).filter((k) => k !== "id");
          const isSignedPdfOnly = changedKeys.length === 1 && changedKeys[0] === "signedPdf";
          if (!isSignedPdfOnly) {
            throw new Error("Este contrato já foi assinado e não pode mais ser editado. Duplique para criar um novo.");
          }
        }
      },
    ],
    afterChange: [
      // O token de assinatura depende do id, que só existe após o insert —
      // por isso é gerado num segundo write, só na criação.
      async ({ doc, operation, req }) => {
        if (operation === "create" && !doc.signToken) {
          const signToken = generateSignToken(doc.id);
          await req.payload.update({
            collection: "contracts",
            id: doc.id,
            data: { signToken },
            req,
          });
        }
      },
    ],
  },
};

/** Extrai os campos de ContractInput a partir de um documento Contracts salvo. */
export function contractDocToInput(doc: Record<string, unknown>): ContractInput {
  return {
    contractType: doc.contractType as ContractType,
    horizonte: doc.horizonte as ContractInput["horizonte"],
    valorMensal: doc.valorMensal as number | undefined,
    projNome: doc.projNome as string | undefined,
    projDescricao: doc.projDescricao as string | undefined,
    etapas: doc.etapas as ContractInput["etapas"],
    projDuracao: doc.projDuracao as string | undefined,
    projDataEntrega: doc.projDataEntrega as string | undefined,
    projValorTotal: doc.projValorTotal as number | undefined,
    projParcelas: doc.projParcelas as number | undefined,
    projValorParcela: doc.projValorParcela as number | undefined,
    tipoPessoa: doc.tipoPessoa as ContractInput["tipoPessoa"],
    pfNome: doc.pfNome as string | undefined,
    pfCpf: doc.pfCpf as string | undefined,
    pjRazao: doc.pjRazao as string | undefined,
    pjFantasia: doc.pjFantasia as string | undefined,
    pjCnpj: doc.pjCnpj as string | undefined,
    pjRepNome: doc.pjRepNome as string | undefined,
    pjRepCpf: doc.pjRepCpf as string | undefined,
    pjRepCargo: doc.pjRepCargo as string | undefined,
    clienteEndereco: doc.clienteEndereco as string | undefined,
    clienteEmail: doc.clienteEmail as string | undefined,
    clienteTelefone: doc.clienteTelefone as string | undefined,
    dataInicio: doc.dataInicio ? String(doc.dataInicio).slice(0, 10) : undefined,
    diaVencimento: doc.diaVencimento as number | undefined,
    formaPagamento: doc.formaPagamento as string | undefined,
    clausulaReajuste: doc.clausulaReajuste as boolean | undefined,
    temDiagnostico: doc.temDiagnostico as boolean | undefined,
    diagValor: doc.diagValor as number | undefined,
    diagData: doc.diagData ? String(doc.diagData).slice(0, 10) : undefined,
    diagForaPrazo: doc.diagForaPrazo as boolean | undefined,
    bonusMesGratis: doc.bonusMesGratis as boolean | undefined,
    bonusVisitaExtra: doc.bonusVisitaExtra as boolean | undefined,
    bonusIndicacao: doc.bonusIndicacao as boolean | undefined,
    indicacaoPerc: doc.indicacaoPerc as number | undefined,
    bonusIsencaoMulta: doc.bonusIsencaoMulta as boolean | undefined,
    bonusParcelamento: doc.bonusParcelamento as boolean | undefined,
    parcelamentoN: doc.parcelamentoN as number | undefined,
    paragrafoLivre: doc.paragrafoLivre as string | undefined,
    assinaturaEletronica: true,
    localAssinatura: doc.localAssinatura as string | undefined,
    dataAssinatura: doc.dataAssinatura ? String(doc.dataAssinatura).slice(0, 10) : undefined,
  };
}

/** Gera o HTML + hash do contrato a partir dos campos de um documento. */
export function generateContractFromDoc(doc: Record<string, unknown>) {
  const input = contractDocToInput(doc);
  const { html, planoNome, nomeContratante } = buildContractHtml(input);
  const hash = hashContractText(html);
  return { html, hash, planoNome, nomeContratante };
}
