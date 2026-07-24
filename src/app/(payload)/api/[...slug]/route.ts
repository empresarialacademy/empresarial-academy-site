import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

const getHandler = REST_GET(config);

export const GET = getHandler;
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);

/**
 * O Payload 3.85 não exporta um `REST_HEAD` — sem essa rota tratando HEAD, o
 * request cai num catch-all genérico e volta 404. O otimizador de imagem da
 * Vercel faz HEAD antes de buscar a imagem pra validar; com 404 aí, rejeita
 * QUALQUER imagem servida por `/api/media/file/...` com
 * `400 INVALID_IMAGE_OPTIMIZE_REQUEST` — mesmo arquivos que existem e servem
 * normalmente via GET. Reaproveita o mesmo handler do GET e descarta o corpo
 * (semântica padrão de HEAD: mesmos headers, sem corpo).
 */
export async function HEAD(
  request: Request,
  args: { params: Promise<{ slug?: string[] }> },
) {
  const res = await getHandler(request, args);
  return new Response(null, { status: res.status, headers: res.headers });
}
