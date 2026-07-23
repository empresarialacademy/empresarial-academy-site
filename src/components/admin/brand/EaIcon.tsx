import Image from "next/image";

/**
 * Ícone da Empresarial Academy para o nav recolhido do /admin
 * (admin.components.graphics.Icon). Mesmo arquivo do logo — a peça já é um
 * badge quadrado, funciona bem reduzida.
 */
export function EaIcon() {
  return (
    <Image
      src="/logo-empresarial-academy.png"
      alt="EA"
      width={192}
      height={183}
      style={{ width: 32, height: "auto" }}
    />
  );
}
