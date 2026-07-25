"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Alterna claro/escuro. A escolha do usuário fica no localStorage; sem
 * escolha salva, segue a preferência do aparelho (e continua acompanhando
 * mudanças do sistema enquanto ninguém escolher manualmente).
 * O tema inicial é aplicado pelo script inline no layout, ANTES da
 * primeira pintura — este componente só reflete e troca o estado.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(current);

    // Sem preferência salva, acompanhar o sistema em tempo real.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("ea-theme")) return;
      const next: Theme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ea-theme", next);
    } catch {
      // modo privado / storage bloqueado: troca vale só nesta navegação
    }
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      // Sem JS montado o rótulo ficaria errado; só anuncia depois de montar.
      aria-label={
        mounted
          ? isDark
            ? "Mudar para o modo claro"
            : "Mudar para o modo escuro"
          : "Alternar modo claro e escuro"
      }
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${className}`}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
