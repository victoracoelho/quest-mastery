// WhatsApp configuration - hardcoded for reliability

const WHATSAPP_NUMBER = '5527996154657';
const WHATSAPP_MESSAGE = 'Olá! Gostaria de tirar uma dúvida sobre o RevisaQuest.';

/**
 * Get the WhatsApp URL with the configured number and message
 */
export function getWhatsAppUrl(): string {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export { WHATSAPP_NUMBER, WHATSAPP_MESSAGE };
