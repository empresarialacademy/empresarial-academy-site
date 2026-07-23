import type { EmailAdapter } from "payload";
import { sendMail } from "@/lib/email";

/**
 * Adapter de e-mail do PRÓPRIO Payload (auth: "esqueci minha senha",
 * verificação de conta). Sem isso, o Payload só escreve o e-mail no log do
 * servidor ("Email will be written to console") — o admin nunca recebe nada.
 * Reaproveita o mesmo `sendMail()` (Resend→SMTP→log) usado pelos leads.
 */
const FROM_ADDRESS = "contato@empresarialacademy.com";
const FROM_NAME = "Empresarial Academy";

export const resendEmailAdapter: EmailAdapter = () => ({
  name: "resend-via-sendmail",
  defaultFromAddress: FROM_ADDRESS,
  defaultFromName: FROM_NAME,
  sendEmail: async (message) => {
    const to = Array.isArray(message.to)
      ? message.to.map((t) => (typeof t === "string" ? t : t.address)).join(", ")
      : typeof message.to === "string"
        ? message.to
        : message.to?.address;

    return sendMail({
      to,
      from: `${FROM_NAME} <${FROM_ADDRESS}>`,
      subject: message.subject || "",
      html: typeof message.html === "string" ? message.html : "",
      text: typeof message.text === "string" ? message.text : "",
    });
  },
});
