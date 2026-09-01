"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EaLogoSpinner } from "./EaLogoSpinner";

interface EaBrandLoadingScreenProps {
  systemName?: string;
  statusText?: string;
  progress?: number;
  fullScreen?: boolean;
  theme?: "dark" | "light" | "glass";
}

const DEFAULT_STATUS_STEPS = [
  "Conectando ao Ecossistema Empresarial Academy...",
  "Carregando Cockpit de Vendas e Fechamento...",
  "Sincronizando Indicadores e Diagnóstico DME...",
  "Preparando Ambiente Seguro & Criptografado...",
];

export function EaBrandLoadingScreen({
  systemName = "HUB",
  statusText,
  progress,
  fullScreen = true,
  theme = "light",
}: EaBrandLoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (statusText) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % DEFAULT_STATUS_STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [statusText]);

  const activeMessage = statusText || DEFAULT_STATUS_STEPS[currentStepIndex];
  const isDark = theme === "dark";
  const isGlass = theme === "glass";

  return (
    <div
      style={{
        position: fullScreen ? "fixed" : "relative",
        inset: fullScreen ? 0 : undefined,
        width: "100%",
        height: fullScreen ? "100vh" : "100%",
        minHeight: fullScreen ? undefined : 420,
        zIndex: fullScreen ? 99999 : 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.75rem",
        padding: "2rem 1.5rem",
        background: isGlass
          ? "rgba(16, 25, 36, 0.75)"
          : isDark
            ? "radial-gradient(1000px 600px at 50% 30%, rgba(201,154,62,0.12) 0%, rgba(16,25,36,0.98) 60%, #0B1119 100%)"
            : "radial-gradient(1000px 600px at 50% 30%, rgba(201,154,62,0.06) 0%, #FFFFFF 70%)",
        backdropFilter: isGlass ? "blur(20px)" : undefined,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        body { background: #FFFFFF !important; }
      `}</style>

      {/* SÍMBOLO ANIMADO OFICIAL EA COM ANÉIS DOURADOS */}
      <EaLogoSpinner size={145} systemName={systemName} glow={true} shimmer={true} />

      {/* CABEÇALHO DA MARCA */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.76rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#C99A3E",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Empresarial Academy
        </p>
        <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: isDark || isGlass ? "#FFFFFF" : "#1D2B3C",
            fontFamily: "'Sora', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {systemName ? `Central ${systemName.toUpperCase()}` : "Central de Sistemas"}
        </h3>
      </div>

      {/* BARRA DE PROGRESSO METÁLICA DOURADA */}
      <div
        style={{
          width: "100%",
          maxWidth: 280,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 4,
            borderRadius: 4,
            background: isDark || isGlass ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {progress !== undefined ? (
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #C99A3E 0%, #FFF1C5 50%, #C99A3E 100%)",
                borderRadius: 4,
                boxShadow: "0 0 10px rgba(201,154,62,0.8)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          ) : (
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "40%",
                background: "linear-gradient(90deg, transparent 0%, #C99A3E 35%, #FFF1C5 50%, #C99A3E 65%, transparent 100%)",
                borderRadius: 4,
                boxShadow: "0 0 12px rgba(201,154,62,0.85)",
              }}
              animate={{
                left: ["-40%", "140%"],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* STATUS TEXT ROTATIVO COM ANIMATEPRESENCE */}
        <div style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeMessage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{
                margin: 0,
                fontSize: "0.78rem",
                fontWeight: 500,
                color: isDark || isGlass ? "#A0ABC0" : "#5B6472",
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              {activeMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* SELO DE SEGURANÇA & ASSINATURA */}
      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem", opacity: 0.75, fontSize: "0.72rem", color: isDark || isGlass ? "#A0ABC0" : "#5B6472" }}>
        <span>Conhecimento que Impulsiona</span>
        <span>•</span>
        <span>Empresarial Academy</span>
      </div>
    </div>
  );
}
