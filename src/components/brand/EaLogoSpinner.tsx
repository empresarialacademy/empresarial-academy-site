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
 * EaLogoSpinner: Loader institucional da Empresarial Academy.
 * Logo 100% circular com o monograma oficial e apenas UM anel dourado girando em seu entorno.
 */
export function EaLogoSpinner({
  size = 136,
  glow = true,
  shimmer = true,
}: EaLogoSpinnerProps) {
  const badgeSize = size;
  const scale = size / 220;
  const monogramWidth = badgeSize * 0.88;
  const ringSize = badgeSize + 22 * scale;

  return (
    <div
      style={{
        position: "relative",
        width: ringSize + 16 * scale,
        height: ringSize + 16 * scale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 1. GLOW ATMOSFÉRICO DOURADO SUTIL */}
      {glow ? (
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: ringSize * 1.05,
            height: ringSize * 1.05,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,154,62,0.22) 0%, rgba(201,154,62,0.03) 60%, transparent 75%)",
            filter: "blur(14px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* 2. APENAS UM CÍRCULO DOURADO GIRANDO EM SEU ENTORNO */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `${Math.max(2, 2.5 * scale)}px solid transparent`,
          borderTopColor: "#C99A3E",
          borderRightColor: "#E5CA8C",
          borderBottomColor: "rgba(201,154,62,0.2)",
          borderLeftColor: "transparent",
          boxShadow: "0 0 10px rgba(201,154,62,0.35)",
          zIndex: 1,
        }}
      />

      {/* 3. LOGO DA EA EM FORMATO PERFEITAMENTE CIRCULAR */}
      <motion.div
        animate={{
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "relative",
          width: badgeSize,
          height: badgeSize,
          borderRadius: "50%",
          background: "linear-gradient(315deg, #26374C 0%, #161F2C 100%)",
          border: `${Math.max(1.5, 2 * scale)}px solid #C99A3E`,
          boxShadow: "0 10px 25px rgba(0,0,0,0.22), 0 0 15px rgba(201,154,62,0.18), inset 0 1px 2px rgba(255,255,255,0.15)",
          display: "flex",
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
              repeatDelay: 0.8,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(229,202,140,0.4) 50%, rgba(255,255,255,0.12) 60%, transparent 80%)",
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
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.45))",
            zIndex: 2,
          }}
          priority
        />
      </motion.div>
    </div>
  );
}
