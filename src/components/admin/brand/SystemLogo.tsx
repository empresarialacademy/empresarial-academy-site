/**
 * Lockup "EA + nome do sistema" para telas de login: mesmo monograma do
 * logo oficial (recortado do PNG real com fundo removido — `ea-monogram.png`
 * em /public — não é uma recriação aproximada em vetor, é a peça de arte
 * original) sobre fundo navy com cantos suavizados, com o wordmark
 * "EMPRESARIAL ACADEMY" substituído pelo nome do sistema, na mesma posição/
 * tamanho/ornamento (linha–losango–linha) do original. Mesmo arquivo
 * `ea-monogram.png` copiado nos 4 repositórios (site, ea-social-engine,
 * ea-flow, cicj) — regra de marca: o monograma é intocável, só o texto
 * abaixo muda por sistema.
 *
 * HTML puro (não SVG) de propósito: <img> dentro de <foreignObject> é frágil
 * entre navegadores/SSR: div+img com posicionamento absoluto é mais robusto
 * e mais fácil de manter consistente nos 4 stacks (3 Next.js + 1 HTML puro
 * no EA Recovery, que replica esta mesma estrutura em CSS puro).
 */
export function SystemLogo({
  systemName,
  size = 220,
}: {
  /** Nome do sistema, ex.: "Post", "Recovery", "Flow", "Hub" — substitui "Empresarial Academy" por inteiro, mantendo só o monograma. */
  systemName: string;
  size?: number;
}) {
  const upper = systemName.toUpperCase();
  const scale = size / 220;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 28 * scale,
        background: "linear-gradient(315deg, #26374C 0%, #161F2C 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src="/ea-monogram.png"
        alt=""
        style={{ width: 90 * scale, height: "auto", marginTop: 26 * scale }}
      />
      <div
        style={{
          marginTop: 16 * scale,
          fontFamily: "Montserrat, Arial, sans-serif",
          fontWeight: 700,
          fontSize: (upper.length > 9 ? 15 : 18) * scale,
          letterSpacing: "0.04em",
          color: "#C1A160",
        }}
      >
        {upper}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * scale, marginTop: 8 * scale }}>
        <span style={{ width: 24 * scale, height: 1, background: "#C1A160" }} />
        <span
          style={{
            width: 6 * scale,
            height: 6 * scale,
            background: "#C1A160",
            transform: "rotate(45deg)",
          }}
        />
        <span style={{ width: 24 * scale, height: 1, background: "#C1A160" }} />
      </div>
    </div>
  );
}
