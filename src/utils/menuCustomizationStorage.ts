/**
 * Centralized Storage & Synchronization Utility for Menu Customizations (Photo & Name)
 * Ensures that changes made in the Admin Panel sync automatically to both Mobile and PC.
 */

export interface ProductCustomization {
  name?: string;
  image?: string;
  imageUrl?: string;
  updatedAt?: string;
}

const STORAGE_KEY_CUSTOMIZATIONS = 'sabor_da_roca_menu_customizations';
const STORAGE_KEY_IMAGES_LEGACY = 'sabor_da_roca_custom_images';

// Broadcast an event whenever customizations change so the store UI updates in real-time
export function broadcastMenuCustomizationUpdate(customs: Record<string, ProductCustomization>) {
  try {
    const event = new CustomEvent('sabor-menu-customized', { detail: customs });
    window.dispatchEvent(event);
  } catch (err) {
    console.error('Error dispatching customization event', err);
  }
}

/**
 * Returns cached customizations from localStorage for instantaneous initial render
 */
export function getCachedMenuCustomizations(): Record<string, ProductCustomization> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOMIZATIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error parsing local menu customizations', err);
  }

  // Fallback: check legacy image storage
  try {
    const legacyImages = localStorage.getItem(STORAGE_KEY_IMAGES_LEGACY);
    if (legacyImages) {
      const parsed = JSON.parse(legacyImages);
      const migrated: Record<string, ProductCustomization> = {};
      for (const [id, img] of Object.entries(parsed)) {
        if (typeof img === 'string') {
          migrated[id] = { image: img, imageUrl: img };
        }
      }
      return migrated;
    }
  } catch {}

  return {};
}

/**
 * Saves customizations locally in browser
 */
function cacheCustomizations(customs: Record<string, ProductCustomization>) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMIZATIONS, JSON.stringify(customs));
    // Also sync legacy image storage
    const imagesOnly: Record<string, string> = {};
    for (const [id, item] of Object.entries(customs)) {
      const img = item.imageUrl || item.image;
      if (img) {
        imagesOnly[id] = img;
      }
    }
    localStorage.setItem(STORAGE_KEY_IMAGES_LEGACY, JSON.stringify(imagesOnly));
  } catch (err) {
    console.error('Error caching customizations', err);
  }
}

/**
 * Fetches the latest customizations from the central server.
 * This guarantees Mobile and PC devices have 100% identical data.
 */
export async function fetchServerMenuCustomizations(): Promise<Record<string, ProductCustomization>> {
  try {
    const res = await fetch(`/api/menu-customizations?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        cacheCustomizations(serverData);
        broadcastMenuCustomizationUpdate(serverData);
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server menu customizations, using local cache:', err);
  }
  return getCachedMenuCustomizations();
}

/**
 * Saves changes (Name and/or Photo) to the central server and local cache.
 */
export async function saveProductCustomization(
  itemId: string,
  updates: { name?: string; image?: string; imageUrl?: string }
): Promise<ProductCustomization> {
  const currentAll = getCachedMenuCustomizations();
  const currentItem = currentAll[itemId] || {};

  const chosenImage = updates.imageUrl !== undefined ? updates.imageUrl : updates.image;

  const updatedItem: ProductCustomization = {
    ...currentItem,
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(chosenImage !== undefined ? { image: chosenImage, imageUrl: chosenImage } : {}),
    updatedAt: new Date().toISOString(),
  };

  currentAll[itemId] = updatedItem;
  cacheCustomizations(currentAll);
  broadcastMenuCustomizationUpdate(currentAll);

  // Send to server
  try {
    const res = await fetch('/api/menu-customizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        name: updates.name,
        image: chosenImage,
        imageUrl: chosenImage,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.customizations) {
        cacheCustomizations(data.customizations);
        broadcastMenuCustomizationUpdate(data.customizations);
      }
      if (data.item) {
        return data.item;
      }
    }
  } catch (err) {
    console.error('Error saving customization to server:', err);
  }

  return updatedItem;
}

/**
 * Resets a single product's customizations (restoring default name and original image)
 */
export async function resetProductCustomization(itemId: string): Promise<void> {
  const currentAll = getCachedMenuCustomizations();
  delete currentAll[itemId];
  cacheCustomizations(currentAll);
  broadcastMenuCustomizationUpdate(currentAll);

  try {
    await fetch(`/api/menu-customizations/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Error deleting customization on server:', err);
  }
}

/**
 * Resets all customizations across the entire menu
 */
export async function resetAllProductCustomizations(): Promise<void> {
  cacheCustomizations({});
  broadcastMenuCustomizationUpdate({});

  try {
    await fetch('/api/menu-customizations/reset-all', {
      method: 'POST',
    });
  } catch (err) {
    console.error('Error resetting all customizations on server:', err);
  }
}
