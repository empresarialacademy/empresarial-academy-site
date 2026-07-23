import Image from "next/image";
import type { Testimonial } from "@/payload-types";

export function TestimonialCard({ item }: { item: Testimonial }) {
  const photo = typeof item.photo === "object" ? item.photo : null;
  const rating = item.rating ?? 0;

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-sm">
      {rating > 0 && (
        <div className="mb-3 text-gold" aria-label={`Nota ${rating} de 5`}>
          {"★".repeat(rating)}
          <span className="text-line">{"★".repeat(5 - rating)}</span>
        </div>
      )}
      <blockquote className="flex-1 text-gray">“{item.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {photo?.url ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? item.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-[var(--font-heading)] text-sm font-bold text-gold">
            {item.name.charAt(0)}
          </span>
        )}
        <div>
          <div className="font-semibold text-navy">{item.name}</div>
          {item.role && <div className="text-xs text-gray">{item.role}</div>}
        </div>
      </figcaption>
    </figure>
  );
}
