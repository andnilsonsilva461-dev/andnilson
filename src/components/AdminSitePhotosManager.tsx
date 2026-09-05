import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  RotateCcw,
  Pencil,
  X,
  Sparkles,
  Smartphone,
  Monitor,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  SITE_PHOTO_SLOTS,
  SitePhotoSlot,
  DEFAULT_SITE_PHOTOS,
  saveSitePhoto,
  resetSitePhoto,
  resetAllSitePhotos,
  getCachedSitePhotos,
  fetchServerSitePhotos,
} from '../utils/sitePhotosStorage';
import { compressImageFile } from '../utils/imageStorage';

interface AdminSitePhotosManagerProps {
  onReturnToStore: () => void;
}

type CategoryFilter =
  | 'TODAS'
  | 'Identidade Visual'
  | 'Página Inicial'
  | 'O Espaço'
  | 'Localização'
  | 'Feed do Instagram';

const CATEGORIES: CategoryFilter[] = [
  'TODAS',
  'Identidade Visual',
  'Página Inicial',
  'O Espaço',
  'Localização',
  'Feed do Instagram',
];

export const AdminSitePhotosManager: React.FC<AdminSitePhotosManagerProps> = ({
  onReturnToStore,
}) => {
  const [sitePhotos, setSitePhotos] = useState<Record<string, string>>(() => getCachedSitePhotos());
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('TODAS');
  const [editingSlot, setEditingSlot] = useState<SitePhotoSlot | null>(null);

  // Modal editing state
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');
  const [actionErrorMessage, setActionErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync on mount
  useEffect(() => {
    fetchServerSitePhotos().then((photos) => {
      setSitePhotos(photos);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSitePhotos(e.detail);
      }
    };
    window.addEventListener('sabor-site-photos-updated', handleUpdate);
    return () => window.removeEventListener('sabor-site-photos-updated', handleUpdate);
  }, []);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    if (selectedCategory === 'TODAS') return SITE_PHOTO_SLOTS;
    return SITE_PHOTO_SLOTS.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Stats
  const totalSlots = SITE_PHOTO_SLOTS.length;
  const customizedCount = useMemo(() => {
    return SITE_PHOTO_SLOTS.filter((s) => {
      const current = sitePhotos[s.key];
      return current && current !== s.defaultUrl;
    }).length;
  }, [sitePhotos]);

  // Open modal
  const handleOpenEditModal = (slot: SitePhotoSlot) => {
    setEditingSlot(slot);
    const currentImg = sitePhotos[slot.key] || slot.defaultUrl;
    setPreviewImage(currentImg);
    setUrlInput(currentImg.startsWith('data:') ? '' : currentImg);
    setUploadMode('FILE');
    setActionSuccessMessage('');
    setActionErrorMessage('');
  };

  const handleCloseModal = () => {
    setEditingSlot(null);
    setPreviewImage('');
    setUrlInput('');
    setActionSuccessMessage('');
    setActionErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setActionErrorMessage('Selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingFile(true);
    setActionErrorMessage('');

    try {
      // Compress to max 1400px, 85% quality
      const compressedDataUrl = await compressImageFile(file, 1400, 1400, 0.85);
      setPreviewImage(compressedDataUrl);
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // URL input handler
  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setActionErrorMessage('Informe uma URL de imagem válida.');
      return;
    }
    setPreviewImage(urlInput.trim());
    setActionErrorMessage('');
  };

  // Save changes
  const handleSavePhoto = async () => {
    if (!editingSlot) return;
    if (!previewImage.trim()) {
      setActionErrorMessage('Selecione ou informe uma foto válida.');
      return;
    }

    setIsSaving(true);
    setActionErrorMessage('');

    try {
      const result = await saveSitePhoto(editingSlot.key, previewImage);
      if (result.success) {
        setSitePhotos(result.photos);
        setActionSuccessMessage(`Foto de "${editingSlot.label}" atualizada com sucesso!`);
        setTimeout(() => {
          handleCloseModal();
        }, 800);
      } else {
        setActionErrorMessage('Não foi possível salvar no servidor. Tente novamente.');
      }
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage('Erro ao salvar foto.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset single slot
  const handleResetSlot = async (slot: SitePhotoSlot) => {
    const confirmed = window.confirm(
      `Deseja restaurar a foto de "${slot.label}" de volta para o padrão original da roça?`
    );
    if (!confirmed) return;

    const result = await resetSitePhoto(slot.key);
    setSitePhotos(result.photos);
  };

  // Reset all
  const handleResetAll = async () => {
    const confirmed = window.confirm(
      'Atenção: deseja restaurar TODAS as fotos institucionais do site para o padrão original? Fotos de pratos não serão alteradas.'
    );
    if (!confirmed) return;

    const result = await resetAllSitePhotos();
    setSitePhotos(result.photos);
    window.alert('Todas as fotos do site foram restauradas com sucesso!');
  };

  return (
    <div className="space-y-8">
      {/* Banner Superior com Estatísticas & Explicação */}
      <div className="bg-white border border-[#E8E1D7] p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#6B8B70]" />
              <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#6B8B70]">
                PAINEL VISUAL &bull; IDENTIDADE E SEÇÕES DO SITE
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E35]">
              Fotos do Site Sabor da Roça
            </h1>
            <p className="text-xs sm:text-sm text-[#2C3E35]/70 mt-1 max-w-2xl font-light leading-relaxed">
              Substitua qualquer imagem do site (Logo, Abertura, Destaque da Casa, Espaço,
              Localização e Instagram). As alterações são salvas no servidor e sincronizam automaticamente
              em celulares e computadores.
            </p>
          </div>

          {/* Contadores */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-[#F7F4EF] border border-[#E8E1D7] px-4 py-2.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#2C3E35] block">
                {totalSlots}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#2C3E35]/60 font-semibold block mt-0.5">
                Total de Fotos
              </span>
            </div>

            <div className="bg-[#EDF5EE] border border-[#6B8B70]/30 px-4 py-2.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#4B7351] block">
                {customizedCount}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#4B7351] font-semibold block mt-0.5">
                Personalizadas
              </span>
            </div>

            <div className="bg-[#FAF5ED] border border-[#A67C52]/30 px-4 py-2.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#8C6339] block">
                {totalSlots - customizedCount}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#8C6339] font-semibold block mt-0.5">
                Padrão Original
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className="mt-6 pt-4 border-t border-[#E8E1D7] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EAE1] hover:bg-rose-900 hover:text-white text-[#2C3E35] font-semibold uppercase tracking-[0.14em] text-[11px] border border-[#E5DDCF] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Todas as Fotos</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <Monitor className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sincronizado em tempo real no site</span>
          </div>
        </div>
      </div>

      {/* Categorias / Filtro por Seção */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8E1D7]">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-2 text-xs uppercase tracking-[0.12em] font-semibold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                  : 'bg-white text-[#2C3E35]/70 border-[#E8E1D7] hover:border-[#2C3E35]/40 hover:text-[#2C3E35]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grade de Slots de Fotos do Site */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSlots.map((slot) => {
          const currentUrl = sitePhotos[slot.key] || slot.defaultUrl;
          const isCustomized = Boolean(currentUrl && currentUrl !== slot.defaultUrl);

          return (
            <div
              key={slot.key}
              className="bg-white border border-[#E8E1D7] flex flex-col overflow-hidden hover:border-[#6B8B70]/60 transition-all duration-200 shadow-2xs group"
            >
              {/* Thumbnail / Foto Atual */}
              <div className={`relative ${slot.aspect} bg-[#EFE9DF] overflow-hidden flex items-center justify-center border-b border-[#E8E1D7]`}>
                <img
                  src={currentUrl}
                  alt={slot.label}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />

                {/* Badge de Status: Padrão ou Personalizada */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-[#2C3E35]/90 text-white text-[9px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 backdrop-blur-xs">
                    {slot.category}
                  </span>
                  {isCustomized ? (
                    <span className="bg-emerald-700 text-white text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-0.5">
                      Personalizada
                    </span>
                  ) : (
                    <span className="bg-[#2C3E35]/60 text-white text-[9px] uppercase tracking-[0.12em] font-medium px-2 py-0.5">
                      Padrão
                    </span>
                  )}
                </div>
              </div>

              {/* Informações do Slot */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-serif text-lg font-bold text-[#2C3E35] leading-snug mb-1">
                  {slot.label}
                </h3>
                <p className="text-xs text-[#2C3E35]/70 font-light leading-relaxed mb-3 flex-1">
                  {slot.description}
                </p>

                <div className="pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#2C3E35]/50 font-mono truncate max-w-[140px]" title={slot.recommended}>
                    {slot.recommended}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isCustomized && (
                      <button
                        type="button"
                        onClick={() => handleResetSlot(slot)}
                        title="Restaurar foto original da roça"
                        className="p-1.5 text-[#2C3E35]/70 hover:text-rose-700 hover:bg-rose-50 border border-[#E8E1D7] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(slot)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-semibold uppercase tracking-[0.1em] transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Alterar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA ALTERAR A FOTO DO SITE */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full border border-[#E8E1D7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Cabeçalho do Modal */}
            <div className="bg-[#2C3E35] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#85B08C] block">
                  ALTERAR FOTO DO SITE &bull; {editingSlot.category.toUpperCase()}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  {editingSlot.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Preview da Foto */}
              <div>
                <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#2C3E35]/70 block mb-2">
                  Pré-visualização:
                </span>
                <div className={`relative ${editingSlot.aspect} max-h-[260px] bg-[#EFE9DF] border border-[#E8E1D7] overflow-hidden flex items-center justify-center`}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-[#2C3E35]/50">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">Nenhuma foto selecionada</span>
                    </div>
                  )}

                  {isProcessingFile && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                      Processando e otimizando imagem...
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#2C3E35]/60 mt-1.5">
                  Recomendação: {editingSlot.recommended}
                </p>
              </div>

              {/* Alternador de Método: Arquivo ou Link */}
              <div>
                <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#2C3E35]/70 block mb-2">
                  Escolha como enviar a nova foto:
                </span>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMode('FILE')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                      uploadMode === 'FILE'
                        ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                        : 'bg-[#F7F4EF] text-[#2C3E35]/70 border-[#E8E1D7] hover:text-[#2C3E35]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload do Aparelho</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMode('URL')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                      uploadMode === 'URL'
                        ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                        : 'bg-[#F7F4EF] text-[#2C3E35]/70 border-[#E8E1D7] hover:text-[#2C3E35]'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link da Web (URL)</span>
                  </button>
                </div>

                {uploadMode === 'FILE' ? (
                  <div className="border-2 border-dashed border-[#E8E1D7] hover:border-[#6B8B70] p-6 text-center bg-[#FAF7F2] transition-colors">
                    <Upload className="w-8 h-8 text-[#6B8B70] mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-[#2C3E35] mb-1">
                      Toque para escolher uma foto do celular ou arraste do computador
                    </p>
                    <p className="text-[11px] text-[#2C3E35]/60 mb-3">
                      Suporta JPG, PNG, WebP (compactação automática inclusa)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="site-photo-file-input"
                    />
                    <label
                      htmlFor="site-photo-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-semibold uppercase tracking-[0.1em] cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Selecionar Arquivo</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://exemplo.com/sua-imagem.jpg"
                        className="flex-1 px-3 py-2 border border-[#E8E1D7] text-xs text-[#2C3E35] focus:outline-none focus:border-[#6B8B70]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-4 py-2 bg-[#2C3E35] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-[#1E2C25] transition-colors cursor-pointer"
                      >
                        Carregar
                      </button>
                    </div>
                    <p className="text-[11px] text-[#2C3E35]/60">
                      Cole o link direto da imagem na internet para aplicar imediatamente.
                    </p>
                  </div>
                )}
              </div>

              {/* Mensagens de Sucesso ou Erro */}
              {actionSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {actionErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMessage}</span>
                </div>
              )}
            </div>

            {/* Rodapé do Modal com Botões de Ação */}
            <div className="bg-[#F7F4EF] px-6 py-4 border-t border-[#E8E1D7] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2C3E35]/70 hover:text-[#2C3E35] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isSaving || isProcessingFile || !previewImage}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3E35] hover:bg-[#1E2C25] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <span>Salvando no Servidor...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Foto no Site</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
