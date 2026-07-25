"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Aplica o tema com as transições suspensas por um instante.
 *
 * Sem isso, elementos com `transition-all` (os cards) ficavam TRAVADOS na cor
 * antiga: quando a cor passa a vir de outra regra por causa de uma variável CSS
 * herdada que mudou, o navegador não inicia a transição e o valor velho
 * persiste. Verificado em produção — 19 dos 33 cards continuavam brancos no
 * modo escuro, e todos os 19 tinham `transition`.
 * Suspender também evita 33 cards fazendo cross-fade de 300ms ao trocar.
 */
function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("ea-theme-switching");
  root.setAttribute("data-theme", next);
  if (next === "light") root.removeAttribute("data-theme");
  // Força o navegador a recalcular ainda com as transições desligadas.
  void root.offsetHeight;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.remove("ea-theme-switching");
    });
  });
}

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
      applyTheme(next);
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
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
