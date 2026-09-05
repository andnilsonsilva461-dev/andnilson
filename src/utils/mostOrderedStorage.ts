/**
 * Gerenciador e sincronizador dos itens "Mais Pedidos" exibidos na página inicial do Sabor da Roça.
 * Suporta armazenamento no servidor com sincronização automática entre dispositivos.
 */

export const DEFAULT_MOST_ORDERED_IDS: string[] = [
  'tapioca-rendada-carne-seca-banana-terra-queijo',
  'tapioca-rendada-carne-seca-queijo',
  'tapioca-rendada-frango-queijo',
  'tapioca-rendada-frango-queijo-catupiry',
  'cuscuz-queijo-carne-seca-banana',
  'cuscuz-queijo-frango',
];

const STORAGE_KEY_MOST_ORDERED = 'sabor_da_roca_most_ordered';

/**
 * Lê os IDs dos Mais Pedidos do cache local
 */
export function getCachedMostOrderedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOST_ORDERED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading most ordered from localStorage:', err);
  }
  return [...DEFAULT_MOST_ORDERED_IDS];
}

/**
 * Atualiza o cache local e despacha evento global para atualização imediata na tela
 */
export function updateCachedMostOrderedIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MOST_ORDERED, JSON.stringify(ids));
  } catch (err) {
    console.error('Error writing most ordered to localStorage:', err);
  }

  try {
    const event = new CustomEvent('sabor-most-ordered-updated', { detail: ids });
    window.dispatchEvent(event);
  } catch (err) {
    console.error('Error dispatching most ordered event:', err);
  }
}

/**
 * Busca a lista dos Mais Pedidos diretamente do servidor
 */
export async function fetchServerMostOrdered(): Promise<string[]> {
  try {
    const res = await fetch('/api/most-ordered');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.itemIds) && data.itemIds.length > 0) {
        updateCachedMostOrderedIds(data.itemIds);
        return data.itemIds;
      }
    }
  } catch (err) {
    console.warn('Could not fetch most ordered from server:', err);
  }
  return getCachedMostOrderedIds();
}

/**
 * Salva a nova lista dos Mais Pedidos no servidor e sincroniza cache local
 */
export async function saveMostOrdered(
  itemIds: string[]
): Promise<{ success: boolean; itemIds: string[] }> {
  // Update locally immediately for instant feedback
  updateCachedMostOrderedIds(itemIds);

  try {
    const res = await fetch('/api/most-ordered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.itemIds)) {
        updateCachedMostOrderedIds(data.itemIds);
        return { success: true, itemIds: data.itemIds };
      }
    }
  } catch (err) {
    console.error('Error saving most ordered to server:', err);
  }

  return { success: true, itemIds };
}

/**
 * Restaura a lista dos Mais Pedidos para o padrão original
 */
export async function resetMostOrdered(): Promise<{ success: boolean; itemIds: string[] }> {
  updateCachedMostOrderedIds(DEFAULT_MOST_ORDERED_IDS);

  try {
    const res = await fetch('/api/most-ordered/reset', {
      method: 'POST',
    });

    if (res.ok) {
      const data = await res.json();
      const list = data?.itemIds || DEFAULT_MOST_ORDERED_IDS;
      updateCachedMostOrderedIds(list);
      return { success: true, itemIds: list };
    }
  } catch (err) {
    console.error('Error resetting most ordered on server:', err);
  }

  return { success: true, itemIds: DEFAULT_MOST_ORDERED_IDS };
}
