import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { MaterialsExplorer } from "@/components/materials/MaterialsExplorer";

export const metadata: Metadata = {
  title: "Materiais Gratuitos",
  description:
    "Central de materiais gratuitos: e-books, planilhas, templates e checklists para aplicar na sua gestão.",
  alternates: { canonical: "/materiais" },
};

export const revalidate = 60; // Next.js cache revalidation

export default async function MateriaisPage() {
  let materials = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/materials/public`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      materials = await res.json();
    }
  } catch (error) {
    console.error("Erro ao buscar materiais do EA HUB:", error);
  }

  // Generate unique categories from the string field
  const categoryNames = Array.from(new Set(materials.map((m: any) => m.category).filter(Boolean)));
  const categories = categoryNames.map((name, index) => ({ id: String(index), name }));

  return (
    <main>
      <PageHero
        title="Materiais gratuitos de alto valor"
        subtitle="E-books, planilhas, templates e checklists prontos para usar no dia a dia."
        crumbs={[{ label: "Materiais Gratuitos" }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {materials.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <p className="text-4xl" aria-hidden>
              📚
            </p>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              Em breve, novos materiais
            </h2>
            <p className="mt-2 text-gray">
              Estamos preparando materiais práticos para impulsionar a sua gestão.
            </p>
          </div>
        ) : (
          <MaterialsExplorer materials={materials} categories={categories as any} />
        )}
      </section>
    </main>
  );
}
