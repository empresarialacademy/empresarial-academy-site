import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="bg-navy text-white">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-5 px-6 py-24 text-center">
        <p className="font-[var(--font-heading)] text-6xl font-bold text-gold">
          404
        </p>
        <h1 className="text-2xl font-bold md:text-3xl">
          Página não encontrada
        </h1>
        <p className="max-w-md text-white/70">
          A página que você procura não existe ou foi movida. Vamos te levar de
          volta ao caminho do crescimento.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/" variant="primary" size="md">
            Voltar à Home
          </Button>
          <Button href="/contato" variant="outline" size="md">
            Falar com a gente
          </Button>
        </div>
      </div>
    </main>
  );
}
