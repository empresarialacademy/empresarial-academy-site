/**
 * Ferramentas (function calling) que o EA Assessor pode acionar a partir de
 * uma instrução do Thiago no WhatsApp (texto ou áudio). Cada tool tem uma
 * declaração no formato do Gemini e um executor que chama a integração real.
 *
 * Ações que escrevem em sistemas externos (e-mail, evento de calendário)
 * exigem `confirmado: true` — o modelo é instruído a só passar isso depois
 * que o Thiago confirmou explicitamente na conversa. Sem confirmação, o
 * executor devolve um resumo da ação proposta em vez de executá-la.
 */

import {
  createGoogleCalendarEvent,
  isGoogleWorkspaceConfigured,
  listGoogleCalendarEvents,
  sendGmail,
} from "@/lib/assessor/google-workspace";
import {
  createOutlookEvent,
  isMicrosoftGraphConfigured,
  listOutlookEvents,
  sendOutlookMail,
} from "@/lib/assessor/microsoft-graph";

export const ASSESSOR_TOOL_DECLARATIONS = [
  {
    name: "consultar_agenda",
    description:
      "Consulta os compromissos do Thiago num intervalo de datas, no Google Calendar e/ou Outlook (o que estiver conectado).",
    parameters: {
      type: "OBJECT",
      properties: {
        inicioISO: { type: "STRING", description: "Início do intervalo, ISO 8601, ex: 2026-08-29T00:00:00-03:00" },
        fimISO: { type: "STRING", description: "Fim do intervalo, ISO 8601" },
      },
      required: ["inicioISO", "fimISO"],
    },
  },
  {
    name: "criar_evento_agenda",
    description:
      "Cria um compromisso na agenda do Thiago (reunião com participantes ou só um lembrete pessoal). Os únicos dados obrigatórios são título, data e horário — participantesEmail é OPCIONAL, não espere ter o e-mail de ninguém para criar o evento. Se ele já deu título/data/horário, isso já é confirmação suficiente para agendar direto.",
    parameters: {
      type: "OBJECT",
      properties: {
        titulo: { type: "STRING" },
        descricao: { type: "STRING" },
        inicioISO: { type: "STRING", description: "ISO 8601 com fuso -03:00" },
        fimISO: { type: "STRING", description: "ISO 8601 com fuso -03:00" },
        participantesEmail: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Opcional. Omita se não houver e-mail disponível — o evento é criado normalmente sem participantes.",
        },
        criarLinkReuniao: { type: "BOOLEAN", description: "true para gerar Google Meet ou Teams" },
        plataforma: { type: "STRING", enum: ["google", "outlook", "ambos"] },
        confirmado: { type: "BOOLEAN", description: "true somente se o Thiago já confirmou explicitamente" },
      },
      required: ["titulo", "inicioISO", "fimISO", "plataforma", "confirmado"],
    },
  },
  {
    name: "enviar_email",
    description:
      "Envia um e-mail em nome do Thiago. Use SOMENTE depois que ele confirmou destinatário, assunto e o conteúdo (ou aprovou um rascunho que você propôs).",
    parameters: {
      type: "OBJECT",
      properties: {
        para: { type: "STRING" },
        assunto: { type: "STRING" },
        corpo: { type: "STRING" },
        plataforma: { type: "STRING", enum: ["google", "outlook"] },
        confirmado: { type: "BOOLEAN" },
      },
      required: ["para", "assunto", "corpo", "plataforma", "confirmado"],
    },
  },
] as const;

interface ToolExecutionResult {
  ok: boolean;
  summary: string;
  data?: unknown;
}

function requiresConfirmation(actionLabel: string, args: Record<string, unknown>): ToolExecutionResult | null {
  if (args.confirmado !== true) {
    return {
      ok: false,
      summary: `Ação "${actionLabel}" ainda não foi confirmada. Descreva a ação proposta ao Thiago com todos os detalhes e peça confirmação explícita antes de executar.`,
    };
  }
  return null;
}

export async function executeAssessorTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  switch (toolName) {
    case "consultar_agenda": {
      const inicioISO = String(args.inicioISO);
      const fimISO = String(args.fimISO);
      const results: string[] = [];

      if (isGoogleWorkspaceConfigured()) {
        try {
          const events = await listGoogleCalendarEvents({ timeMinISO: inicioISO, timeMaxISO: fimISO });
          results.push(
            events.length
              ? `Google Calendar: ${events.map((e) => `${e.title} (${e.startISO})`).join("; ")}`
              : "Google Calendar: sem eventos no período."
          );
        } catch (err) {
          results.push(`Google Calendar: erro ao consultar (${(err as Error).message}).`);
        }
      }

      if (isMicrosoftGraphConfigured()) {
        try {
          const events = await listOutlookEvents({ startISO: inicioISO, endISO: fimISO });
          results.push(
            events.length
              ? `Outlook: ${events.map((e) => `${e.title} (${e.startISO})`).join("; ")}`
              : "Outlook: sem eventos no período."
          );
        } catch (err) {
          results.push(`Outlook: erro ao consultar (${(err as Error).message}).`);
        }
      }

      if (!results.length) {
        return {
          ok: false,
          summary:
            "Nenhum calendário conectado ainda. Diga ao Thiago que a conexão do Google Calendar/Outlook está pendente de autorização dele.",
        };
      }

      return { ok: true, summary: results.join(" | ") };
    }

    case "criar_evento_agenda": {
      const pending = requiresConfirmation("criar_evento_agenda", args);
      if (pending) return pending;

      const titulo = String(args.titulo);
      const descricao = args.descricao ? String(args.descricao) : undefined;
      const inicioISO = String(args.inicioISO);
      const fimISO = String(args.fimISO);
      const participantes = Array.isArray(args.participantesEmail)
        ? (args.participantesEmail as string[])
        : undefined;
      const criarLink = Boolean(args.criarLinkReuniao);
      const plataforma = String(args.plataforma || "google");

      const outcomes: string[] = [];

      if ((plataforma === "google" || plataforma === "ambos")) {
        if (!isGoogleWorkspaceConfigured()) {
          outcomes.push("Google Calendar não conectado ainda (pendente de autorização do Thiago).");
        } else {
          try {
            const result = await createGoogleCalendarEvent({
              title: titulo,
              description: descricao,
              startISO: inicioISO,
              endISO: fimISO,
              attendeeEmails: participantes,
              createMeetLink: criarLink,
            });
            outcomes.push(
              `Google Calendar: evento criado${result.meetLink ? ` com Meet ${result.meetLink}` : ""} (${result.htmlLink}).`
            );
          } catch (err) {
            outcomes.push(`Google Calendar: falha ao criar evento (${(err as Error).message}).`);
          }
        }
      }

      if (plataforma === "outlook" || plataforma === "ambos") {
        if (!isMicrosoftGraphConfigured()) {
          outcomes.push("Outlook/Teams não conectado ainda (pendente de autorização do Thiago).");
        } else {
          try {
            const result = await createOutlookEvent({
              title: titulo,
              description: descricao,
              startISO: inicioISO,
              endISO: fimISO,
              attendeeEmails: participantes,
              createTeamsMeeting: criarLink,
            });
            outcomes.push(
              `Outlook: evento criado${result.teamsJoinUrl ? ` com Teams ${result.teamsJoinUrl}` : ""} (${result.webLink}).`
            );
          } catch (err) {
            outcomes.push(`Outlook: falha ao criar evento (${(err as Error).message}).`);
          }
        }
      }

      const anySuccess = outcomes.some((o) => o.includes("evento criado"));
      return { ok: anySuccess, summary: outcomes.join(" | ") };
    }

    case "enviar_email": {
      const pending = requiresConfirmation("enviar_email", args);
      if (pending) return pending;

      const to = String(args.para);
      const subject = String(args.assunto);
      const bodyText = String(args.corpo);
      const plataforma = String(args.plataforma || "google");

      try {
        if (plataforma === "outlook") {
          if (!isMicrosoftGraphConfigured()) {
            return { ok: false, summary: "Outlook não conectado ainda (pendente de autorização do Thiago)." };
          }
          await sendOutlookMail({ to, subject, bodyText });
          return { ok: true, summary: `E-mail enviado via Outlook para ${to}.` };
        }

        if (!isGoogleWorkspaceConfigured()) {
          return { ok: false, summary: "Gmail não conectado ainda (pendente de autorização do Thiago)." };
        }
        await sendGmail({ to, subject, bodyText });
        return { ok: true, summary: `E-mail enviado via Gmail para ${to}.` };
      } catch (err) {
        return { ok: false, summary: `Falha ao enviar e-mail: ${(err as Error).message}` };
      }
    }

    default:
      return { ok: false, summary: `Ferramenta desconhecida: ${toolName}` };
  }
}
