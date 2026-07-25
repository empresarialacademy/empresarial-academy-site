/**
 * Capa padrão on-brand para materiais e artigos sem imagem própria.
 * Gera uma "capa editorial" navy/dourada com o título — sempre elegante,
 * automática para qualquer conteúdo novo criado no CMS.
 */
export function BrandCover({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="relative flex h-full w-full flex-col items-start justify-end overflow-hidden bg-navy p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_0%,#2e4358_0%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-9 select-none font-[var(--font-heading)] text-[7rem] font-bold leading-none text-white/[0.06]"
      >
        EA
      </div>
      {tag && (
        <span className="relative text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {tag}
        </span>
      )}
      <span aria-hidden className="relative mt-1.5 block h-px w-10 bg-gold" />
      <p className="relative mt-2 line-clamp-2 font-[var(--font-heading)] text-lg font-bold leading-snug text-white">
        {title}
      </p>
    </div>
  );
}
