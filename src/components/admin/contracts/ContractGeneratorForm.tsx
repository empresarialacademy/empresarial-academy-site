"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildContractHtml,
  formatarCPF,
  formatarCNPJ,
  formatarTelefone,
  validarCPF,
  validarCNPJ,
  validarEmail,
  validarTelefone,
  moeda,
  hojeISO,
  PLANOS,
  type ContractInput,
  type ContractType,
  type Etapa,
} from "@/lib/contract-text";

/**
 * Formulário do Gerador de Contratos (EA HUB), espelhando campo a campo
 * `Gerador_Contratos_Empresarial_Academy.html` (a fonte da verdade das
 * cláusulas), mas gravando num registro `Contracts` via API interna
 * (POST /api/contracts) em vez de só renderizar no navegador.
 *
 * A prévia usa `buildContractHtml` diretamente (a mesma lib pura usada no
 * servidor) — o que o Thiago vê aqui é byte a byte o que vai ser salvo e
 * hasheado ao enviar.
 */

const card: React.CSSProperties = {
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 6,
  padding: "1rem 1.2rem",
  marginBottom: "1rem",
};
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, margin: "10px 0 4px" };
const input: React.CSSProperties = {
  width: "100%",
  padding: "7px 8px",
  border: "1px solid var(--theme-elevation-200)",
  background: "var(--theme-input-bg, transparent)",
  fontSize: 13,
};
const errStyle: React.CSSProperties = { fontSize: 11, color: "#A32626", margin: "3px 0 0" };
const legend: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px" };
const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const inlineLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13, margin: "8px 0" };

const EMPTY_ETAPA: Etapa = { nome: "", prazo: "", descricao: "" };

const initialState: ContractInput = {
  contractType: "mentoria",
  horizonte: "trimestral",
  valorMensal: PLANOS.mentoria.horizontes.trimestral.valor,
  etapas: [EMPTY_ETAPA],
  projParcelas: 1,
  tipoPessoa: "PF",
  dataInicio: hojeISO(),
  diaVencimento: 10,
  formaPagamento: "PIX",
  clausulaReajuste: true,
  diagValor: 5900,
  indicacaoPerc: 10,
  parcelamentoN: 2,
  localAssinatura: "São Paulo/SP",
  dataAssinatura: hojeISO(),
  assinaturaEletronica: true,
};

export function ContractGeneratorForm() {
  const [form, setForm] = useState<ContractInput>(initialState);
  const [contractId, setContractId] = useState<number | string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState("Preencha os dados. A minuta é atualizada automaticamente.");
  const [saving, setSaving] = useState<"idle" | "draft" | "send">("idle");
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const set = <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Preenche o valor de tabela ao trocar tipo de contrato/horizonte (igual
  // a preencherValorPadrao() no arquivo de referência).
  useEffect(() => {
    const type = form.contractType;
    if (type === "projeto") return;
    const plano = PLANOS[type];
    const valor = "horizontes" in plano ? plano.horizontes[form.horizonte || "trimestral"].valor : plano.valorFixo;
    set("valorMensal", valor);
  }, [form.contractType, form.horizonte]);

  // Auto-cálculo da parcela do projeto.
  useEffect(() => {
    if (form.contractType !== "projeto") return;
    const total = form.projValorTotal || 0;
    const n = form.projParcelas || 1;
    set("projValorParcela", Math.round((total / n) * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.projValorTotal, form.projParcelas]);

  const diagDias = useMemo(() => {
    if (!form.diagData || !form.dataInicio) return null;
    return Math.round((new Date(form.dataInicio).getTime() - new Date(form.diagData).getTime()) / 86400000);
  }, [form.diagData, form.dataInicio]);

  const preview = useMemo(() => buildContractHtml(form), [form]);

  function validate(forSend: boolean): boolean {
    const errs: Record<string, string> = {};
    if (!form.clienteEmail || !validarEmail(form.clienteEmail)) errs.clienteEmail = "E-mail inválido.";
    if (form.clienteTelefone && !validarTelefone(form.clienteTelefone)) errs.clienteTelefone = "Telefone precisa ter 10 ou 11 números.";
    if (form.tipoPessoa === "PF") {
      if (form.pfCpf && !validarCPF(form.pfCpf)) errs.pfCpf = "CPF inválido.";
      if (forSend && !(form.pfCpf && validarCPF(form.pfCpf))) errs.pfCpf = "CPF obrigatório e válido para enviar.";
    } else {
      if (form.pjCnpj && !validarCNPJ(form.pjCnpj)) errs.pjCnpj = "CNPJ inválido.";
      if (forSend && !(form.pjCnpj && validarCNPJ(form.pjCnpj))) errs.pjCnpj = "CNPJ obrigatório e válido para enviar.";
      if (form.pjRepCpf && !validarCPF(form.pjRepCpf)) errs.pjRepCpf = "CPF do representante inválido.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(action: "draft" | "send") {
    if (!validate(action === "send")) {
      setStatusMsg("Corrija os campos destacados antes de continuar.");
      return;
    }
    setSaving(action);
    setStatusMsg(action === "send" ? "Enviando para assinatura..." : "Salvando rascunho...");
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: contractId ?? undefined, action }),
      });
      const json = await res.json();
      if (!res.ok || json.error || json.errors) {
        setErrors(json.errors || {});
        setStatusMsg("Não foi possível salvar. Confira os campos destacados.");
        setSaving("idle");
        return;
      }
      setContractId(json.id);
      if (action === "send") {
        setSentUrl(json.signUrl || null);
        setStatusMsg(
          json.email?.ok
            ? "Contrato enviado. O cliente recebeu o link de assinatura por e-mail."
            : "Contrato enviado, mas o e-mail pode não ter saído (confira o log de envios em Marketing → Envios de e-mail).",
        );
      } else {
        setStatusMsg("Rascunho salvo.");
      }
    } catch {
      setStatusMsg("Erro de rede ao salvar. Tente novamente.");
    }
    setSaving("idle");
  }

  const etapas = form.etapas && form.etapas.length ? form.etapas : [EMPTY_ETAPA];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: "1.5rem", alignItems: "start" }}>
      {/* ───────── Coluna de formulário ───────── */}
      <div>
        <fieldset style={card}>
          <legend style={legend}>1. Tipo de contrato</legend>
          <label style={label}>Produto contratado</label>
          <select style={input} value={form.contractType} onChange={(e) => set("contractType", e.target.value as ContractType)}>
            <option value="mentoria">Mentoria Executiva Gestão 360</option>
            <option value="consultoria">Consultoria de Negócios Hands-On Gestão 360</option>
            <option value="conselho">Conselho Gestão 360</option>
            <option value="diagnostico">Diagnóstico Executivo 360 (avulso)</option>
            <option value="projeto">Projeto Personalizado</option>
          </select>

          {(form.contractType === "mentoria" || form.contractType === "consultoria") && (
            <>
              <label style={label}>Horizonte</label>
              <select style={input} value={form.horizonte} onChange={(e) => set("horizonte", e.target.value as ContractInput["horizonte"])}>
                <option value="trimestral">Trimestral (3 meses)</option>
                <option value="semestral">Semestral (6 meses)</option>
                <option value="anual">Anual (12 meses)</option>
              </select>
            </>
          )}

          {form.contractType !== "projeto" && (
            <>
              <label style={label}>Valor mensal / único (R$, editável)</label>
              <input
                style={input}
                type="number"
                step="0.01"
                value={form.valorMensal ?? ""}
                onChange={(e) => set("valorMensal", Number(e.target.value))}
              />
              <p style={{ fontSize: 11, color: "var(--theme-elevation-500)" }}>Valor de tabela: {moeda(form.valorMensal)}. Ajuste se houver negociação diferente.</p>
            </>
          )}
        </fieldset>

        {form.contractType === "projeto" && (
          <fieldset style={card}>
            <legend style={legend}>1b. Detalhes do projeto personalizado</legend>
            <label style={label}>Nome do projeto</label>
            <input style={input} type="text" value={form.projNome || ""} onChange={(e) => set("projNome", e.target.value)} />
            <label style={label}>Escopo geral</label>
            <textarea style={{ ...input, minHeight: 60 }} value={form.projDescricao || ""} onChange={(e) => set("projDescricao", e.target.value)} />

            <label style={label}>Etapas do projeto</label>
            {etapas.map((etapa, i) => (
              <div key={i} style={{ border: "1px solid var(--theme-elevation-150)", padding: 10, marginBottom: 8 }}>
                <div style={row2}>
                  <input
                    style={input}
                    placeholder="Nome da etapa"
                    value={etapa.nome}
                    onChange={(e) => {
                      const next = [...etapas];
                      next[i] = { ...next[i], nome: e.target.value };
                      set("etapas", next);
                    }}
                  />
                  <input
                    style={input}
                    placeholder="Prazo (ex: 2 semanas)"
                    value={etapa.prazo}
                    onChange={(e) => {
                      const next = [...etapas];
                      next[i] = { ...next[i], prazo: e.target.value };
                      set("etapas", next);
                    }}
                  />
                </div>
                <textarea
                  style={{ ...input, marginTop: 8, minHeight: 40 }}
                  placeholder="Entrega desta etapa"
                  value={etapa.descricao}
                  onChange={(e) => {
                    const next = [...etapas];
                    next[i] = { ...next[i], descricao: e.target.value };
                    set("etapas", next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => set("etapas", etapas.filter((_, idx) => idx !== i).length ? etapas.filter((_, idx) => idx !== i) : [EMPTY_ETAPA])}
                  style={{ background: "none", border: "none", color: "#A32626", fontSize: 11, textDecoration: "underline", cursor: "pointer", padding: "6px 0 0" }}
                >
                  Remover etapa
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set("etapas", [...etapas, { ...EMPTY_ETAPA }])} style={{ fontSize: 12 }}>
              + Adicionar etapa
            </button>

            <div style={{ ...row2, marginTop: 14 }}>
              <div>
                <label style={label}>Duração total</label>
                <input style={input} type="text" placeholder="Ex: 12 semanas" value={form.projDuracao || ""} onChange={(e) => set("projDuracao", e.target.value)} />
              </div>
              <div>
                <label style={label}>Entrega final prevista</label>
                <input style={input} type="date" value={form.projDataEntrega || ""} onChange={(e) => set("projDataEntrega", e.target.value)} />
              </div>
            </div>
            <div style={row2}>
              <div>
                <label style={label}>Valor total do projeto (R$)</label>
                <input style={input} type="number" step="0.01" value={form.projValorTotal ?? ""} onChange={(e) => set("projValorTotal", Number(e.target.value))} />
              </div>
              <div>
                <label style={label}>Número de parcelas</label>
                <input style={input} type="number" min={1} value={form.projParcelas ?? 1} onChange={(e) => set("projParcelas", Number(e.target.value))} />
              </div>
            </div>
            <label style={label}>Valor de cada parcela (R$, editável)</label>
            <input style={input} type="number" step="0.01" value={form.projValorParcela ?? ""} onChange={(e) => set("projValorParcela", Number(e.target.value))} />
          </fieldset>
        )}

        <fieldset style={card}>
          <legend style={legend}>2. Contratante</legend>
          <div style={{ display: "flex", gap: 14, margin: "6px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13 }}>
              <input type="radio" checked={form.tipoPessoa === "PF"} onChange={() => set("tipoPessoa", "PF")} /> Física
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13 }}>
              <input type="radio" checked={form.tipoPessoa === "PJ"} onChange={() => set("tipoPessoa", "PJ")} /> Jurídica
            </label>
          </div>

          {form.tipoPessoa === "PF" ? (
            <>
              <label style={label}>Nome completo</label>
              <input style={input} type="text" value={form.pfNome || ""} onChange={(e) => set("pfNome", e.target.value)} />
              <label style={label}>CPF</label>
              <input
                style={input}
                type="text"
                maxLength={14}
                value={form.pfCpf || ""}
                onChange={(e) => set("pfCpf", formatarCPF(e.target.value))}
              />
              {errors.pfCpf && <p style={errStyle}>{errors.pfCpf}</p>}
            </>
          ) : (
            <>
              <label style={label}>Razão social</label>
              <input style={input} type="text" value={form.pjRazao || ""} onChange={(e) => set("pjRazao", e.target.value)} />
              <label style={label}>Nome fantasia (opcional)</label>
              <input style={input} type="text" value={form.pjFantasia || ""} onChange={(e) => set("pjFantasia", e.target.value)} />
              <label style={label}>CNPJ</label>
              <input
                style={input}
                type="text"
                maxLength={18}
                value={form.pjCnpj || ""}
                onChange={(e) => set("pjCnpj", formatarCNPJ(e.target.value))}
              />
              {errors.pjCnpj && <p style={errStyle}>{errors.pjCnpj}</p>}
              <label style={label}>Nome do representante legal</label>
              <input style={input} type="text" value={form.pjRepNome || ""} onChange={(e) => set("pjRepNome", e.target.value)} />
              <div style={row2}>
                <div>
                  <label style={label}>CPF do representante</label>
                  <input
                    style={input}
                    type="text"
                    maxLength={14}
                    value={form.pjRepCpf || ""}
                    onChange={(e) => set("pjRepCpf", formatarCPF(e.target.value))}
                  />
                  {errors.pjRepCpf && <p style={errStyle}>{errors.pjRepCpf}</p>}
                </div>
                <div>
                  <label style={label}>Cargo</label>
                  <input style={input} type="text" placeholder="Sócio-administrador" value={form.pjRepCargo || ""} onChange={(e) => set("pjRepCargo", e.target.value)} />
                </div>
              </div>
            </>
          )}

          <label style={label}>Endereço completo</label>
          <textarea style={{ ...input, minHeight: 50 }} value={form.clienteEndereco || ""} onChange={(e) => set("clienteEndereco", e.target.value)} />
          <div style={row2}>
            <div>
              <label style={label}>E-mail</label>
              <input style={input} type="text" value={form.clienteEmail || ""} onChange={(e) => set("clienteEmail", e.target.value)} />
              {errors.clienteEmail && <p style={errStyle}>{errors.clienteEmail}</p>}
            </div>
            <div>
              <label style={label}>Telefone</label>
              <input
                style={input}
                type="text"
                maxLength={15}
                value={form.clienteTelefone || ""}
                onChange={(e) => set("clienteTelefone", formatarTelefone(e.target.value))}
              />
              {errors.clienteTelefone && <p style={errStyle}>{errors.clienteTelefone}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset style={card}>
          <legend style={legend}>3. Datas e pagamento</legend>
          <div style={row2}>
            <div>
              <label style={label}>Data de início da vigência</label>
              <input style={input} type="date" value={form.dataInicio || ""} onChange={(e) => set("dataInicio", e.target.value)} />
            </div>
            <div>
              <label style={label}>Dia de vencimento mensal</label>
              <input style={input} type="number" min={1} max={28} value={form.diaVencimento ?? 10} onChange={(e) => set("diaVencimento", Number(e.target.value))} />
            </div>
          </div>
          <label style={label}>Forma de pagamento</label>
          <select style={input} value={form.formaPagamento} onChange={(e) => set("formaPagamento", e.target.value)}>
            {["PIX", "Boleto bancário", "Transferência bancária (TED/DOC)", "Cartão de crédito recorrente"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <label style={inlineLabel}>
            <input type="checkbox" checked={Boolean(form.clausulaReajuste)} onChange={(e) => set("clausulaReajuste", e.target.checked)} />
            Incluir cláusula de reajuste anual por IPCA em caso de renovação
          </label>
        </fieldset>

        {(form.contractType === "mentoria" || form.contractType === "consultoria") && (
          <fieldset style={card}>
            <legend style={legend}>4. Abatimento do Diagnóstico Executivo 360</legend>
            <label style={inlineLabel}>
              <input type="checkbox" checked={Boolean(form.temDiagnostico)} onChange={(e) => set("temDiagnostico", e.target.checked)} />
              Cliente já contratou e pagou o Diagnóstico Executivo 360
            </label>
            {form.temDiagnostico && (
              <>
                <div style={row2}>
                  <div>
                    <label style={label}>Valor pago no diagnóstico (R$)</label>
                    <input style={input} type="number" step="0.01" value={form.diagValor ?? 5900} onChange={(e) => set("diagValor", Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={label}>Data da contratação do diagnóstico</label>
                    <input style={input} type="date" value={form.diagData || ""} onChange={(e) => set("diagData", e.target.value)} />
                  </div>
                </div>
                {diagDias !== null && diagDias > 30 && (
                  <>
                    <p style={{ background: "#FBEEE0", color: "#8A4B12", border: "1px solid #E6C79C", padding: "8px 10px", fontSize: 12, marginTop: 8 }}>
                      Atenção: {diagDias} dias entre a contratação do diagnóstico e o início deste contrato. Fora do
                      prazo padrão de 30 dias. Confirme com o cliente antes de conceder o abatimento.
                    </p>
                    <label style={inlineLabel}>
                      <input type="checkbox" checked={Boolean(form.diagForaPrazo)} onChange={(e) => set("diagForaPrazo", e.target.checked)} />
                      Conceder o abatimento mesmo fora do prazo padrão de 30 dias, por liberalidade da CONTRATADA
                    </label>
                  </>
                )}
              </>
            )}
          </fieldset>
        )}

        <fieldset style={card}>
          <legend style={legend}>5. Bônus, exceções e cláusulas especiais</legend>
          <label style={inlineLabel}>
            <input type="checkbox" checked={Boolean(form.bonusMesGratis)} onChange={(e) => set("bonusMesGratis", e.target.checked)} />
            Mês adicional gratuito de fechamento
          </label>
          <label style={inlineLabel}>
            <input type="checkbox" checked={Boolean(form.bonusVisitaExtra)} onChange={(e) => set("bonusVisitaExtra", e.target.checked)} />
            Visita presencial extra sem custo no primeiro mês
          </label>
          <label style={inlineLabel}>
            <input type="checkbox" checked={Boolean(form.bonusIndicacao)} onChange={(e) => set("bonusIndicacao", e.target.checked)} />
            Desconto por indicação (Programa Indique um Sócio)
          </label>
          {form.bonusIndicacao && (
            <>
              <label style={label}>Percentual de desconto na primeira mensalidade (%)</label>
              <input style={input} type="number" min={1} max={100} value={form.indicacaoPerc ?? 10} onChange={(e) => set("indicacaoPerc", Number(e.target.value))} />
            </>
          )}
          {form.contractType !== "diagnostico" && form.contractType !== "projeto" && (
            <label style={inlineLabel}>
              <input type="checkbox" checked={Boolean(form.bonusIsencaoMulta)} onChange={(e) => set("bonusIsencaoMulta", e.target.checked)} />
              Isenção de multa rescisória no primeiro trimestre
            </label>
          )}
          <label style={inlineLabel}>
            <input type="checkbox" checked={Boolean(form.bonusParcelamento)} onChange={(e) => set("bonusParcelamento", e.target.checked)} />
            Parcelamento da primeira mensalidade
          </label>
          {form.bonusParcelamento && (
            <>
              <label style={label}>Número de parcelas</label>
              <input style={input} type="number" min={2} max={12} value={form.parcelamentoN ?? 2} onChange={(e) => set("parcelamentoN", Number(e.target.value))} />
            </>
          )}
          <label style={label}>Parágrafo adicional livre (opcional)</label>
          <textarea
            style={{ ...input, minHeight: 60 }}
            placeholder="Digite aqui qualquer exceção ou condição específica deste contrato que não esteja coberta acima."
            value={form.paragrafoLivre || ""}
            onChange={(e) => set("paragrafoLivre", e.target.value)}
          />
        </fieldset>

        <fieldset style={card}>
          <legend style={legend}>6. Assinatura</legend>
          <p style={{ fontSize: 12, color: "var(--theme-elevation-500)" }}>
            Este contrato é sempre firmado por assinatura eletrônica neste fluxo (o link enviado ao cliente leva à
            página /assinar com a Cláusula de Assinatura Eletrônica).
          </p>
          <div style={row2}>
            <div>
              <label style={label}>Local de assinatura</label>
              <input style={input} type="text" value={form.localAssinatura || ""} onChange={(e) => set("localAssinatura", e.target.value)} />
            </div>
            <div>
              <label style={label}>Data (texto do contrato)</label>
              <input style={input} type="date" value={form.dataAssinatura || ""} onChange={(e) => set("dataAssinatura", e.target.value)} />
            </div>
          </div>
        </fieldset>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <button type="button" disabled={saving !== "idle"} onClick={() => submit("draft")}>
            {saving === "draft" ? "Salvando..." : "Salvar rascunho"}
          </button>
          <button type="button" disabled={saving !== "idle"} onClick={() => submit("send")} style={{ background: "#C1A160", borderColor: "#C1A160", color: "#1D2B3C" }}>
            {saving === "send" ? "Enviando..." : "Gerar e enviar para assinatura"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--theme-elevation-500)", marginTop: 8 }}>{statusMsg}</p>
        {sentUrl && (
          <p style={{ fontSize: 12 }}>
            Link de assinatura: <a href={sentUrl} target="_blank" rel="noreferrer">{sentUrl}</a>
          </p>
        )}
      </div>

      {/* ───────── Coluna de prévia ───────── */}
      <div style={{ position: "sticky", top: "1rem" }}>
        <div
          style={{
            background: "#fff",
            color: "#111",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 6,
            padding: "44px 48px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 13,
            lineHeight: 1.6,
            maxHeight: "calc(100vh - 4rem)",
            overflowY: "auto",
          }}
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      </div>
    </div>
  );
}
