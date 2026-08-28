/**
 * Cliente Google Workspace (Calendar + Gmail + Meet) para o EA Assessor.
 *
 * Autenticação: OAuth 2.0 com refresh token de longa duração, gerado uma vez
 * pelo Thiago (fluxo de consentimento no navegador) e armazenado como
 * variável de ambiente. Nenhuma etapa aqui pede login — se as credenciais
 * não estiverem configuradas, cada função retorna um erro claro em vez de
 * quebrar o motor.
 *
 * Variáveis de ambiente necessárias:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REFRESH_TOKEN (gerado uma vez, escopo: calendar + gmail.send)
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function isGoogleWorkspaceConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

async function getAccessToken(): Promise<string> {
  if (!isGoogleWorkspaceConfigured()) {
    throw new Error(
      "Google Workspace não conectado. Faltam GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ou GOOGLE_REFRESH_TOKEN."
    );
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Falha ao renovar token do Google: ${res.status} ${errText}`);
  }

  const data = await res.json();
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return cachedAccessToken.token;
}

export interface CreateCalendarEventParams {
  title: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendeeEmails?: string[];
  createMeetLink?: boolean;
  timeZone?: string;
}

export interface CalendarEventResult {
  id: string;
  htmlLink: string;
  meetLink?: string;
}

/** Cria um evento no Google Calendar principal do Thiago, opcionalmente com link do Meet. */
export async function createGoogleCalendarEvent(
  params: CreateCalendarEventParams
): Promise<CalendarEventResult> {
  const accessToken = await getAccessToken();

  const body: Record<string, unknown> = {
    summary: params.title,
    description: params.description || "",
    start: { dateTime: params.startISO, timeZone: params.timeZone || "America/Sao_Paulo" },
    end: { dateTime: params.endISO, timeZone: params.timeZone || "America/Sao_Paulo" },
    attendees: (params.attendeeEmails || []).map((email) => ({ email })),
  };

  if (params.createMeetLink) {
    body.conferenceData = {
      createRequest: {
        requestId: `ea-assessor-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=${
    params.createMeetLink ? 1 : 0
  }&sendUpdates=all`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    meetLink: data.hangoutLink,
  };
}

export interface ListEventsParams {
  timeMinISO: string;
  timeMaxISO: string;
}

export interface CalendarEventSummary {
  id: string;
  title: string;
  startISO?: string;
  endISO?: string;
  location?: string;
}

/** Lista eventos do calendário principal num intervalo, para consultas de agenda. */
export async function listGoogleCalendarEvents(
  params: ListEventsParams
): Promise<CalendarEventSummary[]> {
  const accessToken = await getAccessToken();

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", params.timeMinISO);
  url.searchParams.set("timeMax", params.timeMaxISO);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: Record<string, unknown>) => {
    const start = item.start as Record<string, string> | undefined;
    const end = item.end as Record<string, string> | undefined;
    return {
      id: item.id as string,
      title: (item.summary as string) || "(sem título)",
      startISO: start?.dateTime || start?.date,
      endISO: end?.dateTime || end?.date,
      location: item.location as string | undefined,
    };
  });
}

export interface SendGmailParams {
  to: string;
  subject: string;
  bodyText: string;
}

/** Envia um e-mail via Gmail API em nome do Thiago (conta autorizada no OAuth). */
export async function sendGmail(params: SendGmailParams): Promise<{ id: string }> {
  const accessToken = await getAccessToken();

  const rawMessage = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    params.bodyText,
  ].join("\r\n");

  const encoded = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return { id: data.id };
}
