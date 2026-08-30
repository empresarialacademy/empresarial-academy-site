import { NextResponse } from "next/server";
import { isContentEngineRequest } from "@/lib/content-engine-auth";

export async function GET(req: Request) {
  const header = req.headers.get("authorization") ?? null;
  const hasEnvKey = Boolean(process.env.CONTENT_ENGINE_API_KEY);
  const recognized = isContentEngineRequest({ headers: req.headers } as never);
  return NextResponse.json({
    hasEnvKey,
    headerPresent: header !== null,
    headerPrefix: header ? header.slice(0, 10) : null,
    recognized,
  });
}
