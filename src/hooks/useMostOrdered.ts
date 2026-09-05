import { useState, useEffect } from 'react';
import {
  getCachedMostOrderedIds,
  fetchServerMostOrdered,
  DEFAULT_MOST_ORDERED_IDS,
} from '../utils/mostOrderedStorage';

export function useMostOrdered(): string[] {
  const [itemIds, setItemIds] = useState<string[]>(() => getCachedMostOrderedIds());

  useEffect(() => {
    fetchServerMostOrdered().then((serverIds) => {
      if (serverIds && serverIds.length > 0) {
        setItemIds(serverIds);
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setItemIds(e.detail);
      }
    };
    window.addEventListener('sabor-most-ordered-updated', handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sabor_da_roca_most_ordered') {
        setItemIds(getCachedMostOrderedIds());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('sabor-most-ordered-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return itemIds;
}
