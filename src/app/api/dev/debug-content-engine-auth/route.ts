import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { isContentEngineRequest } from "@/lib/content-engine-auth";

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

export async function GET(req: Request) {
  const header = req.headers.get("authorization") ?? null;
  const expected = process.env.CONTENT_ENGINE_API_KEY ?? null;
  const bearerValue = header?.startsWith("Bearer ") ? header.slice(7) : header;
  const recognized = isContentEngineRequest({ headers: req.headers } as never);
  return NextResponse.json({
    hasEnvKey: Boolean(expected),
    envKeyLength: expected?.length ?? null,
    envKeyHash: expected ? shortHash(expected) : null,
    headerPresent: header !== null,
    headerStartsWithBearerSpace: header?.startsWith("Bearer ") ?? null,
    bearerValueLength: bearerValue?.length ?? null,
    bearerValueHash: bearerValue ? shortHash(bearerValue) : null,
    exactMatch: header === `Bearer ${expected}`,
    recognized,
  });
}
