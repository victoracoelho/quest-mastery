// WhatsApp configuration
// Set via VITE_WHATSAPP_NUMBER and VITE_WHATSAPP_MESSAGE env vars

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5527996154657';
const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Olá! Gostaria de tirar uma dúvida.';

/**
 * Get the WhatsApp URL with the configured number and message
 */
export function getWhatsAppUrl(): string {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export { WHATSAPP_NUMBER, WHATSAPP_MESSAGE };
