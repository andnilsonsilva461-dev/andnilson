import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { HERO_VIDEO_URL as STORE_HERO_VIDEO_URL } from '../config/store';
import { useSitePhotos } from '../hooks/useSitePhotos';

/**
 * ============================================================================
 * HERO_VIDEO_URL & HERO_POSTER_URL
 * Ativo de vídeo e imagem fixa oficial do Sabor da Roça no Shopping Avenida.
 * ============================================================================
 */
export const HERO_VIDEO_URL = STORE_HERO_VIDEO_URL || '/videos/sabor_da_roca_hero.mp4';
export const HERO_POSTER_URL = '/images/sabor_roca_video_frame.jpg';

interface HeroProps {
  onExploreMenu?: () => void;
  onOpenBasket?: () => void;
  videoSrc?: string;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, videoSrc }) => {
  const sitePhotos = useSitePhotos();
  const currentHeroPoster = sitePhotos.hero_poster || HERO_POSTER_URL;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeVideoSrc = videoSrc || HERO_VIDEO_URL;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Tentar autoplay com suporte irrestrito a mobile (Safari iOS / Android)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    
    // Recarregar fonte de mídia e disparar reprodução imediata
    video.load();

    const triggerPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setAutoplayBlocked(true);
          });
      }
    };

    triggerPlay();
    video.addEventListener('loadeddata', triggerPlay);
    video.addEventListener('canplay', triggerPlay);

    // Tentativa imediata no primeiro toque/interação caso o browser limite
    const handleFirstTouch = () => {
      if (video.paused) {
        triggerPlay();
      }
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true, once: true });
    window.addEventListener('scroll', handleFirstTouch, { passive: true, once: true });

    return () => {
      video.removeEventListener('loadeddata', triggerPlay);
      video.removeEventListener('canplay', triggerPlay);
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
    };
  }, [activeVideoSrc]);

  // OTIMIZAÇÃO CRÍTICA: Pausa o vídeo quando fora da viewport para poupar bateria e dados
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        } else {
          if (!autoplayBlocked) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [autoplayBlocked]);

  // Alternar Play/Pause manualmente pelo usuário
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Alternar Áudio
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative w-full h-[100svh] min-h-[560px] max-h-[1050px] lg:h-screen lg:min-h-screen overflow-hidden flex items-center justify-center bg-[#1A120B]"
    >
      {/* 
        VÍDEO FIXO EM TELA CHEIA
        - Autoplay imediato, sem capas, posters ou placeholders antes do início do vídeo
        - playsInline, muted, loop, preload="auto"
      */}
      <video
        ref={videoRef}
        key={activeVideoSrc}
        src={activeVideoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
      >
        <source src={activeVideoSrc} type="video/mp4" />
        <source src={activeVideoSrc} type="video/webm" />
        <source src={activeVideoSrc} />
      </video>

      {/* 
        OVERLAY SUTIL COM GRADIENTE DISCRETO
        Garante legibilidade cristalina em telas de celular em qualquer luminosidade
      */}
      <div className="absolute inset-0 z-1 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/75 via-transparent to-black/50 pointer-events-none" />

      {/* CONTEÚDO INTEGRADO SOBRE O VÍDEO (No desktop: alinhado à esquerda e posicionado mais abaixo) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-20 pb-16 sm:pt-24 md:pt-32 lg:pt-36 text-center md:text-left flex flex-col items-center md:items-start justify-center">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-center md:items-start">
          {/* Subtítulo superior: SABOR DA ROÇA • TAPIOCA & CAFÉ */}
          <span className="relative block font-sans text-xs sm:text-sm font-normal text-white/85 uppercase tracking-[0.1em] mb-2 sm:mb-3">
            Sabor da Roça &bull; Tapioca &amp; Café
          </span>

          {/* Título Principal (elegante, peso médio, proporção editorial) */}
          <h1 className="relative block font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal sm:font-medium text-white leading-[1.18] sm:leading-[1.12] mb-3 sm:mb-4 drop-shadow-xs">
            Sabor Que Inspira. <br className="hidden sm:inline" />
            Conexão Que Acolhe.
          </h1>

          {/* Parágrafo descritivo */}
          <p className="relative block font-sans text-sm sm:text-base text-white/85 font-normal max-w-md md:max-w-lg leading-relaxed mb-6 sm:mb-8">
            Café especial, tapiocas artesanais e momentos para ficar.
          </p>

          {/* Botão Editorial: VER CARDÁPIO → */}
          <div className="relative flex justify-center md:justify-start w-full mt-2 sm:mt-3">
            <button
              onClick={onExploreMenu}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-[#2C3E35] hover:bg-[#1E2C25] active:scale-[0.98] text-white text-xs sm:text-sm uppercase tracking-[0.08em] font-medium border border-white/25 transition-colors cursor-pointer"
            >
              <span>Ver Cardápio Teste</span>
              <span aria-hidden="true" className="text-sm">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLES DISCRETOS DE VÍDEO NO MOBILE / DESKTOP (Canto Inferior Esquerdo) */}
      <div className="absolute bottom-3.5 sm:bottom-6 left-3.5 sm:left-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayPause}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/45 hover:bg-black/70 active:scale-95 backdrop-blur-md border border-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer"
          aria-label={isPlaying ? 'Pausar vídeo de fundo' : 'Reproduzir vídeo de fundo'}
          title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white/90" />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#E6DED5] fill-current" />
          )}
          <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-medium text-white/90">
            {isPlaying ? 'Pausar' : 'Reproduzir'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/45 hover:bg-black/70 active:scale-95 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer"
          aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
          title={isMuted ? 'Ativar som' : 'Silenciar som'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-white/80" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>
      </div>

      {/* INDICADOR DE SCROLL DISCRETO (Centralizado sem sobreposição) */}
      <div className="hidden sm:block absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <a
          href="#cardapio"
          onClick={(e) => {
            e.preventDefault();
            onExploreMenu?.();
          }}
          className="flex flex-col items-center gap-1 text-white/75 hover:text-white transition-colors duration-200 text-[9px] sm:text-[10px] uppercase tracking-[0.26em] font-medium group"
          aria-label="Rolar para o cardápio"
        >
          <span className="tracking-[0.28em]">SCROLL</span>
          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce group-hover:translate-y-0.5 transition-transform" />
        </a>
      </div>
    </section>
  );
};

