"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

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

const PILARES_DEF = [
  { key: "fluxo", nome: "Fluxo de Alta Performance" },
  { key: "arquitetura", nome: "Arquitetura do Crescimento" },
  { key: "objetivos", nome: "Objetivos Estratégicos" },
  { key: "metricas", nome: "Métricas de Sucesso" },
  { key: "desafios", nome: "Gestão de Desafios" },
  { key: "evolucao", nome: "Evolução Constante" },
];

const PILAR_ACOES: Record<string, string> = {
  fluxo: "Mapeamos os processos críticos e instalamos rotina de rituais semanais de gestão, tirando a operação da dependência do dono.",
  arquitetura: "Desenhamos a estrutura de papéis e processos que sustentam o crescimento, sem sobrecarregar quem já está na empresa.",
  objetivos: "Transformamos a visão do sócio em metas claras, com indicador e responsável definido para cada uma.",
  metricas: "Implantamos o painel de indicadores certos, saindo da decisão por intuição para decisão por número.",
  desafios: "Estruturamos rotina de liderança e gestão de conflitos, preparando o time para crescer sem quebrar.",
  evolucao: "Criamos rotina de leitura de mercado e inovação, para a empresa não perder competitividade no médio prazo.",
};

const TOTAL_SLIDES = 16;

function levelInfo(pct: number) {
  if (pct <= 20) return { name: "Inicial", color: "#B23B3B" };
  if (pct <= 40) return { name: "Em Desenvolvimento", color: "#C7892B" };
  if (pct <= 60) return { name: "Estruturado", color: "#C1A160" };
  if (pct <= 80) return { name: "Avançado", color: "#2E7D5B" };
  return { name: "Referência", color: "#2E7D5B" };
}

export function CommercialPresentationClient({ initialId }: { initialId?: string }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [diagId, setDiagId] = useState(initialId || "");
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<RecentItem[]>([]);

  const [clienteNome, setClienteNome] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [clienteCargo, setClienteCargo] = useState("");
  const [clienteFaturamento, setClienteFaturamento] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteWhatsapp, setClienteWhatsapp] = useState("");
  const [clienteInstagram, setClienteInstagram] = useState("");
  const [clienteNota, setClienteNota] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({
    fluxo: 60,
    arquitetura: 50,
    objetivos: 55,
    metricas: 40,
    desafios: 45,
    evolucao: 50,
  });

  const [showPrepOverlay, setShowPrepOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch("/api/diagnostic/lookup?list=recent")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.items)) {
          setRecents(res.items);
        }
      })
      .catch((e) => console.warn("Erro ao buscar recentes:", e));
  }, []);

  const fetchDiagnostic = useCallback(async (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/diagnostic/lookup?id=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      if (data.ok && data.data) {
        const d: DiagnosticData = data.data;
        setClienteNome(d.name || "");
        setEmpresaNome(d.company || "");
        setClienteCargo(d.cargo || "");
        setClienteFaturamento(d.faturamento || "");
        setClienteEmail(d.email || "");
        setClienteWhatsapp(d.whatsapp || "");
        setClienteInstagram(d.instagram || "");

        const newScores: Record<string, number> = {
          fluxo: 60,
          arquitetura: 50,
          objetivos: 55,
          metricas: 40,
          desafios: 45,
          evolucao: 50,
        };
        if (Array.isArray(d.pillars)) {
          d.pillars.forEach((p) => {
            const keyLower = p.key.toLowerCase();
            if (keyLower.includes("fluxo")) newScores.fluxo = p.pct;
            else if (keyLower.includes("arquitetura")) newScores.arquitetura = p.pct;
            else if (keyLower.includes("objetivos")) newScores.objetivos = p.pct;
            else if (keyLower.includes("métricas") || keyLower.includes("metricas")) newScores.metricas = p.pct;
            else if (keyLower.includes("desafios")) newScores.desafios = p.pct;
            else if (keyLower.includes("evolução") || keyLower.includes("evolucao")) newScores.evolucao = p.pct;
          });
        }
        setScores(newScores);
      }
    } catch (e) {
      console.error("Falha ao buscar diagnóstico:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let idToLoad = initialId;
    if (!idToLoad && typeof window !== "undefined") {
      const qp = new URLSearchParams(window.location.search);
      idToLoad = qp.get("id") || "";
    }
    if (idToLoad) {
      setDiagId(idToLoad);
      fetchDiagnostic(idToLoad);
    }
  }, [initialId, fetchDiagnostic]);

  const overallPct = useMemo(() => {
    const vals = Object.values(scores);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / PILARES_DEF.length);
  }, [scores]);

  const overallLvl = useMemo(() => levelInfo(overallPct), [overallPct]);

  const weakestPillars = useMemo(() => {
    const arr = PILARES_DEF.map((p) => ({
      key: p.key,
      nome: p.nome,
      score: scores[p.key] ?? 50,
      acao: PILAR_ACOES[p.key],
    }));
    return arr.sort((a, b) => a.score - b.score).slice(0, 3);
  }, [scores]);

  const goToSlide = useCallback((n: number) => {
    let target = n;
    if (target < 1) target = 1;
    if (target > TOTAL_SLIDES) target = TOTAL_SLIDES;
    setCurrentSlide(target);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.tagName === "SELECT")
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(TOTAL_SLIDES);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, goToSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const contractUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (clienteNome) params.set("nome", clienteNome);
    if (empresaNome) params.set("empresa", empresaNome);
    if (clienteEmail) params.set("email", clienteEmail);
    if (clienteWhatsapp) params.set("whatsapp", clienteWhatsapp);
    if (diagId) params.set("diagId", diagId);
    return `/eahub/contratos/novo?${params.toString()}`;
  }, [clienteNome, empresaNome, clienteEmail, clienteWhatsapp, diagId]);

  return (
    <div
      style={{
        fontFamily: "'Open Sans', Calibri, Arial, sans-serif",
        background: "#0E1520",
        color: "#15191F",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="no-print"
        style={{
          background: "#162231",
          borderBottom: "1px solid rgba(193, 161, 96, 0.35)",
          padding: "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/eahub"
            style={{
              color: "#D7C089",
              textDecoration: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Voltar ao HUB
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.04em" }}>
            Apresentador Comercial Gestão 360
          </span>
          {diagId ? (
            <span
              style={{
                background: "rgba(193,161,96,0.2)",
                border: "1px solid #C1A160",
                color: "#D7C089",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: "0.76rem",
                fontWeight: 700,
              }}
            >
              ID: {diagId}
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {recents.length > 0 && (
            <select
              style={{
                background: "#0E1520",
                color: "#FFFFFF",
                border: "1px solid rgba(193,161,96,0.4)",
                borderRadius: 4,
                padding: "5px 8px",
                fontSize: "0.8rem",
              }}
              onChange={(e) => {
                if (e.target.value) {
                  setDiagId(e.target.value);
                  fetchDiagnostic(e.target.value);
                }
              }}
              value={diagId}
            >
              <option value="">-- Diagnósticos Recentes --</option>
              {recents.map((r) => (
                <option key={r.diagnosticId} value={r.diagnosticId}>
                  {r.name} {r.company ? `(${r.company})` : ""} · {r.diagnosticId}
                </option>
              ))}
            </select>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="text"
              placeholder="Buscar ID do DME..."
              value={diagId}
              onChange={(e) => setDiagId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDiagnostic(diagId)}
              style={{
                background: "#0E1520",
                color: "#FFFFFF",
                border: "1px solid rgba(193,161,96,0.4)",
                borderRadius: 4,
                padding: "5px 8px",
                fontSize: "0.8rem",
                width: 170,
              }}
            />
            <button
              onClick={() => fetchDiagnostic(diagId)}
              disabled={loading || !diagId}
              style={{
                background: "#C1A160",
                color: "#121D28",
                border: "none",
                borderRadius: 4,
                padding: "5px 10px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {loading ? "..." : "Carregar"}
            </button>
          </div>

          <button
            onClick={() => setShowPrepOverlay(true)}
            style={{
              background: "transparent",
              color: "#D7C089",
              border: "1px solid rgba(193,161,96,0.5)",
              borderRadius: 4,
              padding: "5px 10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⚙️ Ajustar Dados
          </button>

          <button
            onClick={() => window.print()}
            style={{
              background: "transparent",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 4,
              padding: "5px 10px",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            🖨️ PDF
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: "#1D2B3C",
              color: "#C1A160",
              border: "1px solid #C1A160",
              borderRadius: 4,
              padding: "5px 10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isFullscreen ? "Sair Tela Cheia" : "⛶ Tela Cheia (F11)"}
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 16px 28px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1300,
            aspectRatio: "16 / 9",
            background: currentSlide === 1 || currentSlide === 16 ? "#121D28" : "#FFFFFF",
            color: currentSlide === 1 || currentSlide === 16 ? "#FFFFFF" : "#15191F",
            borderRadius: 12,
            boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(193,161,96,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              padding: "16px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom:
                currentSlide === 1 || currentSlide === 16
                  ? "1px solid rgba(193,161,96,0.25)"
                  : "1px solid #D9DCE1",
              background: currentSlide === 1 || currentSlide === 16 ? "rgba(0,0,0,0.2)" : "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#C1A160", fontWeight: 900, fontSize: "1.05rem" }}>◆</span>
                <span
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    letterSpacing: "0.05em",
                    color: currentSlide === 1 || currentSlide === 16 ? "#FFFFFF" : "#1D2B3C",
                  }}
                >
                  EMPRESARIAL ACADEMY
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: currentSlide === 1 || currentSlide === 16 ? "#D7C089" : "#6B7280",
                  background: currentSlide === 1 || currentSlide === 16 ? "rgba(193,161,96,0.15)" : "#EFEFEF",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                MÉTODO GESTÃO 360
              </span>
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: currentSlide === 1 || currentSlide === 16 ? "#D7C089" : "#1D2B3C",
              }}
            >
              {clienteNome || empresaNome ? `${clienteNome} · ${empresaNome}` : "Apresentação de Fechamento"}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "2.8vh 4vw 2.5vh",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {currentSlide === 1 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "2vh",
                }}
              >
                <div
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "clamp(11px, 0.9vw, 13px)",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#D7C089",
                    border: "1px solid rgba(193,161,96,0.5)",
                    padding: "6px 18px",
                    borderRadius: 4,
                  }}
                >
                  Reunião de Diagnóstico e Alinhamento
                </div>
                <h1
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "clamp(28px, 3.2vw, 46px)",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    maxWidth: "70vw",
                    lineHeight: 1.2,
                    margin: "4px 0",
                  }}
                >
                  Da gestão no impulso para a{" "}
                  <span style={{ color: "#D7C089", fontStyle: "normal" }}>execução com método</span>
                </h1>
                <p
                  style={{
                    fontSize: "clamp(13.5px, 1.15vw, 17px)",
                    color: "rgba(255,255,255,0.78)",
                    maxWidth: "52vw",
                    lineHeight: 1.55,
                  }}
                >
                  Retorno sobre o Diagnóstico de Maturidade Empresarial e o caminho prático para os próximos meses, com a metodologia Gestão 360.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 28,
                    fontSize: "clamp(11.5px, 0.95vw, 13.5px)",
                    color: "rgba(255,255,255,0.65)",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    paddingTop: "1.8vh",
                    marginTop: "1vh",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    Conduz: <strong style={{ color: "#D7C089" }}>Thiago Marchi</strong>
                  </div>
                  <div>
                    Para:{" "}
                    <strong style={{ color: "#D7C089" }}>
                      {clienteNome || "[nome do cliente]"} · {empresaNome || "[empresa]"}
                    </strong>
                  </div>
                  {clienteCargo ? (
                    <div>
                      Cargo: <strong style={{ color: "#D7C089" }}>{clienteCargo}</strong>
                    </div>
                  ) : null}
                  {clienteFaturamento ? (
                    <div>
                      Faturamento: <strong style={{ color: "#D7C089" }}>{clienteFaturamento}</strong>
                    </div>
                  ) : null}
                  {clienteInstagram ? (
                    <div>
                      Instagram: <strong style={{ color: "#D7C089" }}>{clienteInstagram}</strong>
                    </div>
                  ) : null}
                  <div>
                    Método: <strong style={{ color: "#D7C089" }}>Gestão 360</strong>
                  </div>
                </div>

                <div style={{ marginTop: "1.5vh" }}>
                  <button
                    onClick={() => goToSlide(2)}
                    style={{
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontSize: "clamp(12px, 1vw, 14px)",
                      fontWeight: 700,
                      color: "#121D28",
                      background: "#C1A160",
                      border: "none",
                      padding: "10px 26px",
                      borderRadius: 4,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(193,161,96,0.35)",
                    }}
                  >
                    Iniciar Apresentação ➔
                  </button>
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              <div>
                <SlideHeader
                  eyebrow="Quem conduz esta conversa"
                  title="Empresarial Academy & Thiago Marchi"
                  subtitle="A vivência de dono de PME somada à governança de grandes operações"
                  flag="Autoridade"
                />
                <div style={{ display: "flex", gap: "3vw", minHeight: 0 }}>
                  <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "1.5vh" }}>
                    <p style={{ fontSize: "clamp(13px, 1.1vw, 15.5px)", lineHeight: 1.6, color: "#15191F" }}>
                      <strong>Sócio-proprietário de uma PME por 7 anos</strong> (Alujá Artigos Religiosos: varejo, e-commerce e fábrica), MBA em Gerenciamento de Projetos pela FGV, Green Belt em Lean Six Sigma, e 19 anos estruturando operações comerciais em Telefônica VIVO, Atento e AllCom Telecom.
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid #C1A160",
                        borderBottom: "1px solid #C1A160",
                        padding: "1.2vh 0",
                        fontSize: "clamp(13.5px, 1.15vw, 16.5px)",
                        fontWeight: 600,
                        color: "#1D2B3C",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      &ldquo;Conheço os dois lados: a rotina apertada de quem toca uma PME sozinho, e o método das grandes empresas para organizar isso.&rdquo;
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0 }}>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14.5px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Sitallcom: receita adicional de R$ 1,2 milhão e conversão comercial de 20% para 55%
                      </li>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14.5px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Alujá: saiu de MEI para ME sob sua sociedade, com valuation de R$ 300 mil
                      </li>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14.5px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Telefônica VIVO: carteira de 120 clientes com +18% em receita recorrente
                      </li>
                    </ul>
                  </div>

                  <div style={{ flex: 1, borderLeft: "1px solid #D9DCE1", paddingLeft: "2.4vw", display: "flex", flexDirection: "column", gap: "1.4vh" }}>
                    <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(14px, 1.15vw, 16px)", color: "#1D2B3C" }}>
                      Empresarial Academy
                    </h4>
                    <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", lineHeight: 1.55, color: "#6B7280" }}>
                      Consultoria e mentoria de gestão para PMEs. Metodologia própria, aplicada, sem fórmula pronta de curso genérico.
                    </p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0 }}>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Foco em processo, indicador e execução, não em teoria solta
                      </li>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Acompanhamento direto com o sócio fundador
                      </li>
                      <li style={{ fontSize: "clamp(12px, 1vw, 14px)", color: "#15191F", paddingLeft: 16, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#C1A160", fontWeight: 700 }}>▸</span>
                        Entrega pensada para o porte e o caixa da PME brasileira
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 3 && (
              <div>
                <SlideHeader
                  eyebrow="O método por trás da conversa"
                  title="Gestão 360: os 6 pilares"
                  subtitle="As empresas não quebram por falta de vendas, quebram por falta de gestão"
                  flag="Metodologia"
                />
                <div style={{ display: "flex", gap: "2.5vw", alignItems: "center" }}>
                  <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: "1vh" }}>
                    {PILARES_DEF.map((p, idx) => (
                      <div
                        key={p.key}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                          padding: "0.8vh 0",
                          borderBottom: idx < 5 ? "1px solid #D9DCE1" : "none",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "Montserrat, Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(18px, 1.6vw, 24px)",
                            color: "#C1A160",
                            minWidth: 34,
                          }}
                        >
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(13.5px, 1.1vw, 15.5px)", fontWeight: 700, color: "#1D2B3C", margin: 0 }}>
                            {p.nome}
                          </h4>
                          <p style={{ fontSize: "clamp(11.5px, 0.95vw, 13px)", color: "#6B7280", margin: "2px 0 0" }}>
                            {PILAR_ACOES[p.key].split(",")[0]}.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1.3, borderLeft: "1px solid #D9DCE1", paddingLeft: "2vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <p style={{ fontSize: "clamp(12.5px, 1vw, 14.5px)", color: "#15191F", marginBottom: "1vh", textAlign: "center" }}>
                      Esses 6 pilares nasceram como método aplicado em campo, viraram o livro <strong>Gestão 360</strong> e hoje sustentam tudo o que a Empresarial Academy entrega.
                    </p>
                    <svg viewBox="0 0 620 230" style={{ width: "100%", maxHeight: "35vh" }}>
                      <rect x="200" y="8" width="220" height="52" fill="#1D2B3C" rx="4" />
                      <rect x="200" y="8" width="220" height="4" fill="#C1A160" />
                      <text x="310" y="32" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="13">Método Gestão 360</text>
                      <text x="310" y="48" textAnchor="middle" fill="#B9C2CC" fontFamily="Open Sans, Arial, sans-serif" fontSize="10">6 pilares validados em campo</text>

                      <line x1="310" y1="60" x2="310" y2="82" stroke="#C1A160" strokeWidth="2" />

                      <rect x="200" y="82" width="220" height="48" fill="#1D2B3C" rx="4" />
                      <rect x="200" y="82" width="220" height="4" fill="#C1A160" />
                      <text x="310" y="104" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="13">Livro Gestão 360</text>
                      <text x="310" y="120" textAnchor="middle" fill="#B9C2CC" fontFamily="Open Sans, Arial, sans-serif" fontSize="10">guia de aplicação prática</text>

                      <line x1="310" y1="130" x2="310" y2="150" stroke="#C1A160" strokeWidth="2" />
                      <line x1="70" y1="150" x2="550" y2="150" stroke="#C1A160" strokeWidth="2" />
                      <line x1="70" y1="150" x2="70" y2="168" stroke="#C1A160" strokeWidth="2" />
                      <line x1="310" y1="150" x2="310" y2="168" stroke="#C1A160" strokeWidth="2" />
                      <line x1="550" y1="150" x2="550" y2="168" stroke="#C1A160" strokeWidth="2" />

                      <rect x="10" y="168" width="120" height="54" fill="#F6F5F1" stroke="#D9DCE1" rx="4" />
                      <text x="70" y="190" textAnchor="middle" fill="#1D2B3C" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="11">Mentoria</text>
                      <text x="70" y="206" textAnchor="middle" fill="#6B7280" fontFamily="Open Sans, Arial, sans-serif" fontSize="9.5">Executiva</text>

                      <rect x="250" y="168" width="120" height="54" fill="#F6F5F1" stroke="#D9DCE1" rx="4" />
                      <text x="310" y="190" textAnchor="middle" fill="#1D2B3C" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="11">Consultoria</text>
                      <text x="310" y="206" textAnchor="middle" fill="#6B7280" fontFamily="Open Sans, Arial, sans-serif" fontSize="9.5">Hands-On</text>

                      <rect x="490" y="168" width="120" height="54" fill="#F6F5F1" stroke="#D9DCE1" rx="4" />
                      <text x="550" y="190" textAnchor="middle" fill="#1D2B3C" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="11">Curso</text>
                      <text x="550" y="206" textAnchor="middle" fill="#6B7280" fontFamily="Open Sans, Arial, sans-serif" fontSize="9.5">Gestão 360</text>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 4 && (
              <div>
                <SlideHeader
                  eyebrow="Aprofundamento Metodológico"
                  title="Detalhamento dos 6 Pilares da Gestão 360"
                  subtitle="O que cada pilar transforma na prática para garantir sustentação e escala do seu negócio"
                  flag="Pilares em Detalhe"
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1.8vh 1.6vw",
                    minHeight: 0,
                  }}
                >
                  <PillarDetailCard
                    num="01"
                    name="Fluxo de Alta Performance"
                    desc="Mapeamento e padronização dos processos críticos da operação. Instalação de rituais semanais de alinhamento e redução sistemática da dependência da presença do dono."
                  />
                  <PillarDetailCard
                    num="02"
                    name="Arquitetura do Crescimento"
                    desc="Estruturação de papéis, organograma inteligente e alçadas de decisão delegadas. Preparação da estrutura física e operacional para suportar escala sem estrangulamento."
                  />
                  <PillarDetailCard
                    num="03"
                    name="Objetivos Estratégicos"
                    desc="A visão do fundador desdobrada em metas executáveis por setor (OKRs). Definição de donos claros, prazos tangíveis e acompanhamento sistemático de avanço."
                  />
                  <PillarDetailCard
                    num="04"
                    name="Métricas de Sucesso"
                    desc="Painel de indicadores de sanidade: separação entre DRE e Fluxo de Caixa, análise de margem real, regra 80/20 de produtos/clientes e decisão orientada a dados."
                  />
                  <PillarDetailCard
                    num="05"
                    name="Gestão de Desafios"
                    desc="Formação de liderança intermediária, protocolos de resolução de conflitos, gestão de pessoas sob pressão e desenho de contingência financeira/operacional para crises."
                  />
                  <PillarDetailCard
                    num="06"
                    name="Evolução Constante"
                    desc="Rituais contínuos de inovação, capacitação técnica da equipe, leitura ativa de movimentos da concorrência e testes rápidos de novos canais sem risco desnecessário."
                  />
                </div>
              </div>
            )}

            {currentSlide === 5 && (
              <div>
                <SlideHeader
                  eyebrow="O retrato de hoje"
                  title="Espelhamento do Diagnóstico de Maturidade"
                  subtitle={`Resultado do Diagnóstico de Maturidade Empresarial · ${empresaNome || clienteNome || "Empresa Avaliada"}`}
                  flag="Raio-X"
                />
                <div style={{ display: "flex", gap: "2.5vw", alignItems: "center" }}>
                  <div style={{ flex: 1.1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <RadarSvg scores={scores} overallPct={overallPct} overallLvl={overallLvl} />
                    <div style={{ display: "flex", gap: 20, fontSize: "0.78rem", color: "#6B7280", fontWeight: 600, marginTop: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, background: "#C1A160", borderRadius: 2 }} />
                        Sua empresa hoje
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, background: "rgba(199,137,43,0.25)", border: "1px solid #C7892B", borderRadius: 2 }} />
                        Espaço até maturidade plena
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1.1, borderLeft: "1px solid #D9DCE1", paddingLeft: "2vw", display: "flex", flexDirection: "column", gap: "1vh" }}>
                    {PILARES_DEF.map((p) => {
                      const sc = scores[p.key] ?? 50;
                      const lvl = levelInfo(sc);
                      return (
                        <div
                          key={p.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "0.8vh 0",
                            borderBottom: "1px solid #EAEAEA",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "Montserrat, Arial, sans-serif",
                              fontWeight: 800,
                              fontSize: "clamp(18px, 1.5vw, 22px)",
                              color: lvl.color,
                              minWidth: 55,
                            }}
                          >
                            {sc}%
                          </div>
                          <div>
                            <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(13px, 1.05vw, 15px)", fontWeight: 700, color: "#1D2B3C", margin: 0 }}>
                              {p.nome}
                            </h4>
                            <p style={{ fontSize: "clamp(11.5px, 0.9vw, 13px)", color: "#6B7280", margin: 0 }}>
                              {lvl.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 6 && (
              <div>
                <SlideHeader
                  eyebrow="Confirmando o que pesa mais"
                  title="Validação dos Gargalos Operacionais e Comerciais"
                  subtitle="O que os três pilares mais baixos revelam, e como o Gestão 360 atua neles"
                  flag="Confirmação"
                />
                <div style={{ display: "flex", gap: "3vw" }}>
                  <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "1.4vh" }}>
                    <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(13.5px, 1.1vw, 15.5px)", color: "#1D2B3C" }}>
                      Onde o diagnóstico aponta o maior gargalo, e como o Gestão 360 atua
                    </h4>
                    {weakestPillars.map((p) => {
                      const lvl = levelInfo(p.score);
                      return (
                        <div
                          key={p.key}
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "flex-start",
                            padding: "1.2vh 0",
                            borderBottom: "1px solid #D9DCE1",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "Montserrat, Arial, sans-serif",
                              fontWeight: 800,
                              fontSize: "clamp(20px, 1.8vw, 26px)",
                              color: lvl.color,
                              minWidth: 55,
                            }}
                          >
                            {p.score}%
                          </div>
                          <div>
                            <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(14px, 1.15vw, 16px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                              {p.nome} · <span style={{ color: lvl.color }}>{lvl.name}</span>
                            </h4>
                            <p style={{ fontSize: "clamp(12px, 1vw, 14px)", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                              {p.acao}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ flex: 1, borderLeft: "1px solid #D9DCE1", paddingLeft: "2.4vw", display: "flex", flexDirection: "column", gap: "1.5vh" }}>
                    <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(13px, 1.1vw, 15px)", color: "#1D2B3C" }}>
                      O que o cliente relatou na sondagem inicial
                    </h4>
                    <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", color: "#15191F", fontStyle: "italic", lineHeight: 1.5 }}>
                      {clienteNota || "[Relato do lead sobre os principais desafios da operação comercial ou gestão de equipe]"}
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid #C1A160",
                        borderBottom: "1px solid #C1A160",
                        padding: "1.2vh 0",
                        fontSize: "clamp(13.5px, 1.15vw, 16px)",
                        fontWeight: 600,
                        color: "#1D2B3C",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      Essa fotografia ainda representa o que mais pesa hoje{clienteNome ? `, ${clienteNome}` : ""}?
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 7 && (
              <div>
                <SlideHeader
                  eyebrow="Antes de decidir, vale calcular"
                  title="O Preço de Não Agir"
                  subtitle="Três perguntas que valem mais do que qualquer diagnóstico"
                  flag="Reflexão"
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.2vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#B23B3B", minWidth: 42 }}>
                      01
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(14px, 1.15vw, 16.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Valor do negócio
                      </h4>
                      <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", color: "#15191F", lineHeight: 1.5, margin: 0 }}>
                        Se você decidisse vender a empresa hoje, ela valeria o que você imagina, ou menos, porque tudo ainda depende de você estar presente todos os dias?
                      </p>
                      <p style={{ fontSize: "clamp(11.5px, 0.95vw, 13.5px)", color: "#6B7280", fontStyle: "italic", margin: "4px 0 0" }}>
                        Uma empresa que só funciona com o dono presente vale menos no mercado e fica mais frágil a qualquer imprevisto.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.2vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#B23B3B", minWidth: 42 }}>
                      02
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(14px, 1.15vw, 16.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Margem
                      </h4>
                      <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", color: "#15191F", lineHeight: 1.5, margin: 0 }}>
                        Quanto da sua margem está desaparecendo agora mesmo em retrabalho, desconto não planejado ou custo que ninguém está olhando de perto?
                      </p>
                      <p style={{ fontSize: "clamp(11.5px, 0.95vw, 13.5px)", color: "#6B7280", fontStyle: "italic", margin: "4px 0 0" }}>
                        Faturar mais sem controle de custo é crescer no vermelho sem perceber.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.2vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#B23B3B", minWidth: 42 }}>
                      03
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(14px, 1.15vw, 16.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Rotina e saúde
                      </h4>
                      <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", color: "#15191F", lineHeight: 1.5, margin: 0 }}>
                        No ritmo de hoje, daqui a 12 meses, quanto tempo sobra para decisão estratégica, para descansar, para estar presente fora da empresa?
                      </p>
                      <p style={{ fontSize: "clamp(11.5px, 0.95vw, 13.5px)", color: "#6B7280", fontStyle: "italic", margin: "4px 0 0" }}>
                        Rotina de apagar incêndio cobra um preço pessoal que não aparece em nenhum balanço.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid #C1A160",
                      borderBottom: "1px solid #C1A160",
                      padding: "1.2vh 0",
                      fontSize: "clamp(13.5px, 1.15vw, 16px)",
                      fontWeight: 700,
                      color: "#1D2B3C",
                      fontStyle: "italic",
                      marginTop: "0.5vh",
                    }}
                  >
                    Não decidir também é uma decisão: é escolher continuar pagando essa conta todo mês.
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 8 && (
              <div>
                <SlideHeader
                  eyebrow="Um momento de decisão, juntos"
                  title="Bifurcação Estratégica"
                  subtitle="Avaliando mão de obra e conhecimento de gestão disponíveis hoje na empresa"
                  flag="Decisão"
                />
                <p style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 1.5vh", fontSize: "clamp(12.5px, 1.05vw, 14.5px)", color: "#15191F", lineHeight: 1.5 }}>
                  Antes de indicar um caminho, vale confirmar dois pontos com você: quem toca o operacional hoje, e se esse time já sabe aplicar método sozinho ou precisa de alguém construindo isso junto.
                </p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg viewBox="0 0 900 290" style={{ width: "100%", maxHeight: "40vh" }}>
                    <rect x="220" y="8" width="460" height="70" fill="#1D2B3C" rx="6" />
                    <rect x="220" y="8" width="460" height="4" fill="#C1A160" />
                    <text x="450" y="38" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="15">
                      Hoje, quem executa o operacional
                    </text>
                    <text x="450" y="60" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="15">
                      da empresa no dia a dia?
                    </text>

                    <line x1="450" y1="78" x2="450" y2="100" stroke="#C1A160" strokeWidth="2" />
                    <line x1="150" y1="100" x2="750" y2="100" stroke="#C1A160" strokeWidth="2" />
                    <line x1="150" y1="100" x2="150" y2="118" stroke="#C1A160" strokeWidth="2" />
                    <line x1="750" y1="100" x2="750" y2="118" stroke="#C1A160" strokeWidth="2" />

                    <rect x="50" y="118" width="200" height="4" fill="#F6F5F1" />
                    <text x="150" y="140" textAnchor="middle" fill="#1D2B3C" fontFamily="Open Sans, Arial, sans-serif" fontSize="13.5" fontWeight="700">
                      Já tem equipe própria,
                    </text>
                    <text x="150" y="158" textAnchor="middle" fill="#1D2B3C" fontFamily="Open Sans, Arial, sans-serif" fontSize="13.5" fontWeight="700">
                      falta direção
                    </text>
                    <text x="750" y="140" textAnchor="middle" fill="#1D2B3C" fontFamily="Open Sans, Arial, sans-serif" fontSize="13.5" fontWeight="700">
                      Ainda faz sozinho,
                    </text>
                    <text x="750" y="158" textAnchor="middle" fill="#1D2B3C" fontFamily="Open Sans, Arial, sans-serif" fontSize="13.5" fontWeight="700">
                      sobrecarregado
                    </text>

                    <line x1="150" y1="168" x2="150" y2="192" stroke="#C1A160" strokeWidth="2" />
                    <line x1="750" y1="168" x2="750" y2="192" stroke="#C1A160" strokeWidth="2" />

                    <rect x="20" y="192" width="260" height="98" fill="#1D2B3C" rx="6" />
                    <rect x="20" y="192" width="260" height="4" fill="#C1A160" />
                    <text x="150" y="221" textAnchor="middle" fill="#D7C089" fontFamily="Montserrat, Arial, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="0.5">
                      PERFIL ESTRATÉGICO / TEM BRAÇO
                    </text>
                    <text x="150" y="250" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontSize="17" fontWeight="800">
                      Mentoria Executiva
                    </text>
                    <text x="150" y="272" textAnchor="middle" fill="#B9C2CC" fontFamily="Open Sans, Arial, sans-serif" fontSize="12">
                      Direção, método e cobrança
                    </text>

                    <rect x="620" y="192" width="260" height="98" fill="#1D2B3C" rx="6" />
                    <rect x="620" y="192" width="260" height="4" fill="#C1A160" />
                    <text x="750" y="221" textAnchor="middle" fill="#D7C089" fontFamily="Montserrat, Arial, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="0.5">
                      SOBRECARGA / QUER IMPLEMENTAÇÃO
                    </text>
                    <text x="750" y="250" textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontSize="17" fontWeight="800">
                      Consultoria Hands-On
                    </text>
                    <text x="750" y="272" textAnchor="middle" fill="#B9C2CC" fontFamily="Open Sans, Arial, sans-serif" fontSize="12">
                      EA implementa junto
                    </text>
                  </svg>
                </div>
              </div>
            )}

            {currentSlide === 9 && (
              <div>
                <SlideHeader
                  eyebrow="Comparando alternativas"
                  title="Investimento: Consultoria ou Executivo CLT?"
                  subtitle="O que custa, de verdade, resolver isso com um cargo interno"
                  flag="Investimento"
                />
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(12px, 1vw, 14px)", marginBottom: "1.5vh" }}>
                  <thead>
                    <tr>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "10px 14px", textAlign: "left", fontFamily: "Montserrat, Arial, sans-serif", fontSize: "0.78rem", textTransform: "uppercase" }}>Critério</th>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "10px 14px", textAlign: "left", fontFamily: "Montserrat, Arial, sans-serif", fontSize: "0.78rem", textTransform: "uppercase" }}>Executivo Sênior CLT</th>
                      <th style={{ background: "#C1A160", color: "#121D28", padding: "10px 14px", textAlign: "left", fontFamily: "Montserrat, Arial, sans-serif", fontSize: "0.78rem", textTransform: "uppercase" }}>Consultoria / Mentoria Gestão 360</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Custo mensal aproximado</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", color: "#B23B3B" }}>R$ 8.000 a R$ 15.000 de salário + encargos (FGTS, INSS patronal, 13º, férias): <strong>R$ 14.000 a R$ 27.000/mês</strong></td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", color: "#1D2B3C", fontWeight: 700 }}>Fração desse investimento, sem nenhum encargo trabalhista</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Vínculo e risco</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1" }}>CLT, com risco de rescisão, multa e passivo trabalhista</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>Contrato B2B de prestação de serviço, sem passivo</td>
                    </tr>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Curva de aprendizado</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1" }}>Meses para conhecer a empresa e testar métodos que podem falhar</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>Método já validado em campo, aplicado desde a primeira semana</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Comprometimento</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1" }}>Depende de 1 único profissional contratado, com risco de rotatividade</td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 700 }}>Acompanhamento direto do sócio fundador da Empresarial Academy</td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    borderTop: "1px solid #C1A160",
                    borderBottom: "1px solid #C1A160",
                    padding: "1.2vh 0",
                    fontSize: "clamp(12.5px, 1.05vw, 14.5px)",
                    fontWeight: 600,
                    color: "#1D2B3C",
                    fontStyle: "italic",
                    textAlign: "center",
                    marginBottom: "1.5vh",
                  }}
                >
                  De R$ 6.500 a R$ 8.900 por mês, conforme o formato escolhido a seguir — sempre abaixo do custo de 1 executivo CLT. Uma ou duas contas fechadas a mais cobrem todo o programa.
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    marginTop: "1vh",
                  }}
                >
                  <button
                    onClick={() => goToSlide(10)}
                    style={{
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontSize: "clamp(13px, 1.1vw, 15px)",
                      fontWeight: 800,
                      color: "#121D28",
                      background: "linear-gradient(135deg, #D7C089 0%, #C1A160 100%)",
                      border: "2px solid #C1A160",
                      borderRadius: 8,
                      padding: "12px 28px",
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(193,161,96,0.45), 0 4px 10px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>🎯</span> Ver Opção A: Mentoria Executiva ➔
                  </button>

                  <button
                    onClick={() => goToSlide(12)}
                    style={{
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontSize: "clamp(13px, 1.1vw, 15px)",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      background: "linear-gradient(135deg, #26384D 0%, #1D2B3C 100%)",
                      border: "2px solid #C1A160",
                      borderRadius: 8,
                      padding: "12px 28px",
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(29,43,60,0.35), 0 4px 10px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>🛠️</span> Ver Opção B: Consultoria Hands-On ➔
                  </button>
                </div>
              </div>
            )}

            {currentSlide === 10 && (
              <div>
                <SlideHeader
                  eyebrow="Como funciona"
                  title="Mentoria Executiva Gestão 360"
                  subtitle="Para quem já tem equipe e precisa de direção, método e cobrança"
                  flag="Perfil Estratégico / Tem Braço"
                />
                <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", lineHeight: 1.55, color: "#15191F", marginBottom: "1.5vh" }}>
                  Encontros estratégicos quinzenais com Thiago Marchi, canal direto para validar decisões entre as sessões, e todas as ferramentas do método Gestão 360 aplicadas à realidade da empresa de forma personalizada. Você continua no comando, com o apoio que precisa através de método e orientações externas.
                </p>
                <div style={{ height: "20vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlowSvg
                    steps={[
                      { title: "Diagnóstico Validado", lines: ["Confirmação dos", "pilares prioritários"] },
                      { title: "Direção Quinzenal", lines: ["Encontros com", "Thiago Marchi"] },
                      { title: "Cobrança de Metas", lines: ["Acompanhamento", "indicador a indicador"] },
                      { title: "Autonomia do Time", lines: ["Time executa com", "método instalado"] },
                    ]}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: "1.5vh" }}>
                  <FlowCol num="01" title="Diagnóstico Validado" desc="Feito por meio de testes, avaliações e entrevistas com líderes e equipe para analisar rotina e comportamento." />
                  <FlowCol num="02" title="Direção Quinzenal" desc="Plano apresentado e analisado, com acompanhamento, ajuste de rota, treinamento e orientação sobre processos e metas." />
                  <FlowCol num="03" title="Cobrança de Metas" desc="Olhar analítico sobre indicadores e metas da empresa, acompanhando a evolução dos resultados com qualidade." />
                  <FlowCol num="04" title="Autonomia do Time" desc="Dúvidas e contratempos da execução resolvidos, e novas rotas para o futuro consolidadas com a liderança." />
                </div>
              </div>
            )}

            {currentSlide === 11 && (
              <div>
                <SlideHeader
                  eyebrow="Formatos de acompanhamento"
                  title="Mentoria Executiva: 3, 6 ou 12 meses"
                  subtitle="O horizonte ideal depende da complexidade da transformação. Os três formatos seguem a mesma metodologia."
                  flag="3 Pacotes"
                />
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(11.5px, 0.95vw, 13.5px)" }}>
                  <thead>
                    <tr>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Critério</th>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Trimestral (3M)</th>
                      <th style={{ background: "#C1A160", color: "#121D28", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem", fontWeight: 800 }}>Semestral (6M) · Mais Escolhido</th>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Anual (12M)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Cadência</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Quinzenal · 6 sessões de 90 min</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>Quinzenal · 12 sessões de 90 min</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Quinzenal · 24 sessões de 90 min</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Profundidade</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Atuação concentrada nas prioridades mais urgentes</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)" }}>Atuação em mais áreas e processos-chave com consistência</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Atuação ampla em todas as frentes da empresa</td>
                    </tr>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Entrega-chave</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Diagnóstico, plano e implantação das ações imediatas</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>Rotinas de gestão implantadas e consolidadas no time</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Ciclo contínuo de transformação e governança instalada</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Indicado para</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Desafios prioritários e avanços em curto prazo</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)" }}>Desenvolver novas rotinas e consolidar equipe</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Transformações complexas com governança contínua</td>
                    </tr>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, color: "#1D2B3C" }}>Investimento</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1rem", color: "#1D2B3C" }}>R$ 7.900/mês</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1.05rem", color: "#C1A160", background: "rgba(193,161,96,0.15)" }}>R$ 6.900/mês</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1rem", color: "#2E7D5B" }}>R$ 6.500/mês</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {currentSlide === 12 && (
              <div>
                <SlideHeader
                  eyebrow="Como funciona"
                  title="Consultoria de Negócios Hands-On"
                  subtitle="Para quem está sobrecarregado e precisa de implementação, não só orientação"
                  flag="Sobrecarga / Quer Implementação"
                />
                <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", lineHeight: 1.55, color: "#15191F", marginBottom: "1.5vh" }}>
                  A EA entra na operação: mapeia e desenha os processos-chave, redige playbooks e scripts, e treina a equipe para operar sem depender do dono em cada decisão.
                </p>
                <div style={{ height: "20vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlowSvg
                    steps={[
                      { title: "Diagnóstico Profundo", lines: ["Mapeamento dos", "processos críticos"] },
                      { title: "Desenho de Processos", lines: ["Playbooks e", "scripts prontos"] },
                      { title: "Treinamento da Equipe", lines: ["Time aplica junto", "com a EA"] },
                      { title: "Transição da Gestão", lines: ["Operação roda sem", "depender do dono"] },
                    ]}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: "1.5vh" }}>
                  <FlowCol num="01" title="Diagnóstico Profundo" desc="Mapeamento dos processos críticos direto na operação, com entrevistas à equipe e observação da rotina diária." />
                  <FlowCol num="02" title="Desenho de Processos" desc="Construção dos playbooks e scripts junto com quem executa, definindo responsável e indicador para cada etapa." />
                  <FlowCol num="03" title="Treinamento da Equipe" desc="Aplicação prática com o time em campo, ajustando o que não funcionar antes de validar o playbook oficial." />
                  <FlowCol num="04" title="Transição da Gestão" desc="Passagem da operação para o time, com acompanhamento próximo até o processo rodar de forma independente." />
                </div>
              </div>
            )}

            {currentSlide === 13 && (
              <div>
                <SlideHeader
                  eyebrow="Formatos de acompanhamento"
                  title="Consultoria Hands-On: 3, 6 ou 12 meses"
                  subtitle="O horizonte ideal depende de quantos processos a empresa precisa reconstruir."
                  flag="3 Pacotes"
                />
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(11.5px, 0.95vw, 13.5px)" }}>
                  <thead>
                    <tr>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Critério</th>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Trimestral (3M)</th>
                      <th style={{ background: "#C1A160", color: "#121D28", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem", fontWeight: 800 }}>Semestral (6M) · Mais Escolhido</th>
                      <th style={{ background: "#1D2B3C", color: "#FFFFFF", padding: "8px 12px", textAlign: "left", fontSize: "0.76rem" }}>Anual (12M)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Cadência</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>2 encontros online + 2 visitas presenciais/mês</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>2 encontros online + 2 a 3 visitas presenciais/mês</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Intensiva nos 4 primeiros meses, depois mensal</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Profundidade</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Foco em 1 processo crítico até a equipe treinada</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)" }}>Foco em 2 a 3 processos, cobrindo mais de uma área</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Atuação nos 6 pilares, reconstruindo a gestão inteira</td>
                    </tr>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Entrega-chave</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Playbook implantado e equipe operando sem travar</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)", fontWeight: 600 }}>Múltiplas áreas com processos novos e indicadores</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Gestão reconstruída e sustentada em todas as áreas</td>
                    </tr>
                    <tr style={{ background: "#F6F5F1" }}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 700 }}>Indicado para</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Resolver o gargalo mais urgente da operação</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1", background: "rgba(193,161,96,0.08)" }}>Reorganizar duas frentes da operação simultaneamente</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #D9DCE1" }}>Reconstruir a gestão completa da empresa</td>
                    </tr>
                    <tr style={{ background: "#FFFFFF" }}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, color: "#1D2B3C" }}>Investimento</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1rem", color: "#1D2B3C" }}>R$ 8.900/mês</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1.05rem", color: "#C1A160", background: "rgba(193,161,96,0.15)" }}>R$ 8.400/mês</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #D9DCE1", fontWeight: 800, fontSize: "1rem", color: "#2E7D5B" }}>R$ 7.970/mês médio</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {currentSlide === 14 && (
              <div>
                <SlideHeader
                  eyebrow="O que acontece depois do sim"
                  title="Plano de Ação Mútuo (MAP) & Onboarding"
                  subtitle="O que cada lado se compromete a entregar, e até quando"
                  flag="MAP"
                />
                <p style={{ fontSize: "clamp(12.5px, 1.05vw, 14.5px)", lineHeight: 1.55, color: "#15191F", marginBottom: "1.5vh" }}>
                  Da assinatura ao primeiro checkpoint de resultados, este é o compromisso mútuo entre a Empresarial Academy e a sua empresa, com responsável e prazo em cada etapa.
                </p>
                <div style={{ height: "19vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlowSvg
                    steps={[
                      { title: "Assinatura & Kickoff", lines: ["EA + Cliente"] },
                      { title: "Diagnóstico Aprofundado", lines: ["Validação de metas", "por pilar · EA"] },
                      { title: "Desenho do Plano", lines: ["Indicador e prazo", "por meta"] },
                      { title: "Execução", lines: ["Programa escolhido", "rodando"] },
                      { title: "Revisão de Indicadores", lines: ["Primeiro checkpoint", "Dia 30"] },
                    ]}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: "1.5vh" }}>
                  <FlowCol num="01" title="Assinatura & Kickoff" desc="Formalização do contrato e reunião de abertura com liderança alinhando prioridades." />
                  <FlowCol num="02" title="Diagnóstico Aprofundado" desc="Validação das metas por pilar a partir do DME, com entrevistas complementares." />
                  <FlowCol num="03" title="Desenho do Plano" desc="Cada meta ganha indicador, responsável e prazo, orientando os encontros." />
                  <FlowCol num="04" title="Execução" desc="O programa escolhido roda na cadência combinada, com ajuste de rota ágil." />
                  <FlowCol num="05" title="Revisão Dia 30" desc="Primeiro checkpoint formal comparando combinado com avanço real." />
                </div>
              </div>
            )}

            {currentSlide === 15 && (
              <div>
                <SlideHeader
                  eyebrow="Antes de fechar, essa pergunta é sua"
                  title="Qual é o horizonte certo pra você?"
                  subtitle="Trimestral, semestral ou anual: qual dessas situações mais combina com a empresa agora"
                  flag="Decisão"
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.4vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#C1A160", minWidth: 55 }}>
                      3M
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(15px, 1.2vw, 17.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Trimestral (90 dias)
                      </h4>
                      <p style={{ fontSize: "clamp(13px, 1.05vw, 15px)", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                        Você tem 1 prioridade clara e urgente, e quer ver resultado concreto nela antes de pensar no resto?
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.4vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#C1A160", minWidth: 55 }}>
                      6M
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(15px, 1.2vw, 17.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Semestral (180 dias) · Recomendado
                      </h4>
                      <p style={{ fontSize: "clamp(13px, 1.05vw, 15px)", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                        Você enxerga 2 ou 3 frentes que precisam mudar, e topa um ritmo mais longo para consolidar de verdade?
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "1.4vh 0", borderBottom: "1px solid #D9DCE1" }}>
                    <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2vw, 28px)", color: "#C1A160", minWidth: 55 }}>
                      12M
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(15px, 1.2vw, 17.5px)", fontWeight: 700, color: "#1D2B3C", margin: "0 0 3px" }}>
                        Anual (365 dias)
                      </h4>
                      <p style={{ fontSize: "clamp(13px, 1.05vw, 15px)", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                        A gestão da empresa inteira precisa de reconstrução, com acompanhamento contínuo e governança o ano todo?
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid #C1A160",
                      borderBottom: "1px solid #C1A160",
                      padding: "1.5vh 0",
                      fontSize: "clamp(14px, 1.15vw, 16.5px)",
                      fontWeight: 600,
                      color: "#1D2B3C",
                      fontStyle: "italic",
                      marginTop: "0.5vh",
                    }}
                  >
                    Qual dessas três opções te representa melhor agora{clienteNome ? `, ${clienteNome}` : ""}? Essa resposta já aponta o formato ideal para o seu plano.
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 16 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "2.2vh",
                }}
              >
                <div
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "clamp(11px, 0.9vw, 13px)",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#D7C089",
                    border: "1px solid rgba(193,161,96,0.5)",
                    padding: "6px 18px",
                    borderRadius: 4,
                  }}
                >
                  Fechamento &amp; Próximos Passos
                </div>

                <h1
                  style={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "clamp(26px, 3vw, 44px)",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    maxWidth: "68vw",
                    lineHeight: 1.25,
                    margin: 0,
                  }}
                >
                  {clienteNome ? `${clienteNome}, vamos` : "Vamos"} seguir com o{" "}
                  <span style={{ color: "#D7C089", fontStyle: "normal" }}>Plano de Ação</span>?
                </h1>

                <p
                  style={{
                    fontSize: "clamp(13.5px, 1.15vw, 17px)",
                    color: "rgba(255,255,255,0.78)",
                    maxWidth: "52vw",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Formalização do contrato, sessão de Kick-off e início do Plano de Ação Mútuo. O primeiro passo é confirmar a data de início.
                </p>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: "1vh" }}>
                  <Link
                    href={contractUrl}
                    style={{
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontSize: "clamp(13px, 1.1vw, 15px)",
                      fontWeight: 800,
                      color: "#121D28",
                      background: "linear-gradient(135deg, #D7C089 0%, #C1A160 100%)",
                      padding: "13px 30px",
                      borderRadius: 6,
                      textDecoration: "none",
                      boxShadow: "0 0 25px rgba(193,161,96,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>📝</span> Gerar Contrato no HUB com Dados do Lead ↗
                  </Link>

                  {clienteWhatsapp ? (
                    <a
                      href={`https://wa.me/55${clienteWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Olá ${clienteNome || ""}! Foi excelente nossa reunião de apresentação do Diagnóstico Gestão 360. Segue a proposta e os próximos passos para iniciarmos o plano!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "Montserrat, Arial, sans-serif",
                        fontSize: "clamp(13px, 1.1vw, 15px)",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.35)",
                        padding: "13px 26px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>💬</span> WhatsApp do Cliente
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div
            className="no-print"
            style={{
              padding: "10px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop:
                currentSlide === 1 || currentSlide === 16
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid #D9DCE1",
              background: currentSlide === 1 || currentSlide === 16 ? "rgba(0,0,0,0.3)" : "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide <= 1}
                style={{
                  background: "transparent",
                  color: currentSlide === 1 || currentSlide === 16 ? "#D7C089" : "#1D2B3C",
                  border:
                    currentSlide === 1 || currentSlide === 16
                      ? "1px solid rgba(193,161,96,0.5)"
                      : "1px solid #D9DCE1",
                  borderRadius: 4,
                  padding: "5px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: currentSlide <= 1 ? "not-allowed" : "pointer",
                  opacity: currentSlide <= 1 ? 0.4 : 1,
                }}
              >
                ◀ Anterior
              </button>

              <button
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide >= TOTAL_SLIDES}
                style={{
                  background: currentSlide === 1 || currentSlide === 16 ? "#C1A160" : "#1D2B3C",
                  color: currentSlide === 1 || currentSlide === 16 ? "#121D28" : "#FFFFFF",
                  border: "none",
                  borderRadius: 4,
                  padding: "5px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: currentSlide >= TOTAL_SLIDES ? "not-allowed" : "pointer",
                  opacity: currentSlide >= TOTAL_SLIDES ? 0.4 : 1,
                }}
              >
                Próximo ▶
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i + 1)}
                  title={`Slide ${i + 1}`}
                  style={{
                    width: currentSlide === i + 1 ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    background:
                      currentSlide === i + 1
                        ? "#C1A160"
                        : currentSlide === 1 || currentSlide === 16
                        ? "rgba(255,255,255,0.25)"
                        : "#D9DCE1",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontFamily: "Montserrat, Arial, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: currentSlide === 1 || currentSlide === 16 ? "rgba(255,255,255,0.6)" : "#6B7280",
              }}
            >
              Slide {currentSlide} / {TOTAL_SLIDES}
            </div>
          </div>
        </div>
      </div>

      {showPrepOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 16, 24, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 600,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 8,
              borderTop: "4px solid #C1A160",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                background: "#1D2B3C",
                color: "#FFFFFF",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1rem", fontFamily: "Montserrat, Arial, sans-serif" }}>
                Ajustar Dados da Apresentação
              </h3>
              <button
                onClick={() => setShowPrepOverlay(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#FFFFFF",
                  padding: "4px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                ✕ Fechar
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1D2B3C", marginBottom: 4, textTransform: "uppercase" }}>
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9DCE1", borderRadius: 4, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1D2B3C", marginBottom: 4, textTransform: "uppercase" }}>
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9DCE1", borderRadius: 4, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1D2B3C", marginBottom: 4, textTransform: "uppercase" }}>
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={clienteCargo}
                    onChange={(e) => setClienteCargo(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9DCE1", borderRadius: 4, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1D2B3C", marginBottom: 4, textTransform: "uppercase" }}>
                    Faturamento Anual
                  </label>
                  <input
                    type="text"
                    value={clienteFaturamento}
                    onChange={(e) => setClienteFaturamento(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9DCE1", borderRadius: 4, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1D2B3C", marginBottom: 4, textTransform: "uppercase" }}>
                  Relato da Ligação Inicial / Gargalo Principal
                </label>
                <textarea
                  value={clienteNota}
                  onChange={(e) => setClienteNota(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9DCE1", borderRadius: 4, fontSize: 13, resize: "vertical" }}
                />
              </div>

              <h4 style={{ fontSize: 12, fontWeight: 800, color: "#1D2B3C", textTransform: "uppercase", margin: "16px 0 10px" }}>
                Pontuação do Diagnóstico (0 a 100%)
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PILARES_DEF.map((p) => (
                  <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 190, fontSize: 12, fontWeight: 600 }}>{p.nome}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scores[p.key] ?? 50}
                      onChange={(e) => setScores({ ...scores, [p.key]: parseInt(e.target.value, 10) })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ width: 45, textAlign: "right", fontWeight: 700, fontSize: 12, color: "#C1A160" }}>
                      {scores[p.key] ?? 50}%
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => setShowPrepOverlay(false)}
                  style={{
                    background: "#C1A160",
                    color: "#121D28",
                    fontWeight: 800,
                    fontSize: 13,
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Aplicar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlideHeader({
  eyebrow,
  title,
  subtitle,
  flag,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  flag: string;
}) {
  return (
    <div
      style={{
        borderBottom: "2px solid #C1A160",
        paddingBottom: "1.2vh",
        marginBottom: "2vh",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 16,
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "Montserrat, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(10.5px, 0.9vw, 12.5px)",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#C1A160",
            marginBottom: "0.4vh",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Montserrat, Arial, sans-serif",
            fontSize: "clamp(22px, 2.2vw, 32px)",
            fontWeight: 800,
            color: "#1D2B3C",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "clamp(12px, 1vw, 14.5px)", color: "#6B7280", marginTop: "0.4vh", fontWeight: 600 }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          fontFamily: "Montserrat, Arial, sans-serif",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          padding: "4px 10px",
          border: "1px solid #C1A160",
          color: "#C1A160",
          whiteSpace: "nowrap",
          flexShrink: 0,
          borderRadius: 2,
        }}
      >
        {flag}
      </div>
    </div>
  );
}

function PillarDetailCard({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <div
      style={{
        background: "#F6F5F1",
        border: "1px solid #D9DCE1",
        borderTop: "3px solid #C1A160",
        borderRadius: 6,
        padding: "1.4vh 1.2vw",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#C1A160" }}>
          {num}
        </span>
        <h4 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(12.5px, 1vw, 14px)", fontWeight: 700, color: "#1D2B3C", margin: 0 }}>
          {name}
        </h4>
      </div>
      <p style={{ fontSize: "clamp(11px, 0.88vw, 12.5px)", color: "#6B7280", lineHeight: 1.45, margin: "4px 0 0" }}>
        {desc}
      </p>
    </div>
  );
}

function FlowCol({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ borderLeft: "1px solid #D9DCE1", paddingLeft: 12 }}>
      <div style={{ fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800, color: "#C1A160", fontSize: "1.1rem", marginBottom: 2 }}>
        {num}
      </div>
      <h5 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(12px, 0.95vw, 13.5px)", color: "#1D2B3C", fontWeight: 700, margin: "0 0 4px" }}>
        {title}
      </h5>
      <p style={{ fontSize: "clamp(11px, 0.85vw, 12px)", color: "#6B7280", lineHeight: 1.45, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

function FlowSvg({ steps }: { steps: { title: string; lines: string[] }[] }) {
  const vbW = 1200;
  const vbH = 190;
  const n = steps.length;
  const margin = 30;
  const gap = 30;
  const boxW = (vbW - margin * 2 - gap * (n - 1)) / n;
  const boxH = 112;
  const y = (vbH - boxH) / 2;
  const xs = steps.map((_, i) => margin + i * (boxW + gap));

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: "100%", maxHeight: "100%" }}>
      {steps.map((s, i) => {
        const x = xs[i];
        return (
          <g key={i}>
            <rect x={x} y={y} width={boxW} height={boxH} fill="#1D2B3C" rx={4} />
            <rect x={x} y={y} width={boxW} height={4} fill="#C1A160" />
            <text x={x + boxW / 2} y={y + 30} textAnchor="middle" fill="#C1A160" fontFamily="Montserrat, Arial, sans-serif" fontWeight="800" fontSize="19">
              {i + 1}
            </text>
            <text x={x + boxW / 2} y={y + 53} textAnchor="middle" fill="#FFFFFF" fontFamily="Montserrat, Arial, sans-serif" fontWeight="700" fontSize="14">
              {s.title}
            </text>
            {s.lines.map((line, li) => (
              <text key={li} x={x + boxW / 2} y={y + 74 + li * 15} textAnchor="middle" fill="#B9C2CC" fontFamily="Open Sans, Arial, sans-serif" fontSize="11.5">
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {steps.slice(0, n - 1).map((_, i) => {
        const x1 = xs[i] + boxW;
        const x2 = xs[i + 1];
        const yc = y + boxH / 2;
        return (
          <g key={`arrow-${i}`}>
            <line x1={x1} y1={yc} x2={x2 - 9} y2={yc} stroke="#C1A160" strokeWidth="2" />
            <polygon points={`${x2 - 9},${yc - 6} ${x2},${yc} ${x2 - 9},${yc + 6}`} fill="#C1A160" />
          </g>
        );
      })}
    </svg>
  );
}

function RadarSvg({
  scores,
  overallPct,
  overallLvl,
}: {
  scores: Record<string, number>;
  overallPct: number;
  overallLvl: { name: string; color: string };
}) {
  const cx = 210;
  const cy = 210;
  const R = 160;
  const n = PILARES_DEF.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const getPoints = (scale: number) => {
    return PILARES_DEF.map((_, i) => {
      const ang = -Math.PI / 2 + i * ((2 * Math.PI) / n);
      const r = R * scale;
      return `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
    }).join(" ");
  };

  const dataPoints = PILARES_DEF.map((p, i) => {
    const ang = -Math.PI / 2 + i * ((2 * Math.PI) / n);
    const r = R * ((scores[p.key] ?? 50) / 100);
    return `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 420 420" style={{ width: "100%", maxHeight: "36vh" }}>
      {rings.map((s, idx) => (
        <polygon key={idx} points={getPoints(s)} fill="none" stroke="#D9DCE1" strokeWidth="1" />
      ))}
      <polygon points={getPoints(1)} fill="rgba(199,137,43,0.14)" stroke="none" />

      {PILARES_DEF.map((p, i) => {
        const ang = -Math.PI / 2 + i * ((2 * Math.PI) / n);
        const x2 = cx + R * Math.cos(ang);
        const y2 = cy + R * Math.sin(ang);
        const lx = cx + (R + 26) * Math.cos(ang);
        const ly = cy + (R + 26) * Math.sin(ang);
        const label = p.nome.split(" ")[0];
        return (
          <g key={p.key}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#D9DCE1" strokeWidth="1" />
            <text
              x={lx}
              y={ly + 4}
              fontSize="11.5"
              fontFamily="Montserrat, Arial, sans-serif"
              fontWeight="700"
              fill="#6B7280"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}

      <polygon points={dataPoints} fill="rgba(255,255,255,0.7)" stroke="#C1A160" strokeWidth="3" />

      {PILARES_DEF.map((p, i) => {
        const ang = -Math.PI / 2 + i * ((2 * Math.PI) / n);
        const r = R * ((scores[p.key] ?? 50) / 100);
        const px = cx + r * Math.cos(ang);
        const py = cy + r * Math.sin(ang);
        return <circle key={`dot-${p.key}`} cx={px} cy={py} r="4" fill="#1D2B3C" />;
      })}

      <circle cx={cx} cy={cy} r="48" fill="#FFFFFF" stroke="#D9DCE1" strokeWidth="1" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="800"
        fontSize="30"
        fill="#C1A160"
      >
        {overallPct}%
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="700"
        fontSize="10"
        fill={overallLvl.color}
      >
        {overallLvl.name.toUpperCase()}
      </text>
    </svg>
  );
}
