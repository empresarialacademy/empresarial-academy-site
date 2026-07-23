"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const input =
  "w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold";

export function NewsletterForm({
  origem = "Newsletter",
  compact = false,
}: {
  origem?: string;
  compact?: boolean;
}) {
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nome: String(fd.get("nome") ?? ""),
      empresa: String(fd.get("empresa") ?? ""),
      email: String(fd.get("email") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      instagram: String(fd.get("instagram") ?? ""),
      consentimento: fd.get("consentimento") === "on",
      origem,
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setWhatsapp("");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.errors) {
        setErrors(data.errors);
        setStatus("idle");
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl bg-white/10 p-5 text-center">
        <p className="text-2xl" aria-hidden>
          ✅
        </p>
        <p className="mt-2 text-sm">
          Inscrição recebida! Em breve você receberá nossos conteúdos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div aria-hidden className="absolute left-[-9999px]" tabIndex={-1}>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
        <div>
          <input name="nome" placeholder="Seu nome" aria-label="Nome" className={input} required />
          {errors.nome && <p className="mt-1 text-xs text-danger">{errors.nome}</p>}
        </div>
        <input name="empresa" placeholder="Empresa" aria-label="Empresa" className={input} />
        <div>
          <input
            name="email"
            type="email"
            placeholder="Seu melhor e-mail"
            aria-label="E-mail"
            className={input}
            required
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>
        <input
          name="whatsapp"
          type="tel"
          inputMode="tel"
          placeholder="WhatsApp"
          aria-label="WhatsApp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
          className={input}
        />
        <input
          name="instagram"
          placeholder="@ do Instagram"
          aria-label="Instagram"
          className={`${input} ${compact ? "" : "sm:col-span-2"}`}
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-white/80">
        <input name="consentimento" type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" required />
        <span>
          Aceito receber conteúdos e novidades, conforme a{" "}
          <Link href="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível enviar agora. Tente novamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-gold px-6 py-3 font-[var(--font-heading)] font-semibold text-navy transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Quero receber"}
      </button>
    </form>
  );
}
