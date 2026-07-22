"use client";

import { useMemo, useState } from "react";
import type { Material, MaterialCategory } from "@/payload-types";
import { MaterialCard } from "@/components/materials/MaterialCard";

export function MaterialsExplorer({
  materials,
  categories,
}: {
  materials: Material[];
  categories: MaterialCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const catId =
        typeof m.category === "object" && m.category ? m.category.id : m.category;
      const matchCat = activeCat === "all" || String(catId) === activeCat;
      const matchQuery =
        q === "" ||
        m.title.toLowerCase().includes(q) ||
        (m.description ?? "").toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [materials, query, activeCat]);

  return (
    <div>
      {/* Filtros */}
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias">
          <FilterChip
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          >
            Todos
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={activeCat === String(c.id)}
              onClick={() => setActiveCat(String(c.id))}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar materiais..."
            aria-label="Buscar materiais"
            className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <p className="text-4xl" aria-hidden>
            🔍
          </p>
          <p className="mt-4 text-gray">
            Nenhum material encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <MaterialCard material={m} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-gold bg-gold text-navy"
          : "border-line bg-white text-navy hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}
