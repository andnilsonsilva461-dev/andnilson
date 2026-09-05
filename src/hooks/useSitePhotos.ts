import { useState, useEffect } from 'react';
import {
  getCachedSitePhotos,
  fetchServerSitePhotos,
  DEFAULT_SITE_PHOTOS,
} from '../utils/sitePhotosStorage';

export function useSitePhotos(): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>(() => getCachedSitePhotos());

  useEffect(() => {
    fetchServerSitePhotos().then((data) => {
      if (data) setPhotos(data);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) setPhotos(e.detail);
    };

    window.addEventListener('sabor-site-photos-updated', handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sabor_da_roca_site_photos') {
        setPhotos(getCachedSitePhotos());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('sabor-site-photos-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return photos;
}
