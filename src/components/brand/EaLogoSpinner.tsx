"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface EaLogoSpinnerProps {
  size?: number;
  systemName?: string;
  glow?: boolean;
  shimmer?: boolean;
}

/**
 * EaLogoSpinner: Loader executivo oficial baseado no símbolo da Empresarial Academy.
 * Combina anéis concêntricos metálicos giratórios, pulso de glow atmosférico
 * e feixe de luz metálica sobre o monograma oficial.
 */
export function EaLogoSpinner({
  size = 140,
  systemName,
  glow = true,
  shimmer = true,
}: EaLogoSpinnerProps) {
  const badgeSize = size;
  const scale = size / 220;
  const monogramWidth = 90 * scale;

  return (
    <div
      style={{
        position: "relative",
        width: badgeSize + 44 * scale,
        height: badgeSize + 44 * scale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 1. GLOW ATMOSFÉRICO PULSANTE DOURADO */}
      {glow ? (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: badgeSize * 1.1,
            height: badgeSize * 1.1,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,154,62,0.35) 0%, rgba(201,154,62,0.06) 55%, transparent 75%)",
            filter: "blur(18px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* 2. ANEL ORBITAL EXTERNO COM ROTAÇÃO 360° E LOSANGOS DOURADOS */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          width: badgeSize + 28 * scale,
          height: badgeSize + 28 * scale,
          borderRadius: "50%",
          border: "1px dashed rgba(201,154,62,0.45)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Ponto Cardeal Norte: Losango Dourado */}
        <span
          style={{
            position: "absolute",
            top: -3.5 * scale,
            width: 7 * scale,
            height: 7 * scale,
            background: "linear-gradient(135deg, #FFF1C5 0%, #C99A3E 100%)",
            transform: "rotate(45deg)",
            boxShadow: "0 0 8px rgba(201,154,62,0.9)",
          }}
        />
        {/* Ponto Cardeal Sul: Losango Dourado */}
        <span
          style={{
            position: "absolute",
            bottom: -3.5 * scale,
            width: 7 * scale,
            height: 7 * scale,
            background: "linear-gradient(135deg, #FFF1C5 0%, #C99A3E 100%)",
            transform: "rotate(45deg)",
            boxShadow: "0 0 8px rgba(201,154,62,0.9)",
          }}
        />
      </motion.div>

      {/* 3. ANEL ORBITAL MÉDIO COM ROTAÇÃO INVERTIDA (GIROSCÓPICA) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          width: badgeSize + 12 * scale,
          height: badgeSize + 12 * scale,
          borderRadius: "50%",
          borderTop: "2px solid #E5CA8C",
          borderRight: "1px solid rgba(201,154,62,0.3)",
          borderBottom: "2px solid #C99A3E",
          borderLeft: "1px solid rgba(201,154,62,0.3)",
          zIndex: 1,
        }}
      />

      {/* 4. EMBLEMA CENTRAL COM BADGE NAVY & MONOGRAMA OFICIAL EA */}
      <motion.div
        animate={{
          scale: [1, 1.025, 1],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "relative",
          width: badgeSize,
          height: badgeSize,
          borderRadius: 28 * scale,
          background: "linear-gradient(315deg, #26374C 0%, #161F2C 100%)",
          border: "1px solid rgba(201,154,62,0.5)",
          boxShadow: "0 14px 35px rgba(0,0,0,0.45), 0 0 25px rgba(201,154,62,0.22), inset 0 1px 1px rgba(255,255,255,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        {/* SHIMMER LIGHT SWEEP: Feixe Metálico Dourado/Luminoso */}
        {shimmer ? (
          <motion.div
            animate={{
              x: ["-140%", "140%"],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatDelay: 0.6,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.06) 40%, rgba(229,202,140,0.35) 50%, rgba(255,255,255,0.1) 60%, transparent 80%)",
              transform: "skewX(-20deg)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        ) : null}

        {/* Monograma Oficial da EA */}
        <Image
          src="/ea-monogram.png"
          alt="Empresarial Academy"
          width={180}
          height={180}
          style={{
            width: monogramWidth,
            height: "auto",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
            zIndex: 2,
          }}
          priority
        />

        {/* Subtítulo ou Nome do Sistema */}
        {systemName ? (
          <div
            style={{
              marginTop: 10 * scale,
              fontFamily: "'Sora', Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: (systemName.length > 8 ? 12 : 14) * scale,
              letterSpacing: "0.12em",
              color: "#C99A3E",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            {systemName}
          </div>
        ) : null}

        {/* Ornamento Clássico da Marca (Linha–Losango–Linha) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6 * scale,
            marginTop: 6 * scale,
            zIndex: 2,
          }}
        >
          <span style={{ width: 18 * scale, height: 1, background: "#C99A3E", opacity: 0.8 }} />
          <motion.span
            animate={{ rotate: [45, 225, 405] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: 5 * scale,
              height: 5 * scale,
              background: "#C99A3E",
              boxShadow: "0 0 6px rgba(201,154,62,0.8)",
            }}
          />
          <span style={{ width: 18 * scale, height: 1, background: "#C99A3E", opacity: 0.8 }} />
        </div>
      </motion.div>
    </div>
  );
}
