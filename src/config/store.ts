import { StoreConfig } from '../types';

/**
 * ============================================================================
 * CONFIGURAÇÃO — SABOR DA ROÇA | TAPIOCA E CAFÉ
 * Shopping Avenida — Feira de Santana, Bahia
 * ============================================================================
 */

export const BRAND_NAME = 'SABOR DA ROÇA';
export const BRAND_TAGLINE = 'O verdadeiro sabor da roça em cada detalhe.';

// URL do Vídeo Fullscreen do Hero (Vídeo do Sabor da Roça gerado a partir da filmagem real)
export const HERO_VIDEO_URL = '/videos/sabor_da_roca_hero.mp4';

// WhatsApp de atendimento e pedidos em Feira de Santana
export const WHATSAPP_NUMBER = '5575999998888';
export const WHATSAPP_DEFAULT_MESSAGE = 'Olá! Gostaria de consultar o cardápio e fazer um pedido no Sabor Da Roça (Shopping Avenida).';

// iFood Store Link
export const IFOOD_URL =
  'https://www.ifood.com.br/delivery/feira-de-santana-ba/sabor-da-roca-sim/f373dcc2-b625-4449-aff0-5cc628e61c9b?utm_medium=share';

export function getWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || WHATSAPP_DEFAULT_MESSAGE;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const STORE_CONFIG: StoreConfig = {
  name: BRAND_NAME,
  tagline: BRAND_TAGLINE,
  logoUrl: '/images/sabor_da_roca_logo_1788311269974.jpg',
  phone: '(75) 3622-0000',
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappDefaultMessage: WHATSAPP_DEFAULT_MESSAGE,
  ifoodStoreUrl: IFOOD_URL,
  instagramHandle: '@sabordaroca_avenida',
  instagramUrl: 'https://instagram.com/sabordaroca_avenida',
  address: {
    street: 'Av. Noide Cerqueira',
    number: '5500',
    neighborhood: 'Shopping Avenida',
    city: 'Feira de Santana',
    state: 'BA',
    zipCode: '44086-002',
    googleMapsUrl: 'https://maps.google.com/?q=Shopping+Avenida+Feira+de+Santana',
  },
  hours: {
    weekdays: '07:30 — 21:30',
    saturday: '08:00 — 22:00',
    sunday: '08:30 — 21:00',
  },
};



