import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  invert = false,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      <h2
        className={cn(
          "text-2xl font-bold md:text-3xl",
          invert ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      <span
        aria-hidden
        className={cn(
          "mt-4 block h-px w-24 bg-gold",
          align === "center" && "mx-auto",
        )}
      />
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl",
            invert ? "text-white/80" : "text-gray",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
