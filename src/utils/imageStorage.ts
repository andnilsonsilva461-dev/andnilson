/**
 * Storage and Image Processing Utilities for Sabor da Roça Admin Panel
 */

const STORAGE_KEY_IMAGES = 'sabor_da_roca_custom_images';
const STORAGE_KEY_ADMIN_CODE = 'sabor_da_roca_admin_code';
export const DEFAULT_ADMIN_CODE = 'roca2025';

export function getAdminCode(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_CODE);
    return saved && saved.trim() !== '' ? saved.trim() : DEFAULT_ADMIN_CODE;
  } catch {
    return DEFAULT_ADMIN_CODE;
  }
}

export function updateAdminCode(newCode: string): boolean {
  if (!newCode || newCode.trim().length < 4) {
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_CODE, newCode.trim());
    return true;
  } catch (err) {
    console.error('Error updating admin code', err);
    return false;
  }
}

export function verifyAdminCode(inputCode: string): boolean {
  const current = getAdminCode();
  return inputCode.trim() === current;
}

export function getCustomImages(): Record<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_IMAGES);
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error('Error loading custom images', err);
    return {};
  }
}

export function saveCustomImage(itemId: string, imageUrl: string): void {
  try {
    const images = getCustomImages();
    images[itemId] = imageUrl;
    localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));

    // Also notify server in background
    fetch('/api/menu-customizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, image: imageUrl }),
    }).catch((e) => console.warn('Sync image error:', e));

    window.dispatchEvent(new CustomEvent('sabor-menu-customized'));
  } catch (err) {
    console.error('Error saving custom image', err);
  }
}

export function removeCustomImage(itemId: string): void {
  try {
    const images = getCustomImages();
    delete images[itemId];
    localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));

    // Also notify server in background
    fetch(`/api/menu-customizations/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Remove image error:', e));

    window.dispatchEvent(new CustomEvent('sabor-menu-customized'));
  } catch (err) {
    console.error('Error removing custom image', err);
  }
}

export function clearAllCustomImages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_IMAGES);
  } catch (err) {
    console.error('Error clearing custom images', err);
  }
}

/**
 * Compresses an image file to keep localStorage size under safe limits (max ~1000px, 80% JPEG)
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao processar arquivo de imagem'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
