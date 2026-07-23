import Image from "next/image";
import Link from "next/link";
import { DownloadButton } from "@/components/materials/DownloadButton";
import type { EAHubMaterial } from "@/components/materials/MaterialsExplorer";

export function MaterialCard({ material }: { material: EAHubMaterial }) {
  const coverUrl = material.cover_image ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${material.cover_image}` : null;
  const category = material.category;
  const kind = material.file_extension ? material.file_extension.toUpperCase() : "DOC";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-lg h-full">
      <Link
        href={`/materiais/${material.slug}`}
        className="block"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-navy">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={material.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl" aria-hidden>
              📘
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
            {kind}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {category && (
          <span className="text-xs font-medium uppercase tracking-wide text-gray">
            {category}
          </span>
        )}
        <h3 className="mt-1 text-lg font-semibold text-navy">
          <Link href={`/materiais/${material.slug}`} className="hover:text-gold">
            {material.title}
          </Link>
        </h3>
        {material.description && (
          <p className="mt-2 flex-1 text-sm text-gray">{material.description}</p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 mt-auto pt-4">
          <DownloadButton slug={material.slug ?? ""} title={material.title} />
          <span className="text-xs text-gray">
            {material.download_count ?? 0} downloads
          </span>
        </div>
      </div>
    </article>
  );
}
