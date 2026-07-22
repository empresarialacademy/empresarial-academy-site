import type { LegalSection } from "@/lib/legal";
import { legalUpdatedAt } from "@/lib/legal";

export function LegalArticle({ sections }: { sections: LegalSection[] }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-gray">Última atualização: {legalUpdatedAt}</p>
      <div className="prose-ea mt-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            {s.blocks.map((b, i) =>
              b.type === "p" ? (
                <p key={i}>{b.text}</p>
              ) : (
                <ul key={i}>
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
