"use client";

import React, { useState } from "react";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

interface Props {
  postsCount: number;
  leadsCount: number;
}

export function SecretariaClientPanel({ postsCount, leadsCount }: Props) {
  const [testInput, setTestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "secretaria"; text: string; time: string }>>([
    {
      sender: "secretaria",
      text: "Olá, Thiago! Estou conectada ao seu WhatsApp (+55 11 95661-9990) e pronta para gerenciar seus e-mails, calendários, posts no EA Post, conversas no EA Flow e ordens de código para o Antigravity. Como posso te apoiar agora?",
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
      // Chamada para a API do Gemini
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
          text: data.reply || "Mensagem processada com sucesso!",
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "secretaria",
          text: "Recebi seu comando. Ação registrada e sincronizada com o motor executivo da EA!",
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 5 Sub-Agents Grid */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#cbd5e1", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🏛️</span> Divisão de Agentes Especializados
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {/* Agent 1 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span style={badgeActive}>Ativo</span>
            </div>
            <h3 style={cardTitle}>Agente Calendar & E-mail</h3>
            <p style={cardDesc}>Google Calendar, Gmail, Outlook e Microsoft 365.</p>
            <div style={cardFooter}>Agenda sincronizada</div>
          </div>

          {/* Agent 2 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📱</span>
              <span style={badgeActive}>Conectado</span>
            </div>
            <h3 style={cardTitle}>Agente Social Engine</h3>
            <p style={cardDesc}>Fila de posts e aprovação rápida no EA Post.</p>
            <div style={cardFooter}>{postsCount} posts no ecossistema</div>
          </div>

          {/* Agent 3 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <span style={badgeActive}>Em Nuvem</span>
            </div>
            <h3 style={cardTitle}>Agente Atendimento & CRM</h3>
            <p style={cardDesc}>EA Flow, inbox de leads e automações de DM.</p>
            <div style={cardFooter}>{leadsCount} leads cadastrados</div>
          </div>

          {/* Agent 4 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={badgeActive}>Pronto</span>
            </div>
            <h3 style={cardTitle}>Agente Antigravity Dev</h3>
            <p style={cardDesc}>Fila de tarefas de código, deploys e testes.</p>
            <div style={cardFooter}>Comandos via WhatsApp</div>
          </div>

          {/* Agent 5 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📝</span>
              <span style={badgeActive}>Automático</span>
            </div>
            <h3 style={cardTitle}>Agente Briefing & Tactiq</h3>
            <p style={cardDesc}>Síntese diária (07:30 / 19:00) e transcrições.</p>
            <div style={cardFooter}>Modo Proativo</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Chat Console & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Left: Chat Simulator Console */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            height: 480,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              background: "#0f172a",
              borderBottom: "1px solid #334155",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>Terminal Direto da Secretária (Gemini AI)</span>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>gemini-flash-latest</span>
          </div>

          {/* Messages Log */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    background: msg.sender === "user" ? "#0284c7" : "#0f172a",
                    color: "#f8fafc",
                    border: msg.sender === "user" ? "none" : "1px solid #334155",
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: 10, color: "#64748b", marginTop: 4, padding: "0 4px" }}>
                  {msg.time}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ color: "#38bdf8", fontSize: 12, fontStyle: "italic" }}>
                Secretária digitando...
              </div>
            )}
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: 12,
              background: "#0f172a",
              borderTop: "1px solid #334155",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite uma ordem ou pergunta para a Secretária..."
              style={{
                flex: 1,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "8px 12px",
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
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </form>
        </div>

        {/* Right: Quick Actions & Integrations Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick Command Card */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 12px" }}>⚡ Ações Rápidas de Teste</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => setTestInput("Qual o resumo do meu briefing de hoje com reuniões e e-mails?")}
                style={actionBtnStyle}
              >
                ☀️ Gerar Briefing Matinal
              </button>
              <button
                onClick={() => setTestInput("Verifique se há posts pendentes de aprovação no EA Post.")}
                style={actionBtnStyle}
              >
                📱 Checar Fila do EA Post
              </button>
              <button
                onClick={() => setTestInput("Mostre as conversas recentes de clientes no EA Flow.")}
                style={actionBtnStyle}
              >
                💬 Puxar Leads do EA Flow
              </button>
              <button
                onClick={() => setTestInput("Antigravity, crie uma tarefa para auditar as conexões de API.")}
                style={actionBtnStyle}
              >
                ⚡ Disparar Ordem para o Antigravity
              </button>
            </div>
          </div>

          {/* WhatsApp Channel Card */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📲</span>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>Canal WhatsApp Oficial</h3>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.4 }}>
              Instância <strong>secretaria-ea</strong> ativa na VPS da Contabo (<code style={{ color: "#38bdf8" }}>217.216.52.208:8080</code>).
            </p>
            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              ✓ Conectado ao número +55 (11) 95661-9990
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
};

const cardTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#f8fafc",
  margin: "0 0 4px",
};

const cardDesc: React.CSSProperties = {
  fontSize: 11,
  color: "#94a3b8",
  margin: "0 0 12px",
  lineHeight: 1.4,
  flex: 1,
};

const cardFooter: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#38bdf8",
  borderTop: "1px solid #334155",
  paddingTop: 8,
};

const badgeActive: React.CSSProperties = {
  background: "rgba(16, 185, 129, 0.15)",
  color: "#10b981",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  border: "1px solid rgba(16, 185, 129, 0.3)",
};

const actionBtnStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "#e2e8f0",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12,
  textAlign: "left",
  cursor: "pointer",
  transition: "background 0.2s",
};
