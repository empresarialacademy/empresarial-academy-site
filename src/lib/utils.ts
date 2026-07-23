import { siteConfig } from "@/lib/site-config";

/** Monta o link do WhatsApp com mensagem pré-preenchida. */
export function whatsappUrl(message: string = siteConfig.contact.whatsappMessage) {
  return `https://wa.me/${siteConfig.contact.phoneRaw}?text=${encodeURIComponent(message)}`;
}

/** Concatena classes condicionais de forma simples. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
