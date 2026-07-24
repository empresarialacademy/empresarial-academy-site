"use client";
import { useEffect, useState } from "react";

type VoteState = "like" | "dislike" | null;
type ReactableCollection = "posts" | "materials";

function storageKey(collection: ReactableCollection, slug: string) {
  return `ea-reaction:${collection}:${slug}`;
}

/**
 * Curtir/não curtir de Artigos e Materiais. 1 voto por navegador
 * (localStorage — sem login/conta de visitante no site) — clicar de novo
 * desfaz, clicar no outro botão troca. Usado tanto no card da listagem
 * (`compact`) quanto no fim do artigo/material completo.
 */
export function LikeDislike({
  collection,
  slug,
  initialLikes,
  initialDislikes,
  compact = false,
}: {
  collection: ReactableCollection;
  slug: string;
  initialLikes: number;
  initialDislikes: number;
  compact?: boolean;
}) {
  const [vote, setVote] = useState<VoteState>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(collection, slug));
    if (stored === "like" || stored === "dislike") setVote(stored);
  }, [collection, slug]);

  const handleVote = async (clicked: "like" | "dislike") => {
    if (pending) return;
    const from = vote;
    const to: VoteState = vote === clicked ? null : clicked;

    // Otimista: atualiza a tela e o localStorage antes da resposta do servidor.
    setVote(to);
    setLikes((n) => n + ((to === "like" ? 1 : 0) - (from === "like" ? 1 : 0)));
    setDislikes((n) => n + ((to === "dislike" ? 1 : 0) - (from === "dislike" ? 1 : 0)));
    if (to) window.localStorage.setItem(storageKey(collection, slug), to);
    else window.localStorage.removeItem(storageKey(collection, slug));

    setPending(true);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, slug, from, to }),
      });
      if (!res.ok) throw new Error("falha ao votar");
      const data = await res.json();
      if (typeof data.likes === "number") setLikes(data.likes);
      if (typeof data.dislikes === "number") setDislikes(data.dislikes);
    } catch {
      // Reverte em caso de falha.
      setVote(from);
      setLikes(initialLikes);
      setDislikes(initialDislikes);
      if (from) window.localStorage.setItem(storageKey(collection, slug), from);
      else window.localStorage.removeItem(storageKey(collection, slug));
    } finally {
      setPending(false);
    }
  };

  const btnBase = compact
    ? "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
    : "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors";

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "justify-center"}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void handleVote("like");
        }}
        disabled={pending}
        aria-pressed={vote === "like"}
        aria-label="Curtir"
        className={`${btnBase} ${
          vote === "like"
            ? "bg-navy text-white"
            : "bg-surface text-navy hover:bg-line"
        }`}
      >
        <span aria-hidden>👍</span> {likes}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void handleVote("dislike");
        }}
        disabled={pending}
        aria-pressed={vote === "dislike"}
        aria-label="Não curtir"
        className={`${btnBase} ${
          vote === "dislike"
            ? "bg-navy text-white"
            : "bg-surface text-navy hover:bg-line"
        }`}
      >
        <span aria-hidden>👎</span> {dislikes}
      </button>
    </div>
  );
}
