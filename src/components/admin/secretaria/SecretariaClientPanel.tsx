"use client";

import React, { useState } from "react";

const NAVY = "#1D2B3C";
const NAVY_LIGHT = "#26364A";
const GOLD = "#C1A160";
const OFFWHITE = "#F6F5F1";
const GRAPHITE = "#15191F";
const GRAY = "#6B7280";
const LINE = "#33445A";
const GREEN = "#2E7D5B";
const AMBER = "#C7892B";

interface Props {
  postsCount: number;
  leadsCount: number;
}

interface Agent {
  label: string;
  title: string;
  desc: string;
  status: "conectado" | "pendente";
  footer: string;
}

const AGENTS: Agent[] = [
  {
    label: "01",
    title: "Calendário & E-mail",
    desc: "Google Calendar, Gmail, Outlook 365 e Teams.",
    status: "pendente",
    footer: "Aguardando autorização (OAuth)",
  },
  {
    label: "02",
    title: "Social Engine",
    desc: "Fila de posts e aprovação rápida no EA Post.",
    status: "conectado",
    footer: "",
  },
  {
    label: "03",
    title: "Atendimento & CRM",
    desc: "EA Flow, inbox de leads e automações de DM.",
    status: "conectado",
    footer: "",
  },
  {
    label: "04",
    title: "Antigravity Dev",
    desc: "Fila de tarefas de código, deploys e testes.",
    status: "conectado",
    footer: "Comandos via WhatsApp",
  },
  {
    label: "05",
    title: "Briefing Executivo",
    desc: "Síntese diária (07:30 / 19:00) e transcrições.",
    status: "conectado",
    footer: "Modo proativo",
  },
];

export function SecretariaClientPanel({ postsCount, leadsCount }: Props) {
  const [testInput, setTestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "secretaria"; text: string; time: string }>>([
    {
      sender: "secretaria",
      text: "Thiago, estou conectada ao seu WhatsApp (+55 11 95661-9990), pronta para agenda, e-mail e o ecossistema EA. Como posso apoiar agora?",
      time: "Agora",
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || loading) return;

    const userMsg = testInput.trim();
    setTestInput("");
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setChatLog((prev) => [...prev, { sender: "user", text: userMsg, time: now }]);
    setLoading(true);

    try {
      const res = await fetch("/api/secretaria/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatLog((prev) => [
        ...prev,
        {
          sender: "secretaria",
          text: data.reply || "Não consegui processar essa mensagem agora.",
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "secretaria",
          text: "Tive um problema técnico ao processar isso. Pode repetir?",
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: "'Open Sans', Calibri, Arial, sans-serif" }}>
      {/* Divisão de Agentes */}
      <div>
        <div style={sectionHeader}>
          <span style={sectionKicker}>Governança operacional</span>
          <h2 style={sectionTitle}>Divisão de Agentes Especializados</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
          {AGENTS.map((agent) => (
            <div key={agent.label} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={cardLabel}>{agent.label}</span>
                <span style={agent.status === "conectado" ? badgeActive : badgePending}>
                  {agent.status === "conectado" ? "Conectado" : "Pendente"}
                </span>
              </div>
              <h3 style={cardTitle}>{agent.title}</h3>
              <p style={cardDesc}>{agent.desc}</p>
              {agent.footer && <div style={cardFooter}>{agent.footer}</div>}
              {agent.title === "Social Engine" && <div style={cardFooter}>{postsCount} posts no ecossistema</div>}
              {agent.title === "Atendimento & CRM" && <div style={cardFooter}>{leadsCount} leads cadastrados</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Console + Ações */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
        {/* Console */}
        <div style={{ background: NAVY, display: "flex", flexDirection: "column", height: 500 }}>
          <div
            style={{
              padding: "16px 20px",
              background: GRAPHITE,
              borderBottom: `2px solid ${GOLD}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: 0.3 }}>
                TERMINAL EXECUTIVO
              </div>
              <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>EA Assessor · Gemini</div>
            </div>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 0.5 }}>PT-BR · GMT-3</span>
          </div>

          <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {chatLog.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    background: msg.sender === "user" ? GOLD : NAVY_LIGHT,
                    color: msg.sender === "user" ? NAVY : "#F1F0EC",
                    border: msg.sender === "user" ? "none" : `1px solid ${LINE}`,
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: 10, color: GRAY, marginTop: 4, padding: "0 4px" }}>{msg.time}</span>
              </div>
            ))}
            {loading && <div style={{ color: GOLD, fontSize: 12, fontStyle: "italic" }}>processando…</div>}
          </div>

          <form onSubmit={handleSend} style={{ padding: 14, background: GRAPHITE, borderTop: `1px solid ${LINE}`, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Escreva uma instrução para o EA Assessor…"
              style={{
                flex: 1,
                background: NAVY,
                border: `1px solid ${LINE}`,
                padding: "9px 12px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: GOLD,
                color: NAVY,
                border: "none",
                padding: "9px 18px",
                fontFamily: "'Montserrat', Arial, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.3,
                cursor: "pointer",
              }}
            >
              ENVIAR
            </button>
          </form>
        </div>

        {/* Coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: LINE }}>
          <div style={{ background: OFFWHITE, padding: 20 }}>
            <h3 style={panelTitle}>Instruções sugeridas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setTestInput("Qual a minha agenda de amanhã?")} style={actionBtnStyle}>
                Consultar agenda de amanhã
              </button>
              <button onClick={() => setTestInput("Verifique se há posts pendentes de aprovação no EA Post.")} style={actionBtnStyle}>
                Checar fila do EA Post
              </button>
              <button onClick={() => setTestInput("Mostre as conversas recentes de clientes no EA Flow.")} style={actionBtnStyle}>
                Puxar leads do EA Flow
              </button>
              <button onClick={() => setTestInput("Antigravity, crie uma tarefa para auditar as conexões de API.")} style={actionBtnStyle}>
                Disparar ordem ao Antigravity
              </button>
            </div>
          </div>

          <div style={{ background: OFFWHITE, padding: 20, flex: 1 }}>
            <h3 style={panelTitle}>Canal WhatsApp</h3>
            <p style={{ fontSize: 12, color: GRAY, margin: "0 0 14px", lineHeight: 1.5 }}>
              Instância <strong style={{ color: GRAPHITE }}>secretaria-ea</strong> ativa 24/7 na infraestrutura em nuvem
              (Contabo VPS).
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: GREEN }}>
              <span style={{ width: 7, height: 7, background: GREEN, display: "inline-block" }} />
              +55 (11) 95661-9990 · online
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid #D9DCE1` }}>
              <div style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>Conexões pendentes de autorização</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: AMBER }}>
                <span style={{ width: 7, height: 7, background: AMBER, display: "inline-block" }} />
                Google Calendar / Gmail
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: AMBER, marginTop: 6 }}>
                <span style={{ width: 7, height: 7, background: AMBER, display: "inline-block" }} />
                Outlook 365 / Teams
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionHeader: React.CSSProperties = { marginBottom: 14 };
const sectionKicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: GOLD,
  letterSpacing: 1,
  textTransform: "uppercase",
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 18,
  fontWeight: 700,
  color: GRAPHITE,
  margin: "4px 0 0",
};

const cardStyle: React.CSSProperties = {
  background: OFFWHITE,
  padding: 18,
  display: "flex",
  flexDirection: "column",
};

const cardLabel: React.CSSProperties = {
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  color: GOLD,
  letterSpacing: 1,
};

const cardTitle: React.CSSProperties = {
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 14,
  fontWeight: 700,
  color: GRAPHITE,
  margin: "0 0 6px",
};

const cardDesc: React.CSSProperties = {
  fontSize: 12,
  color: GRAY,
  margin: "0 0 12px",
  lineHeight: 1.5,
  flex: 1,
};

const cardFooter: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: NAVY,
  borderTop: "1px solid #D9DCE1",
  paddingTop: 8,
};

const badgeActive: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: GREEN,
};

const badgePending: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: AMBER,
};

const panelTitle: React.CSSProperties = {
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: GRAPHITE,
  margin: "0 0 14px",
};

const actionBtnStyle: React.CSSProperties = {
  background: "#fff",
  color: GRAPHITE,
  border: "1px solid #D9DCE1",
  padding: "9px 12px",
  fontSize: 12,
  textAlign: "left",
  cursor: "pointer",
};
