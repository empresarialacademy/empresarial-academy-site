"use client";

import { useState } from "react";
import Link from "next/link";

type Errors = Record<string, string>;
type Status = "idle" | "loading" | "success" | "error";

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold";

export function ContactForm() {
  const [telefone, setTelefone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nome: String(fd.get("nome") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefone: String(fd.get("telefone") ?? ""),
      assunto: String(fd.get("assunto") ?? ""),
      mensagem: String(fd.get("mensagem") ?? ""),
      consentimento: fd.get("consentimento") === "on",
      website: String(fd.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        setTelefone("");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.errors) {
        setErrors(data.errors);
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center"
      >
        <p className="text-4xl" aria-hidden>
          ✅
        </p>
        <h3 className="mt-3 text-lg font-semibold text-navy">
          Mensagem enviada!
        </h3>
        <p className="mt-2 text-sm text-gray">
          Obrigado pelo contato. Nossa equipe retornará em breve.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-gold-ink hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot — escondido de usuários, visível para bots */}
      <div aria-hidden className="absolute left-[-9999px]" tabIndex={-1}>
        <label>
          Não preencha
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Nome" name="nome" error={errors.nome} required>
        <input id="nome" name="nome" type="text" className={inputClass} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="E-mail" name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Telefone / WhatsApp" name="telefone" error={errors.telefone} required>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            className={inputClass}
            required
          />
        </Field>
      </div>

      <Field label="Assunto" name="assunto">
        <select id="assunto" name="assunto" className={inputClass} defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          <option>Avaliação gratuita</option>
          <option>Curso Gestão 360</option>
          <option>Mentorias</option>
          <option>Palestras</option>
          <option>Consultoria</option>
          <option>Outro</option>
        </select>
      </Field>

      <Field label="Mensagem" name="mensagem" error={errors.mensagem} required>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={5}
          className={inputClass}
          required
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm text-gray">
          <input
            name="consentimento"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--color-gold)]"
            required
          />
          <span>
            Autorizo o contato e o tratamento dos meus dados conforme a{" "}
            <Link href="/privacidade" className="font-semibold text-navy underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consentimento && (
          <p className="mt-1 text-xs text-danger">{errors.consentimento}</p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível enviar agora. Tente novamente em instantes.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-gold px-6 py-3 font-[var(--font-heading)] font-semibold tracking-wide text-navy transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-gold-ink"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
