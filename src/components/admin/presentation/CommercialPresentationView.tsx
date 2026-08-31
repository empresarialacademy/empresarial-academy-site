"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SystemLogo } from "@/components/admin/brand/SystemLogo";

type PillarData = {
  key: string;
  name: string;
  desc: string;
  tip: string;
  pct: number;
  label: string;
  hasScore: boolean;
};

type DiagnosticData = {
  leadId: string | number;
  diagnosticId: string;
  name: string;
  email: string;
  company: string;
  whatsapp: string;
  instagram?: string;
  cargo: string;
  faturamento: string;
  createdAt: string;
  overall: { pct: number; label: string };
  pillars: PillarData[];
  weakestPillar: PillarData;
};

type RecentItem = {
  id: string | number;
  diagnosticId: string;
  name: string;
  company: string;
  createdAt: string;
  overallScore: string;
};

const SLIDES_COUNT = 6;

function getLevelColor(pct: number): string {
  if (pct <= 20) return "#B23B3B";
  if (pct <= 40) return "#C7892B";
  if (pct <= 60) return "#C1A160";
  if (pct <= 80) return "#2E7D5B";
  return "#1D2B3C";
}

export function CommercialPresentationView() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFetch = useCallback(async (idToFetch: string) => {
    const trimmed = idToFetch.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/diagnostic/lookup?id=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Diagnóstico não encontrado.");
        setLoading(false);
        return;
      }
      setData(json.data);
      setSearchId(json.data.diagnosticId);
      setCurrentSlide(0);
    } catch {
      setError("Erro ao carregar os dados do diagnóstico.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar lista de diagnósticos recentes
  useEffect(() => {
    fetch("/api/diagnostic/lookup?list=recent")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.items)) {
          setRecentItems(res.items);
          if (res.items.length > 0) {
            handleFetch(res.items[0].diagnosticId || String(res.items[0].id));
          }
        }
      })
      .catch(() => {
        // no-op
      });
  }, [handleFetch]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < SLIDES_COUNT - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Atalhos de teclado (setas esquerda/direita)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    const el = document.getElementById("presentation-deck-container");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const clientName = data?.name || "Nome do Cliente";
  const clientCompany = data?.company || "Empresa Cliente";
  const diagCode = data?.diagnosticId || "EA-DIAG-2026-DEMO";
  const overallPct = data?.overall?.pct ?? 65;
  const overallLabel = data?.overall?.label || "Em Desenvolvimento";
  const weakest = data?.weakestPillar;

  return (
    <div style={{ padding: isFullscreen ? "0" : "24px 32px", maxWidth: 1300, margin: "0 auto", color: "#1D2B3C" }}>
      {/* Barra Superior / Controles (escondida no modo print) */}
      <div
        className="no-print"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E7E2D8",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/eahub"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#5B6472",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ← Voltar ao EA HUB
          </Link>
          <span style={{ color: "#D9DCE1" }}>|</span>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1D2B3C" }}>
            Apresentador Comercial Gestão 360
          </span>
        </div>

        {/* Busca por ID do DME */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetch(searchId);
          }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Digite o ID do DME (ex: EA-DIAG-2026-X8K2M)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #D9DCE1",
              borderRadius: 6,
              fontSize: "0.85rem",
              minWidth: 280,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#C1A160",
              color: "#1D2B3C",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {loading ? "Carregando..." : "Carregar Apresentação"}
          </button>
        </form>

        {/* Dropdown de recentes & Ações */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {recentItems.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleFetch(e.target.value);
              }}
              value={data?.diagnosticId || ""}
              style={{
                padding: "8px 10px",
                border: "1px solid #D9DCE1",
                borderRadius: 6,
                fontSize: "0.82rem",
                color: "#1D2B3C",
                background: "#F7F5F1",
                maxWidth: 240,
              }}
            >
              <option value="">Selecionar Diagnóstico...</option>
              {recentItems.map((item) => (
                <option key={String(item.id)} value={item.diagnosticId || String(item.id)}>
                  {item.name} ({item.company || item.diagnosticId})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Apresentação em Tela Cheia (F11)"
            style={{
              background: "#1D2B3C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⛶ Tela Cheia
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Exportar para PDF ou Imprimir"
            style={{
              background: "#FFFFFF",
              color: "#1D2B3C",
              border: "1px solid #D9DCE1",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🖨️ PDF
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#FDE8E8",
            border: "1px solid #F8B4B4",
            color: "#9B1C1C",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: "0.88rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Container Principal da Apresentação */}
      <div
        id="presentation-deck-container"
        style={{
          background: "#15191F",
          borderRadius: isFullscreen ? 0 : 16,
          padding: isFullscreen ? "20px 40px" : "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: isFullscreen ? "100vh" : 640,
          position: "relative",
          boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
        }}
      >
        {/* Slide Canvas 16:9 */}
        <div
          style={{
            width: "100%",
            maxWidth: 1040,
            aspectRatio: "16 / 9",
            background: currentSlide === 0 ? "#1D2B3C" : "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            transition: "all 0.25s ease",
          }}
        >
          {/* Header do Slide */}
          <div
            style={{
              padding: "16px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: currentSlide === 0 ? "1px solid rgba(193, 161, 96, 0.25)" : "1px solid #E7E2D8",
              background: currentSlide === 0 ? "rgba(0,0,0,0.15)" : "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SystemLogo systemName="Empresarial Academy" size={24} />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: currentSlide === 0 ? "#C1A160" : "#5B6472",
                  background: currentSlide === 0 ? "rgba(193,161,96,0.15)" : "#EFEFEF",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                MÉTODO GESTÃO 360
              </span>
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: currentSlide === 0 ? "#C1A160" : "#1D2B3C",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{clientCompany}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ fontFamily: "monospace" }}>{diagCode}</span>
            </div>
          </div>

          {/* Conteúdo Dinâmico do Slide */}
          <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
            {/* SLIDE 1: CAPA EXECUTIVA */}
            {currentSlide === 0 && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      background: "rgba(193, 161, 96, 0.2)",
                      border: "1px solid #C1A160",
                      color: "#C1A160",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ★ DIAGNÓSTICO ESTRATÉGICO EXECUTIVO
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "2.4rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    lineHeight: 1.15,
                    margin: "0 0 14px",
                  }}
                >
                  Raio-X de Maturidade Empresarial &amp; Plano de Escala
                </h1>
                <p style={{ fontSize: "1.15rem", color: "#C1A160", margin: "0 0 28px", fontWeight: 600 }}>
                  Apresentação Personalizada para {clientName} · {clientCompany}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(193, 161, 96, 0.3)",
                    borderRadius: 10,
                    padding: "16px 20px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#8A93A0", textTransform: "uppercase", fontWeight: 700 }}>
                      Cargo / Decisor
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", marginTop: 2 }}>
                      {data?.cargo || "Sócio / Diretor"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#8A93A0", textTransform: "uppercase", fontWeight: 700 }}>
                      Faturamento Declarado
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", marginTop: 2 }}>
                      {data?.faturamento || "Não informado"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#8A93A0", textTransform: "uppercase", fontWeight: 700 }}>
                      Data do Diagnóstico
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#C1A160", marginTop: 2 }}>
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: NÍVEL ATUAL DE MATURIDADE */}
            {currentSlide === 1 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C1A160", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Visão Consolidada
                  </div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1D2B3C", margin: "4px 0 16px" }}>
                    Posicionamento Atual de Maturidade: {overallPct}%
                  </h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "190px 1fr",
                    gap: 24,
                    alignItems: "center",
                    background: "#F7F5F1",
                    borderRadius: 12,
                    padding: "20px 24px",
                    border: "1px solid #E7E2D8",
                  }}
                >
                  <div style={{ textAlign: "center", borderRight: "1px solid #D9DCE1", paddingRight: 20 }}>
                    <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "#C1A160", lineHeight: 1 }}>
                      {overallPct}%
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        background: getLevelColor(overallPct),
                        color: "#FFFFFF",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                    >
                      {overallLabel}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem", color: "#1D2B3C" }}>
                      O que esse estágio significa para o negócio:
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#5B6472", lineHeight: 1.5 }}>
                      A empresa já tem validação de mercado, mas enfrenta o clássico desafio do crescimento: processos concentrados no dono, metas pouco alinhadas e falta de indicadores de sanidade para tomada de decisão sem sobrecarga.
                    </p>
                  </div>
                </div>

                {/* Escala de maturidade comparativa */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 12 }}>
                  {[
                    { lvl: "Iniciante", range: "0–20%", desc: "Operação Caótica" },
                    { lvl: "Em Desenv.", range: "21–40%", desc: "Centralizado no Dono" },
                    { lvl: "Intermediário", range: "41–60%", desc: "Crescimento Desordenado" },
                    { lvl: "Estruturado", range: "61–80%", desc: "Processos e Alçadas" },
                    { lvl: "Excelência", range: "81–100%", desc: "Escala Previsível" },
                  ].map((stg) => {
                    const isCurrent = overallLabel.toLowerCase().includes(stg.lvl.toLowerCase().slice(0, 5));
                    return (
                      <div
                        key={stg.lvl}
                        style={{
                          background: isCurrent ? "rgba(193, 161, 96, 0.15)" : "#FFFFFF",
                          border: isCurrent ? "2px solid #C1A160" : "1px solid #E7E2D8",
                          borderRadius: 8,
                          padding: "8px 10px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: isCurrent ? "#C1A160" : "#1D2B3C" }}>
                          {stg.lvl}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#8A93A0" }}>{stg.range}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLIDE 3: OS 6 PILARES DA GESTÃO 360 */}
            {currentSlide === 2 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C1A160", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Raio-X Detalhado
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D2B3C", margin: "4px 0 12px" }}>
                    Desempenho nos 6 Pilares da Gestão 360
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {data?.pillars.map((p) => {
                    const isWeak = weakest && weakest.name === p.name;
                    const color = getLevelColor(p.pct);
                    return (
                      <div
                        key={p.key}
                        style={{
                          background: isWeak ? "rgba(178, 59, 59, 0.04)" : "#FAFAFA",
                          border: isWeak ? "1.5px solid #B23B3B" : "1px solid #E7E2D8",
                          borderRadius: 8,
                          padding: "12px 14px",
                          position: "relative",
                        }}
                      >
                        {isWeak && (
                          <span
                            style={{
                              position: "absolute",
                              top: -7,
                              right: 8,
                              background: "#B23B3B",
                              color: "#FFFFFF",
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            Gargalo
                          </span>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D2B3C" }}>{p.name}</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color }}>{p.hasScore ? `${p.pct}%` : "—"}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "#E7E2D8", overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ height: "100%", width: `${Math.max(3, p.pct)}%`, background: color }} />
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#5B6472", lineHeight: 1.3 }}>
                          {p.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLIDE 4: DIAGNÓSTICO CLÍNICO DO GARGALO */}
            {currentSlide === 3 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#B23B3B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Diagnóstico Clínico &amp; Ponto Crítico
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D2B3C", margin: "4px 0 14px" }}>
                    Onde a empresa perde dinheiro e energia hoje
                  </h2>
                </div>

                <div
                  style={{
                    background: "rgba(178, 59, 59, 0.05)",
                    border: "1.5px solid rgba(178, 59, 59, 0.35)",
                    borderRadius: 12,
                    padding: "20px 24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>🚨</span>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#B23B3B", fontWeight: 800 }}>
                      Gargalo Principal: {weakest?.name || "Operação Centralizada"} ({weakest?.pct ?? 0}% — {weakest?.label || "Crítico"})
                    </h3>
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: "0.9rem", color: "#1D2B3C", lineHeight: 1.5 }}>
                    <strong>Prescrição Metodológica:</strong> {weakest?.tip || "Mapeamento imediato de processos e definição de rotinas e alçadas."}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      background: "#FFFFFF",
                      border: "1px solid rgba(178, 59, 59, 0.2)",
                      borderRadius: 8,
                      padding: "12px 16px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "#B23B3B", fontWeight: 700, textTransform: "uppercase" }}>
                        Sintoma Atual
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#5B6472", marginTop: 2 }}>
                        Decisões travadas no dono, retrabalho e falta de visibilidade em tempo real.
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "#2E7D5B", fontWeight: 700, textTransform: "uppercase" }}>
                        Impacto da Solução
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#5B6472", marginTop: 2 }}>
                        Autonomia da equipe, ganho de margem e previsibilidade operacional.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5: O PLANO DE TRANSFORMAÇÃO */}
            {currentSlide === 4 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C1A160", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Metodologia Comprovada
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D2B3C", margin: "4px 0 14px" }}>
                    Plano de Implementação em 3 Fases (90 Dias)
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[
                    {
                      fase: "Fase 1 · Dias 1 a 30",
                      title: "Destravamento & Alinhamento",
                      itens: ["Mapeamento do gargalo crítico", "Definição de metas claras (OKRs)", "Instalação de rituais de liderança"],
                    },
                    {
                      fase: "Fase 2 · Dias 31 a 60",
                      title: "Estruturação & Processos",
                      itens: ["Organograma funcional por alçadas", "DRE gerencial & métricas de sanidade", "Eliminação de gargalos operacionais"],
                    },
                    {
                      fase: "Fase 3 · Dias 61 a 90",
                      title: "Consolidação & Escala",
                      itens: ["Gestão à vista para o time", "Previsibilidade de caixa e margem", "Autonomia para o empresário"],
                    },
                  ].map((step, idx) => (
                    <div
                      key={step.fase}
                      style={{
                        background: idx === 0 ? "rgba(193, 161, 96, 0.08)" : "#FAFAFA",
                        border: idx === 0 ? "1.5px solid #C1A160" : "1px solid #E7E2D8",
                        borderRadius: 10,
                        padding: "16px",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", color: "#C1A160", fontWeight: 700, textTransform: "uppercase" }}>
                        {step.fase}
                      </div>
                      <h4 style={{ margin: "4px 0 10px", fontSize: "0.92rem", color: "#1D2B3C" }}>{step.title}</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.78rem", color: "#5B6472", lineHeight: 1.6 }}>
                        {step.itens.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 6: PROPOSTA & PRÓXIMOS PASSOS */}
            {currentSlide === 5 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C1A160", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Próximos Passos
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D2B3C", margin: "4px 0 14px" }}>
                    Modelos de Parceria Empresarial Academy
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div
                    style={{
                      background: "#F7F5F1",
                      border: "2px solid #C1A160",
                      borderRadius: 12,
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#C1A160", textTransform: "uppercase" }}>
                      Recomendado para o Estágio Atual
                    </div>
                    <h3 style={{ margin: "4px 0 8px", fontSize: "1.15rem", color: "#1D2B3C" }}>
                      Mentoria Executiva Gestão 360
                    </h3>
                    <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#5B6472", lineHeight: 1.4 }}>
                      Encontros estratégicos quinzenais com Thiago Marchi, acompanhamento contínuo via WhatsApp e templates operacionais prontos para aplicação.
                    </p>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2E7D5B" }}>
                      ✓ Foco em destravar o gargalo de {weakest?.name || "processos"}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#FAFAFA",
                      border: "1px solid #E7E2D8",
                      borderRadius: 12,
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A93A0", textTransform: "uppercase" }}>
                      Implantação Hands-On
                    </div>
                    <h3 style={{ margin: "4px 0 8px", fontSize: "1.15rem", color: "#1D2B3C" }}>
                      Consultoria de Gestão Empresarial
                    </h3>
                    <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#5B6472", lineHeight: 1.4 }}>
                      Imersão na operação da empresa para mapear, desenhar e implementar processos, organograma e DRE junto com a sua equipe.
                    </p>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1D2B3C" }}>
                      ✓ Entrega completa dos processos estruturados
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#1D2B3C",
                    borderRadius: 8,
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#FFFFFF",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    Pronto para estruturar o contrato com {clientName}?
                  </span>
                  <Link
                    href="/eahub/contratos/novo"
                    style={{
                      background: "#C1A160",
                      color: "#1D2B3C",
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Gerar Contrato no HUB ↗
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer do Slide com paginação */}
          <div
            style={{
              padding: "10px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: currentSlide === 0 ? "1px solid rgba(193, 161, 96, 0.2)" : "1px solid #E7E2D8",
              background: currentSlide === 0 ? "rgba(0,0,0,0.1)" : "#FAFAFA",
              fontSize: "0.72rem",
              color: currentSlide === 0 ? "#C1A160" : "#8A93A0",
            }}
          >
            <span>Empresarial Academy · Conhecimento que Impulsiona</span>
            <span style={{ fontWeight: 700 }}>
              Slide {currentSlide + 1} de {SLIDES_COUNT}
            </span>
          </div>
        </div>

        {/* Controles de Navegação (escondidos na impressão) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            style={{
              background: currentSlide === 0 ? "#2E4059" : "#C1A160",
              color: "#1D2B3C",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: currentSlide === 0 ? "not-allowed" : "pointer",
              opacity: currentSlide === 0 ? 0.5 : 1,
            }}
          >
            ← Slide Anterior
          </button>

          {/* Indicadores de bolinha */}
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: "none",
                  background: currentSlide === i ? "#C1A160" : "#2E4059",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.2s ease",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            disabled={currentSlide === SLIDES_COUNT - 1}
            style={{
              background: currentSlide === SLIDES_COUNT - 1 ? "#2E4059" : "#C1A160",
              color: "#1D2B3C",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: currentSlide === SLIDES_COUNT - 1 ? "not-allowed" : "pointer",
              opacity: currentSlide === SLIDES_COUNT - 1 ? 0.5 : 1,
            }}
          >
            Próximo Slide →
          </button>
        </div>
      </div>
    </div>
  );
}
