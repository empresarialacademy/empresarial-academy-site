"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function EaHubThemeWrapper({
  children,
  headerActions,
}: {
  userName?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ea_hub_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("ea_hub_theme", next);
  }

  const isDark = theme === "dark";

  return (
    <div
      data-theme={theme}
      style={
        {
          minHeight: "100vh",
          "--ea-surface-bg": isDark ? "#16202E" : "#FFFFFF",
          "--ea-surface-subtle": isDark ? "rgba(255,255,255,0.04)" : "#F3EFE8",
          "--ea-card-primary-bg": isDark ? "rgba(201,154,62,0.12)" : "#FFFFFF",
          "--ea-box-bg": isDark ? "rgba(255,255,255,0.035)" : "#F8F6F2",
          "--ea-card-border": isDark ? "rgba(201,154,62,0.22)" : "#E7E2D8",
          "--ea-text-primary": isDark ? "#F4F1E9" : "#1D2B3C",
          "--ea-text-secondary": isDark ? "#A0ABC0" : "#5B6472",
          background: isDark
            ? "radial-gradient(1200px 700px at 15% 0%, rgba(201,154,62,0.12) 0%, transparent 60%), linear-gradient(180deg, #101924 0%, #0B1119 100%)"
            : "radial-gradient(1200px 700px at 15% 0%, rgba(201,154,62,0.05) 0%, transparent 60%), #F7F5F1",
          color: isDark ? "#F4F1E9" : "#1D2B3C",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          padding: "0 0 4rem",
          transition: "background 0.25s ease, color 0.25s ease",
        } as React.CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        .ea-hub-shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.5rem 1rem;
        }
        .ea-theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: ${isDark ? "rgba(255,255,255,0.08)" : "rgba(29,43,60,0.06)"};
          border: 1px solid ${isDark ? "rgba(201,154,62,0.3)" : "rgba(201,154,62,0.4)"};
          color: ${isDark ? "#E5CA8C" : "#1D2B3C"};
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.45rem 0.85rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ea-theme-toggle:hover {
          transform: translateY(-1px);
          border-color: #C99A3E;
          background: ${isDark ? "rgba(201,154,62,0.18)" : "rgba(201,154,62,0.12)"};
        }
        .ea-hub-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: ${isDark ? "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)" : "#FFFFFF"};
          border: 1px solid ${isDark ? "rgba(201,154,62,0.18)" : "#E2DCD0"};
          border-radius: 16px;
          padding: 1.35rem 1.4rem 1.2rem;
          box-shadow: ${isDark ? "0 10px 28px -10px rgba(0,0,0,0.5)" : "0 3px 10px rgba(29,43,60,0.04)"};
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          min-height: 100%;
          position: relative;
          overflow: hidden;
        }
        .ea-hub-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #C99A3E, transparent);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .ea-hub-card:hover {
          transform: translateY(-3px);
          border-color: #C99A3E;
          background: ${isDark ? "linear-gradient(180deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.04) 100%)" : "#FFFFFF"};
          box-shadow: ${isDark ? "0 18px 40px -12px rgba(0,0,0,0.7), 0 0 20px rgba(201,154,62,0.12)" : "0 10px 24px rgba(29,43,60,0.09)"};
        }
        .ea-hub-card:hover::before {
          opacity: 1;
        }
        .ea-hub-card strong {
          color: ${isDark ? "#FFFFFF" : "#1D2B3C"};
        }
        .ea-hub-card p {
          color: ${isDark ? "#A0ABC0" : "#4A5568"};
        }
        .ea-hub-card--disabled { opacity: 0.55; cursor: default; }
        .ea-hub-card--disabled:hover { transform: none; }
        .ea-hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.15rem; }
        .ea-pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3F7D58;
          box-shadow: 0 0 0 0 rgba(63,125,88,0.7);
          animation: eaPulse 2s infinite;
        }
        @keyframes eaPulse {
          0% { box-shadow: 0 0 0 0 rgba(63,125,88,0.7); }
          70% { box-shadow: 0 0 0 6px rgba(63,125,88,0); }
          100% { box-shadow: 0 0 0 0 rgba(63,125,88,0); }
        }
      `}</style>

      <div className="ea-hub-shell">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
          {headerActions}
          {mounted ? (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleTheme}
              className="ea-theme-toggle"
              title="Alternar entre modo claro e escuro"
            >
              <span>{isDark ? "🌙 Modo Escuro" : "☀️ Modo Claro"}</span>
            </motion.button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
