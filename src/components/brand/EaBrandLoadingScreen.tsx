"use client";

import { motion } from "motion/react";
import { EaLogoSpinner } from "./EaLogoSpinner";

export function EaBrandLoadingScreen({
  progress,
  fullScreen = true,
}: {
  progress?: number;
  fullScreen?: boolean;
  theme?: string;
  systemName?: string;
  statusText?: string;
}) {
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
        gap: "1.85rem",
        padding: "2rem 1.5rem",
        background: "radial-gradient(1000px 600px at 50% 35%, rgba(201,154,62,0.05) 0%, #FFFFFF 70%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        body { background: #FFFFFF !important; }
      `}</style>

      {/* SÍMBOLO INSTITUCIONAL OFICIAL EA COM ANÉIS METÁLICOS DOURADOS */}
      <EaLogoSpinner size={150} glow={true} shimmer={true} />

      {/* WORDMARK INSTITUCIONAL PURO */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.45rem", textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.18rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#1D2B3C",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Empresarial Academy
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#C99A3E",
            fontFamily: "'Sora', sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          Conhecimento que Impulsiona
        </p>
      </div>

      {/* BARRA DE PROGRESSO EM OURO LÍQUIDO */}
      <div
        style={{
          width: "100%",
          maxWidth: 240,
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
            height: 3.5,
            borderRadius: 4,
            background: "rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {progress !== undefined ? (
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #C99A3E 0%, #FFF1C5 50%, #C99A3E 100%)",
                borderRadius: 4,
                boxShadow: "0 0 8px rgba(201,154,62,0.7)",
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
                width: "45%",
                background: "linear-gradient(90deg, transparent 0%, #C99A3E 35%, #FFF1C5 50%, #C99A3E 65%, transparent 100%)",
                borderRadius: 4,
                boxShadow: "0 0 10px rgba(201,154,62,0.75)",
              }}
              animate={{
                left: ["-45%", "145%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
