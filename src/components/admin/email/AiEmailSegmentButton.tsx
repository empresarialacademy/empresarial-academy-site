"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type SuggestedSegment = {
  id: string;
  name: string;
  description: string;
  source: string;
  pillar: string;
  scoreMin: number;
  scoreMax: number;
  createdFrom?: string;
  badge: string;
  strategy: string;
};

const SUGGESTIONS: SuggestedSegment[] = [
  {
    id: "vendas-criticas",
    name: "Leads Críticos: Vendas & Fluxo (Score < 40%)",
    description: "Leads do diagnóstico com gargalo comercial grave para oferta de Consultoria Gestão 360.",
    source: "diagnostic",
    pillar: "Fluxo de Alta Performance",
    scoreMin: 0,
    scoreMax: 40,
    badge: "🔥 Alta Conversão",
    strategy: "Disparo de sequência de impacto sobre custo da ineficiência em vendas e convite para diagnóstico 1:1.",
  },
  {
    id: "estruturacao-processos",
    name: "Média Maturidade: Estruturação & Processos (Score 40% a 70%)",
    description: "Empresas em crescimento precisando de arquitetura e liderança para destravar escala sem o dono.",
    source: "diagnostic",
    pillar: "Arquitetura do Crescimento",
    scoreMin: 40,
    scoreMax: 70,
    badge: "📈 Escala & Gestão",
    strategy: "Apresentação dos 6 pilares do método Gestão 360 com foco em descentralização e rotina.",
  },
  {
    id: "alta-maturidade-mentoria",
    name: "Alta Maturidade: Prontos para Mentoria (Score > 70%)",
    description: "Empresas com maturidade avançada e alta prontidão para Mentoria Estratégica com Thiago Marchi.",
    source: "diagnostic",
    pillar: "any",
    scoreMin: 70,
    scoreMax: 100,
    badge: "⭐ Mentoria VIP",
    strategy: "Convite executivo direto para Conselho Consultivo e aceleração estratégica de valuation.",
  },
  {
    id: "gargalo-financeiro",
    name: "Gargalo em Finanças & Gestão de Desafios",
    description: "Empresários com margens apertadas e necessidade de reestruturação de fluxo de caixa.",
    source: "diagnostic",
    pillar: "Gestão de Desafios",
    scoreMin: 0,
    scoreMax: 60,
    badge: "💰 Finanças & Caixa",
    strategy: "Cases de reestruturação financeira e recuperação de margem da metodologia EA.",
  },
  {
    id: "lideranca-equipe",
    name: "Liderança & Alinhamento de Metas (Score < 50%)",
    description: "PMEs com dificuldade de engajamento da equipe e falta de indicadores de liderança.",
    source: "diagnostic",
    pillar: "Objetivos Estratégicos",
    scoreMin: 0,
    scoreMax: 50,
    badge: "👥 Liderança & Cultura",
    strategy: "Conteúdos práticos sobre alinhamento de metas, delegação eficaz e rituais de gestão.",
  },
  {
    id: "inbound-topo-funil",
    name: "Leads Inbound de Materiais Ricos (Topo de Funil)",
    description: "Contatos que baixaram e-books e planilhas, prontos para convite do Diagnóstico DME.",
    source: "download",
    pillar: "any",
    scoreMin: 0,
    scoreMax: 100,
    badge: "🎯 Nutrição Inbound",
    strategy: "Oferta de Diagnóstico de Maturidade gratuito para avançar na jornada de fechamento.",
  },
];

export function AiEmailSegmentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function handleCreateSegment(segment: Partial<SuggestedSegment>) {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/email-segments/create-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: segment.name,
          description: segment.description || `Segmento criado com IA: ${segment.strategy || "Filtro estratégico"}`,
          source: segment.source || "any",
          pillar: segment.pillar || "any",
          scoreMin: typeof segment.scoreMin === "number" ? segment.scoreMin : 0,
          scoreMax: typeof segment.scoreMax === "number" ? segment.scoreMax : 100,
          createdFrom: segment.createdFrom || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha ao criar segmento.");
      }

      setFeedback({
        type: "success",
        text: `Segmento "${segment.name}" criado com sucesso! Redirecionando...`,
      });

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }

  function handleCustomCreate() {
    if (!customPrompt.trim()) return;
    const prompt = customPrompt.trim();
    const isVendas = /venda|comercial|fluxo/i.test(prompt);
    const isFinancas = /finan|caixa|desafio|lucro/i.test(prompt);
    const isLideranca = /lider|equipe|meta|objetivo/i.test(prompt);
    const isProcesso = /processo|arquitetura|escala/i.test(prompt);
    const isMateriais = /material|ebook|planilha|download/i.test(prompt);
    const isNewsletter = /news|artigo|blog/i.test(prompt);

    let pillar = "any";
    let source = "diagnostic";
    let scoreMin = 0;
    let scoreMax = 100;

    if (isVendas) {
      pillar = "Fluxo de Alta Performance";
      scoreMax = 50;
    } else if (isFinancas) {
      pillar = "Gestão de Desafios";
      scoreMax = 60;
    } else if (isLideranca) {
      pillar = "Objetivos Estratégicos";
      scoreMax = 55;
    } else if (isProcesso) {
      pillar = "Arquitetura do Crescimento";
      scoreMin = 40;
      scoreMax = 75;
    } else if (isMateriais) {
      source = "download";
    } else if (isNewsletter) {
      source = "newsletter";
    }

    handleCreateSegment({
      name: `IA: ${prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt}`,
      description: `Segmento gerado a partir do comando: "${prompt}"`,
      source,
      pillar,
      scoreMin,
      scoreMax,
    });
  }

  return (
    <>
      <div
        style={{
          margin: "0 0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.85rem",
          background: "var(--ea-surface-bg, #FFFFFF)",
          border: "1px solid var(--ea-card-border, #E7E2D8)",
          borderRadius: 14,
          padding: "1rem 1.4rem",
          boxShadow: "0 4px 20px -2px rgba(29, 43, 60, 0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#1D2B3C",
              border: "1.5px solid #C99A3E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C99A3E",
              fontSize: "1.1rem",
            }}
          >
            ✨
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
              Assistente de Segmentação Inteligente
            </strong>
            <span style={{ fontSize: "0.8rem", color: "var(--ea-text-secondary, #5B6472)" }}>
              Crie segmentos estratégicos orientados a conversão com sugestões de IA baseadas nos 6 pilares do DME.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: "linear-gradient(180deg, #E5CA8C 0%, #C99A3E 100%)",
            color: "#0F1722",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: "0.82rem",
            border: "none",
            borderRadius: 8,
            padding: "0.65rem 1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            boxShadow: "0 2px 10px rgba(201, 154, 62, 0.25)",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <span>✨ Criar Segmento com IA</span>
        </button>
      </div>

      {/* Modal de Sugestões de Segmentos */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 34, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => !loading && setIsOpen(false)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E7E2D8",
              boxShadow: "0 25px 60px -15px rgba(29, 43, 60, 0.25)",
              maxWidth: 860,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#1D2B3C",
                    border: "2px solid #C99A3E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C99A3E",
                    fontSize: "1.3rem",
                  }}
                >
                  ✨
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#C99A3E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Inteligência de Audiência EA
                  </span>
                  <h2 style={{ margin: "0.2rem 0 0", fontSize: "1.35rem", fontWeight: 800, color: "#1D2B3C", fontFamily: "'Sora', sans-serif" }}>
                    Sugestões de Novos Segmentos de E-mail
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#5B6472",
                  cursor: "pointer",
                  padding: "0.2rem 0.5rem",
                }}
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                style={{
                  padding: "0.85rem 1.2rem",
                  borderRadius: 10,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  background: feedback.type === "success" ? "rgba(63, 125, 88, 0.12)" : "rgba(178, 59, 59, 0.12)",
                  color: feedback.type === "success" ? "#3F7D58" : "#B23B3B",
                  border: `1px solid ${feedback.type === "success" ? "#3F7D58" : "#B23B3B"}`,
                }}
              >
                {feedback.text}
              </div>
            )}

            {/* Prompt Customizado */}
            <div
              style={{
                background: "#F8F6F2",
                border: "1px solid #E7E2D8",
                borderRadius: 12,
                padding: "1.1rem 1.3rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D2B3C", fontFamily: "'Sora', sans-serif" }}>
                🎯 Descreva o público que você quer atingir (Comando de IA):
              </label>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Ex.: Quero empresários com problemas de equipe captados nos últimos 60 dias..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: 280,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #D1D5DB",
                    background: "#FFFFFF",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomCreate();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCustomCreate}
                  disabled={loading || !customPrompt.trim()}
                  style={{
                    background: "#1D2B3C",
                    color: "#FFFFFF",
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    border: "1px solid #C99A3E",
                    borderRadius: 8,
                    padding: "0.6rem 1.1rem",
                    cursor: loading || !customPrompt.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !customPrompt.trim() ? 0.6 : 1,
                  }}
                >
                  {loading ? "Criando..." : "Gerar Segmento"}
                </button>
              </div>
            </div>

            {/* Lista de Sugestões Pré-calibradas */}
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1D2B3C", fontFamily: "'Sora', sans-serif", marginBottom: "0.85rem" }}>
                💡 Modelos Recomendados de Alta Performance Comercial:
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {SUGGESTIONS.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: isSelected ? "#FAF8F5" : "#FFFFFF",
                        border: `1.5px solid ${isSelected ? "#C99A3E" : "#E7E2D8"}`,
                        borderRadius: 12,
                        padding: "1.1rem 1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.55rem",
                        boxShadow: isSelected ? "0 4px 16px rgba(201, 154, 62, 0.15)" : "0 2px 8px rgba(29, 43, 60, 0.03)",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(201, 154, 62, 0.15)",
                            color: "#996D1E",
                          }}
                        >
                          {item.badge}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#5B6472", fontWeight: 600 }}>
                          Score: {item.scoreMin}% a {item.scoreMax}%
                        </span>
                      </div>

                      <strong style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1D2B3C", fontFamily: "'Sora', sans-serif" }}>
                        {item.name}
                      </strong>

                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#5B6472", lineHeight: 1.4 }}>
                        {item.description}
                      </p>

                      <div style={{ background: "#F3EFE8", borderRadius: 6, padding: "0.45rem 0.65rem", fontSize: "0.74rem", color: "#1D2B3C" }}>
                        <strong>Estratégia:</strong> {item.strategy}
                      </div>

                      <div style={{ marginTop: "auto", paddingTop: "0.4rem", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateSegment(item);
                          }}
                          style={{
                            background: "linear-gradient(180deg, #E5CA8C 0%, #C99A3E 100%)",
                            color: "#0F1722",
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            border: "none",
                            borderRadius: 6,
                            padding: "0.45rem 0.9rem",
                            cursor: loading ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          {loading && selectedId === item.id ? "Criando..." : "Criar Este Segmento ↗"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

