/**
 * Gerenciador e sincronizador de fotos institucionais do site Sabor da Roça
 * (Logo, Abertura, Destaque da Casa, Espaço, Localização e Instagram)
 */

export interface SitePhotoSlot {
  key: string;
  label: string;
  category: 'Identidade Visual' | 'Página Inicial' | 'O Espaço' | 'Localização' | 'Feed do Instagram';
  description: string;
  defaultUrl: string;
  aspect: string;
  recommended: string;
}

export const SITE_PHOTO_SLOTS: SitePhotoSlot[] = [
  {
    key: 'logo',
    label: 'Logo Oficial da Marca',
    category: 'Identidade Visual',
    description: 'Exibida no topo (cabeçalho) e no rodapé do site, visível em todas as telas.',
    defaultUrl: '/images/sabor_da_roca_logo_1788311269974.jpg',
    aspect: 'aspect-square',
    recommended: 'Formato quadrado ou circular (mínimo 300x300px)',
  },
  {
    key: 'hero_poster',
    label: 'Capa / Poster do Vídeo da Hero',
    category: 'Identidade Visual',
    description: 'Foto exibida antes do vídeo de abertura carregar ou começar a rodar.',
    defaultUrl: '/images/sabor_roca_video_frame.jpg',
    aspect: 'aspect-video',
    recommended: 'Proporção 16:9 paisagem (1920x1080px ou similar)',
  },
  {
    key: 'editorial_opening',
    label: 'Foto da Seção Abertura',
    category: 'Página Inicial',
    description: 'Foto da primeira seção após a hero: "Tapiocas feitas à mão, preparadas na chapa no Shopping Avenida".',
    defaultUrl: '/images/tapioca_recheada_1788311286058.jpg',
    aspect: 'aspect-[4/3]',
    recommended: 'Proporção 4:3 com destaque gastronômico da chapa',
  },
  {
    key: 'editorial_highlight',
    label: 'Foto do Destaque da Casa',
    category: 'Página Inicial',
    description: 'Foto da seção editorial "Destaque da Casa — Tapioca Carne de Sol & Coalho Tostado".',
    defaultUrl: '/images/tapioca_recheada_1788311286058.jpg',
    aspect: 'aspect-[4/3]',
    recommended: 'Proporção 4:3 com a tapioca recheada quentinha',
  },
  {
    key: 'space_main',
    label: 'O Espaço — Balcão no Shopping Avenida',
    category: 'O Espaço',
    description: 'Foto principal da seção O Espaço: vista do balcão, vitrine e acolhimento na loja.',
    defaultUrl: '/images/sabor_roca_video_frame.jpg',
    aspect: 'aspect-[16/10]',
    recommended: 'Foto horizontal do ambiente e balcão da loja',
  },
  {
    key: 'space_secondary',
    label: 'O Espaço — Mesa & Aconchego',
    category: 'O Espaço',
    description: 'Foto secundária da seção O Espaço: café passado na hora, cuscuz ou lanche na mesa.',
    defaultUrl: '/images/cuscuz_nordestino_1788311301928.jpg',
    aspect: 'aspect-[4/3]',
    recommended: 'Foto de prato regional servido à mesa no shopping',
  },
  {
    key: 'location',
    label: 'Localização & Visite-nos',
    category: 'Localização',
    description: 'Foto na seção de localização: balcão do Sabor da Roça no Shopping Avenida.',
    defaultUrl: '/images/sabor_roca_video_frame.jpg',
    aspect: 'aspect-video',
    recommended: 'Foto da fachada/balcão para fácil reconhecimento do cliente',
  },
  {
    key: 'insta_1',
    label: 'Instagram #1 — Tapioca Renda',
    category: 'Feed do Instagram',
    description: 'Foto 1 da grade do Instagram (@sabordaroca_avenida).',
    defaultUrl: '/images/tapioca_recheada_1788311286058.jpg',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
  {
    key: 'insta_2',
    label: 'Instagram #2 — Cuscuz no Vapor',
    category: 'Feed do Instagram',
    description: 'Foto 2 da grade do Instagram.',
    defaultUrl: '/images/cuscuz_nordestino_1788311301928.jpg',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
  {
    key: 'insta_3',
    label: 'Instagram #3 — Bolos do Dia',
    category: 'Feed do Instagram',
    description: 'Foto 3 da grade do Instagram.',
    defaultUrl: '/images/bolo_da_roca_1788311315751.jpg',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
  {
    key: 'insta_4',
    label: 'Instagram #4 — Café Coado na Hora',
    category: 'Feed do Instagram',
    description: 'Foto 4 da grade do Instagram.',
    defaultUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
  {
    key: 'insta_5',
    label: 'Instagram #5 — Café da Manhã Regional',
    category: 'Feed do Instagram',
    description: 'Foto 5 da grade do Instagram.',
    defaultUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
  {
    key: 'insta_6',
    label: 'Instagram #6 — Iced Coffee & Refrescos',
    category: 'Feed do Instagram',
    description: 'Foto 6 da grade do Instagram.',
    defaultUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    aspect: 'aspect-square',
    recommended: 'Foto quadrada 1:1',
  },
];

const STORAGE_KEY_SITE_PHOTOS = 'sabor_da_roca_site_photos';

// Map of default URLs for quick fallback
export const DEFAULT_SITE_PHOTOS: Record<string, string> = Object.fromEntries(
  SITE_PHOTO_SLOTS.map((slot) => [slot.key, slot.defaultUrl])
);

/**
 * Lê fotos do site do cache local com fallback para padrão
 */
export function getCachedSitePhotos(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITE_PHOTOS);
    if (raw) {
      return { ...DEFAULT_SITE_PHOTOS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error reading site photos from localStorage:', err);
  }
  return { ...DEFAULT_SITE_PHOTOS };
}

/**
 * Atualiza o cache local e despacha evento global para atualização imediata
 */
export function updateCachedSitePhotos(photos: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_SITE_PHOTOS, JSON.stringify(photos));
  } catch (err) {
    console.error('Error writing site photos to localStorage:', err);
  }
  try {
    const event = new CustomEvent('sabor-site-photos-updated', { detail: photos });
    window.dispatchEvent(event);
  } catch (err) {
    console.error('Error dispatching site photos event:', err);
  }
}

/**
 * Busca fotos do site diretamente no servidor
 */
export async function fetchServerSitePhotos(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/site-photos');
    if (res.ok) {
      const serverPhotos = await res.json();
      const merged = { ...DEFAULT_SITE_PHOTOS, ...serverPhotos };
      updateCachedSitePhotos(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch site photos from server:', err);
  }
  return getCachedSitePhotos();
}

/**
 * Salva uma foto do site no servidor e sincroniza cache local
 */
export async function saveSitePhoto(
  photoKey: string,
  imageUrl: string
): Promise<{ success: boolean; photos: Record<string, string>; savedUrl?: string }> {
  // Update locally first for instant UI response
  const current = getCachedSitePhotos();
  const updated = { ...current, [photoKey]: imageUrl };
  updateCachedSitePhotos(updated);

  try {
    const res = await fetch('/api/site-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoKey, imageUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.photos) {
        const merged = { ...DEFAULT_SITE_PHOTOS, ...data.photos };
        updateCachedSitePhotos(merged);
        return { success: true, photos: merged, savedUrl: data.savedUrl };
      }
    }
  } catch (err) {
    console.error('Error saving site photo to server:', err);
  }

  return { success: true, photos: updated, savedUrl: imageUrl };
}

/**
 * Redefine uma foto específica de volta para a imagem padrão
 */
export async function resetSitePhoto(
  photoKey: string
): Promise<{ success: boolean; photos: Record<string, string> }> {
  const current = getCachedSitePhotos();
  const defaultUrl = DEFAULT_SITE_PHOTOS[photoKey] || '';
  const updated = { ...current, [photoKey]: defaultUrl };
  updateCachedSitePhotos(updated);

  try {
    const res = await fetch(`/api/site-photos/${photoKey}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.photos) {
        const merged = { ...DEFAULT_SITE_PHOTOS, ...data.photos };
        updateCachedSitePhotos(merged);
        return { success: true, photos: merged };
      }
    }
  } catch (err) {
    console.error('Error resetting site photo on server:', err);
  }

  return { success: true, photos: updated };
}

/**
 * Restaura todas as fotos do site para o padrão original
 */
export async function resetAllSitePhotos(): Promise<{ success: boolean; photos: Record<string, string> }> {
  updateCachedSitePhotos(DEFAULT_SITE_PHOTOS);

  try {
    const res = await fetch('/api/site-photos/reset-all', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      const merged = { ...DEFAULT_SITE_PHOTOS, ...(data.photos || {}) };
      updateCachedSitePhotos(merged);
      return { success: true, photos: merged };
    }
  } catch (err) {
    console.error('Error resetting all site photos on server:', err);
  }

  return { success: true, photos: DEFAULT_SITE_PHOTOS };
}
