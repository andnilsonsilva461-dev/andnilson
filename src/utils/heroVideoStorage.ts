/**
 * Hero Video Storage & Cross-Device Persistence Utility for Sabor da Roça
 * Synchronizes hero video choices across both PC and Mobile devices via server-side API,
 * with resilient offline fallback to local browser cache.
 */

export const DEFAULT_HERO_VIDEO_URL = '/videos/sabor_da_roca_hero.mp4';
export const DEFAULT_HERO_POSTER_URL = '/images/sabor_roca_video_frame.jpg';

export const HERO_VIDEO_SYNC_EVENT = 'sabor-hero-video-synced';
export const HERO_VIDEO_STORAGE_SYNC_KEY = 'sabor_hero_video_sync_timestamp';

export interface HeroVideoConfig {
  src: string;
  publicUrl?: string;
  relativeSrc?: string;
  type: 'default' | 'file' | 'url';
  label: string;
  size?: number;
  updatedAt?: string;
}

export interface VideoUploadProgress {
  phase: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  message: string;
}

/**
 * Dispatches a global event so all components on this client (and other browser tabs)
 * immediately update their video player state.
 */
function notifyVideoUpdated(config: HeroVideoConfig) {
  try {
    localStorage.setItem(HERO_VIDEO_STORAGE_SYNC_KEY, JSON.stringify({
      timestamp: Date.now(),
      config,
    }));
    window.dispatchEvent(new CustomEvent(HERO_VIDEO_SYNC_EVENT, { detail: config }));
  } catch {}
}

/**
 * Retrieve current active video for Hero Section.
 * Queries the centralized server first (ensuring PC and Mobile always match),
 * with instant fallback to local cache.
 */
export async function getActiveHeroVideo(): Promise<HeroVideoConfig> {
  // 1. Try fetching authoritative config from the server
  try {
    const res = await fetch('/api/hero-video', { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const serverConfig: HeroVideoConfig = await res.json();
      if (serverConfig && serverConfig.src) {
        const effectiveConfig: HeroVideoConfig = {
          ...serverConfig,
          src: serverConfig.publicUrl || serverConfig.src,
        };
        // Cache in localStorage for instant warm boot & Vercel deployment
        try {
          localStorage.setItem('sabor_da_roca_cached_hero_video', JSON.stringify(effectiveConfig));
        } catch {}
        return effectiveConfig;
      }
    }
  } catch (err) {
    console.warn('Servidor indisponível no momento, buscando cópia em cache local:', err);
  }

  // 2. Fallback to cached copy in localStorage
  try {
    const cached = localStorage.getItem('sabor_da_roca_cached_hero_video');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.src) {
        return parsed;
      }
    }
  } catch {}

  // 3. Fallback to default video
  return {
    src: DEFAULT_HERO_VIDEO_URL,
    publicUrl: DEFAULT_HERO_VIDEO_URL,
    type: 'default',
    label: 'Vídeo da Hero',
  };
}

/**
 * Upload a video file to the server with real-time progress tracking.
 * Accepts MP4, WebM, MOV files up to 100MB (surpassing the 50MB requirement).
 */
export function uploadHeroVideoFile(
  file: File,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<HeroVideoConfig> {
  return new Promise((resolve, reject) => {
    // 1. Validation
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isVideo) {
      const err = new Error('Formato inválido. Selecione um arquivo de vídeo no formato MP4.');
      onProgress?.({
        phase: 'error',
        percent: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        message: err.message,
      });
      return reject(err);
    }

    const MAX_LIMIT = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_LIMIT) {
      const err = new Error('Arquivo excede o limite máximo permitido de 100 MB.');
      onProgress?.({
        phase: 'error',
        percent: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        message: err.message,
      });
      return reject(err);
    }

    // 2. XMLHttpRequest for real progress events
    const xhr = new XMLHttpRequest();
    const fileType = file.type || 'video/mp4';
    const fileName = encodeURIComponent(file.name);

    xhr.open('POST', '/api/hero-video/upload', true);
    xhr.setRequestHeader('Content-Type', fileType);
    xhr.setRequestHeader('x-file-name', fileName);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        const loadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
        const totalMb = (event.total / (1024 * 1024)).toFixed(1);
        
        onProgress?.({
          phase: 'uploading',
          percent,
          loadedBytes: event.loaded,
          totalBytes: event.total,
          message: `Enviando... ${percent}% (${loadedMb} MB de ${totalMb} MB)`,
        });
      } else {
        onProgress?.({
          phase: 'uploading',
          percent: 50,
          loadedBytes: event.loaded,
          totalBytes: file.size,
          message: 'Enviando vídeo...',
        });
      }
    };

    xhr.upload.onload = () => {
      onProgress?.({
        phase: 'processing',
        percent: 100,
        loadedBytes: file.size,
        totalBytes: file.size,
        message: 'Processando...',
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const config: HeroVideoConfig = data.config || {
            src: `/videos/hero_active.mp4?v=${Date.now()}`,
            type: 'file',
            label: file.name,
            size: file.size,
            updatedAt: new Date().toISOString(),
          };

          const finalConfig: HeroVideoConfig = {
            ...config,
            src: config.publicUrl || config.src,
          };

          try {
            localStorage.setItem('sabor_da_roca_cached_hero_video', JSON.stringify(finalConfig));
          } catch {}

          notifyVideoUpdated(finalConfig);

          onProgress?.({
            phase: 'success',
            percent: 100,
            loadedBytes: file.size,
            totalBytes: file.size,
            message: 'Vídeo salvo com sucesso',
          });

          resolve(finalConfig);
        } catch (e: any) {
          const err = new Error('Resposta do servidor inválida após upload.');
          onProgress?.({
            phase: 'error',
            percent: 0,
            loadedBytes: 0,
            totalBytes: file.size,
            message: err.message,
          });
          reject(err);
        }
      } else {
        let errorMsg = `Erro ${xhr.status}: Falha no upload`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.error) errorMsg = parsed.error;
        } catch {}
        const err = new Error(errorMsg);
        onProgress?.({
          phase: 'error',
          percent: 0,
          loadedBytes: 0,
          totalBytes: file.size,
          message: errorMsg,
        });
        reject(err);
      }
    };

    xhr.onerror = () => {
      const err = new Error('Falha de conexão durante o upload. Verifique sua rede e tente novamente.');
      onProgress?.({
        phase: 'error',
        percent: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        message: err.message,
      });
      reject(err);
    };

    xhr.onabort = () => {
      const err = new Error('Upload cancelado pelo usuário.');
      onProgress?.({
        phase: 'error',
        percent: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        message: err.message,
      });
      reject(err);
    };

    xhr.send(file);
  });
}

/**
 * Legacy wrapper for compatibility with older callers
 */
export async function saveHeroVideoFile(file: File): Promise<HeroVideoConfig> {
  return uploadHeroVideoFile(file);
}

/**
 * Save an external video URL to the server so it is shared across all devices.
 */
export async function saveHeroVideoUrl(url: string, label = 'Link de Vídeo Externo'): Promise<HeroVideoConfig> {
  const cleanUrl = url.trim();

  const response = await fetch('/api/hero-video/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: cleanUrl,
      label,
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao salvar link de vídeo no servidor.');
  }

  const data = await response.json();
  const config: HeroVideoConfig = data.config || {
    src: cleanUrl,
    publicUrl: cleanUrl,
    type: 'url',
    label,
    updatedAt: new Date().toISOString(),
  };

  const finalConfig: HeroVideoConfig = {
    ...config,
    src: config.publicUrl || config.src,
  };

  try {
    localStorage.setItem('sabor_da_roca_cached_hero_video', JSON.stringify(finalConfig));
  } catch {}

  notifyVideoUpdated(finalConfig);
  return finalConfig;
}

/**
 * Reset Hero video back to official default on server and all devices.
 */
export async function resetHeroVideo(): Promise<HeroVideoConfig> {
  try {
    const response = await fetch('/api/hero-video/reset', {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      const config: HeroVideoConfig = data.config || {
        src: DEFAULT_HERO_VIDEO_URL,
        publicUrl: DEFAULT_HERO_VIDEO_URL,
        type: 'default',
        label: 'Vídeo Padrão Oficial (Sabor da Roça)',
      };
      const finalConfig: HeroVideoConfig = {
        ...config,
        src: config.publicUrl || config.src,
      };
      try {
        localStorage.setItem('sabor_da_roca_cached_hero_video', JSON.stringify(finalConfig));
      } catch {}
      notifyVideoUpdated(finalConfig);
      return finalConfig;
    }
  } catch (err) {
    console.warn('Erro ao chamar /api/hero-video/reset no servidor:', err);
  }

  const defaultConf: HeroVideoConfig = {
    src: DEFAULT_HERO_VIDEO_URL,
    publicUrl: DEFAULT_HERO_VIDEO_URL,
    type: 'default',
    label: 'Vídeo Padrão Oficial (Sabor da Roça)',
  };

  try {
    localStorage.setItem('sabor_da_roca_cached_hero_video', JSON.stringify(defaultConf));
  } catch {}
  notifyVideoUpdated(defaultConf);
  return defaultConf;
}
