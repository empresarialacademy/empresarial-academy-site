import Image from "next/image";

/**
 * Logo da Empresarial Academy para a tela de login do /admin
 * (admin.components.graphics.Logo). Sempre a versão de fundo navy — nunca a
 * de fundo branco (regra de marca).
 */
export function EaLogo() {
  return (
    <Image
      src="/logo-empresarial-academy.png"
      alt="Empresarial Academy"
      width={192}
      height={183}
      style={{ width: 180, height: "auto", maxWidth: "100%" }}
      priority
    />
  );
}
