import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Film,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Monitor,
  Globe2,
  Trash2,
  RefreshCw,
  X,
  FileVideo,
  Eye,
  Send,
} from 'lucide-react';
import {
  getActiveHeroVideo,
  uploadHeroVideoFile,
  saveHeroVideoUrl,
  resetHeroVideo,
  HeroVideoConfig,
  VideoUploadProgress,
  DEFAULT_HERO_VIDEO_URL,
} from '../utils/heroVideoStorage';

interface AdminHeroVideoManagerProps {
  currentVideoSrc?: string;
  onUpdateHeroVideo?: (newVideoSrc: string) => void;
  onReturnToStore: () => void;
}

export const AdminHeroVideoManager: React.FC<AdminHeroVideoManagerProps> = ({
  currentVideoSrc,
  onUpdateHeroVideo,
  onReturnToStore,
}) => {
  // Current active video configuration
  const [videoConfig, setVideoConfig] = useState<HeroVideoConfig>({
    src: currentVideoSrc || DEFAULT_HERO_VIDEO_URL,
    publicUrl: currentVideoSrc || DEFAULT_HERO_VIDEO_URL,
    type: 'default',
    label: 'Vídeo da Hero',
  });

  // Selected file for preview before sending
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);

  // Upload progress & statuses
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress>({
    phase: 'idle',
    percent: 0,
    loadedBytes: 0,
    totalBytes: 0,
    message: '',
  });

  const [urlInput, setUrlInput] = useState('');
  const [isUrlSubmitting, setIsUrlSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [successNotification, setSuccessNotification] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Device Preview Mode: 'mobile' (9:16 smartphone) or 'desktop' (16:9 PC monitor)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Player controls
  const [isPlayingActive, setIsPlayingActive] = useState(true);
  const [isMutedActive, setIsMutedActive] = useState(true);
  const [isPlayingSelected, setIsPlayingSelected] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const selectedVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current saved configuration on mount
  useEffect(() => {
    getActiveHeroVideo().then((config) => {
      setVideoConfig(config);
      if (config.type === 'url') {
        setUrlInput(config.src);
      }
    });
  }, []);

  // Cleanup object URL when unmounting or changing selected file
  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  // Handle file selection (validates format and up to 100MB limit)
  const handleSelectFile = (file: File) => {
    setErrorMessage('');
    setSuccessNotification('');

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isVideo) {
      setErrorMessage('Formato inválido. Por favor, selecione um arquivo de vídeo MP4 (.mp4).');
      return;
    }

    const MAX_LIMIT = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_LIMIT) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`O arquivo selecionado possui ${sizeMb} MB e excede o limite de 100 MB.`);
      return;
    }

    // Revoke previous preview URL if any
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFilePreviewUrl(previewUrl);
    setUploadProgress({
      phase: 'idle',
      percent: 0,
      loadedBytes: 0,
      totalBytes: file.size,
      message: '',
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSelectFile(file);
    }
  };

  const handleCancelSelected = () => {
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
    setUploadProgress({
      phase: 'idle',
      percent: 0,
      loadedBytes: 0,
      totalBytes: 0,
      message: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform upload with progress tracking: Enviando... -> Processando... -> Vídeo salvo com sucesso
  const handleUploadSelectedVideo = async () => {
    if (!selectedFile) return;

    setErrorMessage('');
    setSuccessNotification('');

    try {
      const config = await uploadHeroVideoFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setVideoConfig(config);
      onUpdateHeroVideo?.(config.src);
      setSuccessNotification('Vídeo salvo com sucesso! O novo vídeo já está ativo na Hero.');

      // Clear draft selection after success
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
      setSelectedFile(null);
      setSelectedFilePreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => setSuccessNotification(''), 8000);
    } catch (err: any) {
      console.error('Erro no upload do vídeo:', err);
      setErrorMessage(err.message || 'Falha ao salvar vídeo no servidor. Tente novamente.');
    }
  };

  // Save external public URL
  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setErrorMessage('Por favor, informe a URL pública do vídeo.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      setErrorMessage('A URL deve iniciar com https://, http:// ou /videos/...');
      return;
    }

    setIsUrlSubmitting(true);
    setErrorMessage('');
    setSuccessNotification('');

    try {
      const config = await saveHeroVideoUrl(cleanUrl);
      setVideoConfig(config);
      onUpdateHeroVideo?.(config.src);
      setSuccessNotification('Link de vídeo salvo com sucesso! A Hero foi atualizada.');
      setTimeout(() => setSuccessNotification(''), 8000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Erro ao salvar URL do vídeo no servidor.');
    } finally {
      setIsUrlSubmitting(false);
    }
  };

  // Remove current video (restore official default)
  const handleResetCurrentVideo = async () => {
    const confirmRemove = window.confirm(
      'Deseja remover o vídeo atual e restaurar o vídeo padrão oficial do Sabor da Roça?'
    );
    if (!confirmRemove) return;

    setIsResetting(true);
    setErrorMessage('');
    setSuccessNotification('');

    try {
      const config = await resetHeroVideo();
      setVideoConfig(config);
      onUpdateHeroVideo?.(config.src);
      setSuccessNotification('Vídeo atual removido. O vídeo padrão oficial foi restaurado com sucesso.');
      setTimeout(() => setSuccessNotification(''), 8000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Erro ao restaurar vídeo padrão.');
    } finally {
      setIsResetting(false);
    }
  };

  const isUploading = uploadProgress.phase === 'uploading' || uploadProgress.phase === 'processing';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E1D7] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#6B8B70]">
                PAINEL DE CONTROLE
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] bg-[#2C3E35] text-white px-2.5 py-0.5 border border-[#2C3E35]">
                <Globe2 className="w-3 h-3 text-[#D9B58B]" />
                Vídeo da Hero
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E35]">
              Vídeo da Hero
            </h1>
            <p className="text-xs sm:text-sm text-[#2C3E35]/75 mt-1.5 max-w-3xl font-light leading-relaxed">
              Gerencie o vídeo principal de abertura do cardápio. Você pode selecionar um arquivo MP4 (até 100 MB),
              visualizar a prévia antes de enviar, substituir o vídeo ativo ou restaurar o vídeo original.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onReturnToStore}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-colors shadow-xs"
            >
              <span>Ver no Site ao Vivo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {successNotification && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between gap-3 rounded-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span className="font-semibold">{successNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotification('')}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Notificação de Erro */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-medium flex items-center justify-between gap-3 rounded-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-700 hover:text-rose-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grid Principal: Player Atual à Esquerda e Ações à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Player do Vídeo Ativo no Site (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E8E1D7] p-4 shadow-xs">
            {/* Header da Simulação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E8E1D7] gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#6B8B70]" />
                <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#2C3E35]">
                  Vídeo Atual no Site
                </span>
              </div>

              {/* Seletor Mobile / Desktop */}
              <div className="flex items-center bg-[#F7F4EF] p-0.5 border border-[#E8E1D7] rounded-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-[#2C3E35] text-white shadow-xs'
                      : 'text-[#2C3E35]/70 hover:text-[#2C3E35]'
                  }`}
                  title="Simular visualização no smartphone (celular)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-[#2C3E35] text-white shadow-xs'
                      : 'text-[#2C3E35]/70 hover:text-[#2C3E35]'
                  }`}
                  title="Simular visualização em computador (PC)"
                >
                  <Monitor className="w-3 h-3" />
                  <span>PC</span>
                </button>
              </div>
            </div>

            {/* Container do Player */}
            <div className="bg-[#1F1914] p-3 border border-[#E8E1D7] flex items-center justify-center min-h-[380px]">
              <div
                className={`relative overflow-hidden bg-black transition-all duration-300 shadow-xl border border-white/10 ${
                  previewMode === 'mobile'
                    ? 'w-[230px] aspect-9/16 rounded-2xl ring-4 ring-[#2C3E35]'
                    : 'w-full aspect-16/9 rounded-sm ring-2 ring-[#2C3E35]'
                }`}
              >
                {previewMode === 'mobile' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-16 h-3 bg-black/80 rounded-full border border-white/10" />
                )}

                <video
                  ref={activeVideoRef}
                  key={`${videoConfig.src}-${previewMode}`}
                  src={videoConfig.src}
                  autoPlay
                  loop
                  muted={isMutedActive}
                  playsInline
                  className="w-full h-full object-cover object-center"
                />

                {/* Badge Ativo */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] font-bold border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{previewMode === 'mobile' ? 'Mobile (9:16)' : 'Desktop (16:9)'}</span>
                </div>

                {/* Controles de Reprodução */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const v = activeVideoRef.current;
                      if (!v) return;
                      if (v.paused) {
                        v.play().then(() => setIsPlayingActive(true)).catch(() => {});
                      } else {
                        v.pause();
                        setIsPlayingActive(false);
                      }
                    }}
                    aria-label={isPlayingActive ? 'Pausar' : 'Reproduzir'}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors border border-white/20"
                  >
                    {isPlayingActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const v = activeVideoRef.current;
                      if (!v) return;
                      v.muted = !v.muted;
                      setIsMutedActive(v.muted);
                    }}
                    aria-label={isMutedActive ? 'Ativar som' : 'Silenciar'}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors border border-white/20"
                  >
                    {isMutedActive ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Metadados do Vídeo Atual */}
            <div className="mt-3 pt-3 border-t border-[#E8E1D7] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#2C3E35]/80">
                <span className="text-[11px] font-semibold text-[#2C3E35]/60">Vídeo Ativo:</span>
                <span className="font-mono text-[11px] font-semibold text-[#2C3E35] truncate max-w-[220px]" title={videoConfig.label}>
                  {videoConfig.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#2C3E35]/80">
                <span className="text-[11px] font-semibold text-[#2C3E35]/60">Origem:</span>
                <span className="text-[11px] font-semibold text-[#2C3E35]">
                  {videoConfig.type === 'file' && 'Arquivo MP4 no Storage'}
                  {videoConfig.type === 'url' && 'Link Externo (URL)'}
                  {videoConfig.type === 'default' && 'Vídeo Padrão Oficial'}
                </span>
              </div>

              {videoConfig.publicUrl && (
                <div className="flex flex-col gap-1 pt-1 border-t border-[#E8E1D7]/60">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#2C3E35]/60">
                    URL Pública Salva:
                  </span>
                  <a
                    href={videoConfig.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-[#6B8B70] hover:underline truncate bg-[#F7F4EF] p-1.5 border border-[#E8E1D7] flex items-center justify-between"
                  >
                    <span className="truncate">{videoConfig.publicUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-[#2C3E35]/50" />
                  </a>
                </div>
              )}

              {/* Botões de Ação do Vídeo Atual */}
              <div className="pt-3 border-t border-[#E8E1D7] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F7F4EF] hover:bg-[#EFE8DE] text-[#2C3E35] border border-[#D9D0C3] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#6B8B70]" />
                  <span>Substituir Vídeo</span>
                </button>

                {videoConfig.type !== 'default' && (
                  <button
                    type="button"
                    onClick={handleResetCurrentVideo}
                    disabled={isResetting}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    title="Remover vídeo atual e voltar ao padrão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Seção de Upload / Seleção de Arquivo e Prévia (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PAINEL PRINCIPAL: Upload de Arquivo MP4 */}
          <div className="bg-white border border-[#E8E1D7] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#2C3E35]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B8B70]">
                  UPLOAD DE VÍDEO MP4
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#2C3E35]/60 bg-[#F7F4EF] px-2 py-0.5 border border-[#E8E1D7]">
                Limite: 100 MB
              </span>
            </div>

            <h2 className="font-serif text-xl font-bold text-[#2C3E35]">
              Enviar Novo Vídeo para a Hero
            </h2>
            <p className="text-xs text-[#2C3E35]/70 mt-1 mb-4 leading-relaxed">
              Aceita arquivos no formato MP4 (com codec H.264 recomendado). O arquivo é enviado diretamente ao
              armazenamento persistente do projeto e tem sua URL pública salva para exibição tanto no celular quanto no PC.
            </p>

            {/* Input oculto de arquivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
              onChange={handleFileInputChange}
              disabled={isUploading}
              className="hidden"
            />

            {/* Caso NÃO tenha arquivo selecionado: Dropzone de Seleção */}
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-[#6B8B70] bg-[#6B8B70]/10'
                    : 'border-[#D9D0C3] hover:border-[#6B8B70] bg-[#F7F4EF]/60'
                } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-[#EFE9DF] rounded-full flex items-center justify-center text-[#2C3E35]">
                  <Upload className="w-6 h-6 text-[#6B8B70]" />
                </div>
                <p className="text-sm font-bold text-[#2C3E35]">
                  Clique para selecionar o vídeo MP4 ou arraste aqui
                </p>
                <p className="text-xs text-[#2C3E35]/60 mt-1">
                  Suporta arquivos de até 100 MB (resolução recomendada: 1080x1920 vertical)
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-[#2C3E35] text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors"
                >
                  Selecionar Arquivo
                </button>
              </div>
            ) : (
              /* Caso TENHA arquivo selecionado: Visualizar Vídeo Selecionado & Enviar */
              <div className="border border-[#6B8B70] bg-[#F7F4EF]/40 p-4 sm:p-5 rounded-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D7]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#6B8B70]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2C3E35]">
                      Visualizar Vídeo Selecionado (Prévia)
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleCancelSelected}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>

                {/* Player de Prévia do Arquivo Selecionado */}
                {selectedFilePreviewUrl && (
                  <div className="bg-black rounded-xs overflow-hidden max-h-[300px] flex items-center justify-center relative">
                    <video
                      ref={selectedVideoRef}
                      src={selectedFilePreviewUrl}
                      controls
                      playsInline
                      className="max-h-[300px] w-auto mx-auto object-contain"
                    />
                  </div>
                )}

                {/* Metadados do Arquivo Selecionado */}
                <div className="bg-white p-3 border border-[#E8E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileVideo className="w-5 h-5 text-[#6B8B70] shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-[#2C3E35] truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#2C3E35]/60">
                        Tamanho: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Formato: {selectedFile.type || 'video/mp4'}
                      </p>
                    </div>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#6B8B70] hover:underline shrink-0"
                    >
                      Trocar Arquivo
                    </button>
                  )}
                </div>

                {/* Indicador de Progresso em Tempo Real */}
                {isUploading && (
                  <div className="bg-white p-4 border border-[#6B8B70] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2C3E35]">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#6B8B70] border-t-transparent rounded-full animate-spin" />
                        <span>{uploadProgress.message || 'Enviando...'}</span>
                      </span>
                      <span>{uploadProgress.percent}%</span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-[#E8E1D7] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6B8B70] h-full transition-all duration-200"
                        style={{ width: `${uploadProgress.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#2C3E35]/60">
                      <span>
                        Transmitido: {(uploadProgress.loadedBytes / (1024 * 1024)).toFixed(1)} MB de{' '}
                        {(uploadProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span>
                        {uploadProgress.phase === 'processing'
                          ? 'Processando no servidor...'
                          : 'Enviando arquivo...'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botões de Ação para o Arquivo Selecionado */}
                {!isUploading && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleUploadSelectedVideo}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#D9B58B]" />
                      <span>Enviar e Publicar Vídeo na Hero</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelSelected}
                      className="px-4 py-3 bg-white hover:bg-[#F7F4EF] text-[#2C3E35] border border-[#E8E1D7] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAINEL SECUNDÁRIO: Salvar Link Direto (URL Pública / CDN) */}
          <div className="bg-white border border-[#E8E1D7] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#2C3E35]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B8B70]">
                  URL PÚBLICA / NUVEM (OPCIONAL)
                </span>
              </div>
              {videoConfig.type === 'url' && (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] font-bold bg-[#6B8B70] text-white px-2 py-0.5 rounded-xs">
                  <Check className="w-3 h-3" />
                  Ativo no Site
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg font-bold text-[#2C3E35]">
              Inserir Link Direto de Vídeo
            </h3>
            <p className="text-xs text-[#2C3E35]/70 mt-1 mb-3 leading-relaxed">
              Caso seu vídeo esteja hospedado em um provedor de nuvem ou CDN (como Cloudinary, Supabase, AWS S3 ou
              Vercel Blob), cole a URL pública direta do arquivo MP4 abaixo.
            </p>

            <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://meusite.com/videos/meu-video.mp4"
                  disabled={isUrlSubmitting || isUploading}
                  className="w-full px-3 py-2.5 bg-[#F7F4EF] border border-[#E8E1D7] text-xs font-mono text-[#2C3E35] focus:outline-none focus:border-[#6B8B70] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isUrlSubmitting || isUploading || !urlInput.trim()}
                className="px-5 py-2.5 bg-[#2C3E35] hover:bg-[#1E2C25] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors shrink-0 cursor-pointer"
              >
                {isUrlSubmitting ? 'Salvando...' : 'Salvar URL'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
