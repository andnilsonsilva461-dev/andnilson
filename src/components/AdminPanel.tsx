import React, { useState, useMemo, useRef } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Check,
  Trash2,
  Image as ImageIcon,
  Search,
  Key,
  Download,
  UploadCloud,
  X,
  Sparkles,
  UtensilsCrossed,
  RefreshCw,
  LogOut,
  Video,
  Pencil,
  RotateCcw,
  Smartphone,
  Monitor,
  Flame,
} from 'lucide-react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import {
  verifyAdminCode,
  getAdminCode,
  updateAdminCode,
  saveCustomImage,
  removeCustomImage,
  clearAllCustomImages,
  compressImageFile,
  getCustomImages,
  DEFAULT_ADMIN_CODE,
} from '../utils/imageStorage';
import {
  saveProductCustomization,
  resetProductCustomization,
  resetAllProductCustomizations,
  getCachedMenuCustomizations,
} from '../utils/menuCustomizationStorage';
import { AdminHeroVideoManager } from './AdminHeroVideoManager';
import { AdminSitePhotosManager } from './AdminSitePhotosManager';
import { AdminMostOrderedManager } from './AdminMostOrderedManager';
import { useMostOrdered } from '../hooks/useMostOrdered';

interface AdminPanelProps {
  menuItems: MenuItem[];
  onUpdateItemImage: (itemId: string, newImageUrl: string) => void;
  onRemoveItemImage: (itemId: string) => void;
  onUpdateProduct?: (itemId: string, updates: { name?: string; image?: string; imageUrl?: string }) => void;
  onResetProduct?: (itemId: string) => void;
  onReturnToStore: () => void;
  currentHeroVideo?: string;
  onUpdateHeroVideo?: (newVideoSrc: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  menuItems,
  onUpdateItemImage,
  onRemoveItemImage,
  onUpdateProduct,
  onResetProduct,
  onReturnToStore,
  currentHeroVideo,
  onUpdateHeroVideo,
}) => {
  // Navigation Tabs: 'MENU_IMAGES', 'MOST_ORDERED', 'SITE_PHOTOS' or 'HERO_VIDEO'
  const [activeTab, setActiveTab] = useState<
    'MENU_IMAGES' | 'MOST_ORDERED' | 'SITE_PHOTOS' | 'HERO_VIDEO'
  >('MENU_IMAGES');

  const mostOrderedIds = useMostOrdered();

  // Session-based authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sabor_da_roca_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [inputCode, setInputCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [authError, setAuthError] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WITH_IMAGE' | 'NO_IMAGE'>('ALL');

  // Active editing dish modal (Photo & Name)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Password / Code change modal
  const [isChangingCode, setIsChangingCode] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeChangeStatus, setCodeChangeStatus] = useState<string>('');

  // Backup modal
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [backupNotice, setBackupNotice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCode(inputCode)) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem('sabor_da_roca_admin_auth', 'true');
      } catch (err) {
        console.error(err);
      }
    } else {
      setAuthError('Código de acesso incorreto. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setInputCode('');
    try {
      sessionStorage.removeItem('sabor_da_roca_admin_auth');
    } catch (err) {
      console.error(err);
    }
  };

  // Map original items to detect custom names and photos
  const originalMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    MENU_ITEMS.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // Dish stats
  const totalDishes = menuItems.length;
  const withImageCount = menuItems.filter(
    (m) => (m.imageUrl && m.imageUrl.trim() !== '') || (m.image && m.image.trim() !== '')
  ).length;
  const noImageCount = totalDishes - withImageCount;
  const customizedNamesCount = useMemo(() => {
    return menuItems.filter((m) => {
      const orig = originalMap.get(m.id);
      return orig && orig.name !== m.name;
    }).length;
  }, [menuItems, originalMap]);

  // Categories list for filtering
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ['TODOS', ...cats];
  }, [menuItems]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'TODOS' || item.category === selectedCategory;

      const hasImg = Boolean(
        (item.imageUrl && item.imageUrl.trim() !== '') ||
        (item.image && item.image.trim() !== '')
      );
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'WITH_IMAGE' && hasImg) ||
        (statusFilter === 'NO_IMAGE' && !hasImg);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [menuItems, searchQuery, selectedCategory, statusFilter]);

  // Open Edit Dialog for item (Photo & Name)
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNameInput(item.name || '');
    const currentImg = item.imageUrl || item.image || '';
    setPreviewImage(currentImg);
    setUrlInput(currentImg.startsWith('http') ? currentImg : '');
    setUploadMode(currentImg.startsWith('http') ? 'URL' : 'FILE');
    setActionSuccessMessage('');
  };

  // Handle local image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsProcessingFile(true);
      const compressedDataUrl = await compressImageFile(file, 1000, 1000, 0.82);
      setPreviewImage(compressedDataUrl);
      setIsProcessingFile(false);
    } catch (err) {
      console.error(err);
      setIsProcessingFile(false);
      alert('Não foi possível processar esta imagem. Tente outra foto.');
    }
  };

  // Save new name & photo for editingItem (syncs to server and all devices)
  const handleSaveProduct = async () => {
    if (!editingItem) return;

    const cleanName = nameInput.trim();
    if (!cleanName) {
      alert('Por favor, digite um nome válido para o produto.');
      return;
    }

    const finalImage = uploadMode === 'URL' ? urlInput.trim() : previewImage;

    try {
      setIsSaving(true);
      await saveProductCustomization(editingItem.id, {
        name: cleanName,
        image: finalImage,
        imageUrl: finalImage,
      });

      if (onUpdateProduct) {
        onUpdateProduct(editingItem.id, { name: cleanName, image: finalImage, imageUrl: finalImage });
      } else {
        onUpdateItemImage(editingItem.id, finalImage);
      }

      setActionSuccessMessage('Produto (Nome e Foto) salvo com sucesso! Sincronizado no celular e PC.');

      setTimeout(() => {
        setIsSaving(false);
        setEditingItem(null);
        setActionSuccessMessage('');
      }, 1100);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };

  // Reset item customizations (restores original name and original image)
  const handleResetSingleItem = async (item: MenuItem) => {
    const orig = originalMap.get(item.id);
    const origName = orig ? orig.name : item.name;
    if (window.confirm(`Deseja restaurar o nome ("${origName}") e foto originais deste prato?`)) {
      try {
        await resetProductCustomization(item.id);
        if (onResetProduct) {
          onResetProduct(item.id);
        } else {
          onRemoveItemImage(item.id);
        }
        if (editingItem?.id === item.id) {
          setNameInput(orig?.name || '');
          const origImg = orig?.imageUrl || orig?.image || '';
          setPreviewImage(origImg);
          setUrlInput(origImg.startsWith('http') ? origImg : '');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Remove image only
  const handleRemoveImage = (item: MenuItem) => {
    if (window.confirm(`Deseja remover a foto de "${item.name}"?`)) {
      removeCustomImage(item.id);
      onRemoveItemImage(item.id);
      if (editingItem?.id === item.id) {
        setPreviewImage('');
        setUrlInput('');
      }
    }
  };

  // Update Admin Code
  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput || newCodeInput.trim().length < 4) {
      setCodeChangeStatus('O novo código deve ter pelo menos 4 caracteres.');
      return;
    }

    const ok = updateAdminCode(newCodeInput);
    if (ok) {
      setCodeChangeStatus('Código de acesso atualizado com sucesso!');
      setTimeout(() => {
        setIsChangingCode(false);
        setNewCodeInput('');
        setCodeChangeStatus('');
      }, 1500);
    } else {
      setCodeChangeStatus('Erro ao salvar novo código.');
    }
  };

  // Export custom images and names backup
  const handleExportBackup = () => {
    const customizations = getCachedMenuCustomizations();
    const images = getCustomImages();
    const payload = {
      version: 2,
      exportDate: new Date().toISOString(),
      customizations,
      images,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sabor-da-roca-cardapio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Backup (Fotos e Nomes) exportado com sucesso!');
  };

  // Import custom images and names backup
  const handleImportBackup = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Formato inválido');
      }

      if (parsed.customizations && typeof parsed.customizations === 'object') {
        for (const [id, cust] of Object.entries(parsed.customizations)) {
          const c = cust as { name?: string; image?: string };
          await saveProductCustomization(id, { name: c.name, image: c.image });
          if (onUpdateProduct) {
            onUpdateProduct(id, { name: c.name, image: c.image });
          } else if (c.image) {
            onUpdateItemImage(id, c.image);
          }
        }
      } else {
        // Fallback for legacy format: key -> imgUrl
        for (const [id, imgUrl] of Object.entries(parsed)) {
          if (typeof imgUrl === 'string') {
            await saveProductCustomization(id, { image: imgUrl });
            onUpdateItemImage(id, imgUrl);
          }
        }
      }

      setBackupNotice('Dados restaurados com sucesso!');
      setTimeout(() => {
        setIsBackupModalOpen(false);
        setImportJsonText('');
        setBackupNotice('');
      }, 1500);
    } catch {
      setBackupNotice('Erro: Cole um arquivo JSON de backup válido.');
    }
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION SCREEN (LOGIN GATEWAY)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#1A241F] text-[#F7F4EF] flex flex-col justify-between px-4 py-8 sm:py-12 selection:bg-[#6B8B70] selection:text-white">
        {/* Top bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between">
          <button
            onClick={onReturnToStore}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#F7F4EF]/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Cardápio</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-[#24332B] border border-[#374C40] p-6 sm:p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#1A241F] border border-[#6B8B70]/40 rounded-full mx-auto flex items-center justify-center mb-4 text-[#6B8B70]">
                <Lock className="w-6 h-6" />
              </div>
              <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#6B8B70] font-bold block mb-1">
                ACESSO RESTRITO &bull; LOJISTA
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Painel do Cardápio
              </h1>
              <p className="font-sans text-xs text-[#F7F4EF]/70 mt-2 font-light leading-relaxed">
                Digite o código de acesso para gerenciar e alterar as fotos dos pratos da Sabor da Roça.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#F7F4EF]/80 mb-2">
                  Código de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Digite o código..."
                    autoFocus
                    className="w-full bg-[#1A241F] border border-[#374C40] focus:border-[#6B8B70] text-white px-4 py-3 text-sm tracking-widest font-mono rounded-none outline-none transition-colors pr-10 placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 font-sans mt-2">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#6B8B70] hover:bg-[#58735C] active:scale-[0.99] text-white font-sans text-xs uppercase tracking-[0.22em] font-bold transition-all shadow-md mt-4"
              >
                Entrar no Painel
              </button>
            </form>

            {/* Dica do código inicial */}
            <div className="mt-8 pt-6 border-t border-[#374C40]/60 text-center">
              <p className="text-[11px] font-sans text-[#F7F4EF]/50">
                Código padrão da casa:{' '}
                <span className="font-mono font-semibold text-[#6B8B70] bg-[#1A241F] px-2 py-0.5 border border-[#374C40]">
                  {DEFAULT_ADMIN_CODE}
                </span>
              </p>
              <p className="text-[10px] text-[#F7F4EF]/40 mt-1">
                (Você poderá alterar este código a qualquer momento dentro do painel)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#F7F4EF]/40 font-sans">
          Sabor da Roça &bull; Gestão de Cardápio
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#F7F4EF] text-[#2C3E35] flex flex-col font-sans selection:bg-[#6B8B70] selection:text-white">
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 bg-[#1A241F] text-[#F7F4EF] border-b border-[#2C3E35] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#6B8B70] flex items-center justify-center text-white font-serif font-bold text-base">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg text-white tracking-wide">
                  SABOR DA ROÇA
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.2em] font-semibold bg-[#6B8B70]/30 text-[#85B08C] border border-[#6B8B70]/50 px-2 py-0.5">
                  PAINEL ADMINISTRATIVO
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C3E35] hover:bg-[#3D5549] text-[#F7F4EF] text-xs font-semibold uppercase tracking-[0.16em] transition-colors border border-white/10"
              title="Voltar ao site público"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Cardápio ao Vivo</span>
              <span className="sm:hidden">Loja</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/60 text-rose-200 text-xs font-semibold uppercase tracking-[0.16em] transition-colors border border-rose-800/40"
              title="Sair da área administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Abas de Navegação Principal do Painel */}
      <div className="bg-[#24332B] border-b border-[#2C3E35] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('MENU_IMAGES')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all border-b-2 ${
              activeTab === 'MENU_IMAGES'
                ? 'border-[#6B8B70] text-white bg-white/5'
                : 'border-transparent text-[#F7F4EF]/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-[#85B08C]" />
            <span>Produtos (Foto e Nome)</span>
            <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-xs font-mono">
              {totalDishes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MOST_ORDERED')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all border-b-2 ${
              activeTab === 'MOST_ORDERED'
                ? 'border-[#E06D53] text-white bg-white/5'
                : 'border-transparent text-[#F7F4EF]/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-[#E06D53]" />
            <span>Mais Pedidos</span>
            <span className="ml-1 text-[10px] bg-[#E06D53]/20 text-[#FFA08C] px-1.5 py-0.5 rounded-xs font-bold">
              {mostOrderedIds.length} ITENS
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SITE_PHOTOS')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all border-b-2 ${
              activeTab === 'SITE_PHOTOS'
                ? 'border-[#85B08C] text-white bg-white/5'
                : 'border-transparent text-[#F7F4EF]/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#85B08C]" />
            <span>Fotos do Site</span>
            <span className="ml-1 text-[10px] bg-[#6B8B70]/30 text-[#A8D5AF] px-1.5 py-0.5 rounded-xs font-bold">
              14 FOTOS
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HERO_VIDEO')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all border-b-2 ${
              activeTab === 'HERO_VIDEO'
                ? 'border-[#D9B58B] text-white bg-white/5'
                : 'border-transparent text-[#F7F4EF]/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-4 h-4 text-[#D9B58B]" />
            <span>Vídeo da Hero (Abertura)</span>
            <span className="ml-1 text-[10px] bg-[#D9B58B]/20 text-[#D9B58B] px-1.5 py-0.5 rounded-xs font-bold">
              ESCOLHER
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {activeTab === 'HERO_VIDEO' ? (
          <AdminHeroVideoManager
            currentVideoSrc={currentHeroVideo}
            onUpdateHeroVideo={onUpdateHeroVideo}
            onReturnToStore={onReturnToStore}
          />
        ) : activeTab === 'SITE_PHOTOS' ? (
          <AdminSitePhotosManager onReturnToStore={onReturnToStore} />
        ) : activeTab === 'MOST_ORDERED' ? (
          <AdminMostOrderedManager
            menuItems={menuItems}
            onReturnToStore={onReturnToStore}
          />
        ) : (
          <>
            {/* Banner de Estatísticas e Ações Globais */}
            <div className="bg-white border border-[#E8E1D7] p-6 mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#6B8B70] block mb-1">
                GERENCIADOR DE PRODUTOS &bull; FOTOS E NOMES
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E35]">
                Fotos e Nomes dos Pratos
              </h1>
              <p className="text-xs sm:text-sm text-[#2C3E35]/70 mt-1 max-w-2xl font-light leading-relaxed">
                Adicione ou altere fotos e nomes de qualquer prato. As alterações ficam salvas no servidor e aparecem
                imediatamente tanto no celular quanto no computador dos clientes.
              </p>
            </div>

            {/* Contadores */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-[#F7F4EF] border border-[#E8E1D7] px-3.5 py-2.5 text-center min-w-[85px]">
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#2C3E35] block">
                  {totalDishes}
                </span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#2C3E35]/60 font-semibold block mt-0.5">
                  Total
                </span>
              </div>

              <div className="bg-[#EDF5EE] border border-[#6B8B70]/30 px-3.5 py-2.5 text-center min-w-[85px]">
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#4B7351] block">
                  {withImageCount}
                </span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#4B7351] font-semibold block mt-0.5">
                  Com Foto
                </span>
              </div>

              <div className="bg-[#FAF5ED] border border-[#A67C52]/30 px-3.5 py-2.5 text-center min-w-[85px]">
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#8C6339] block">
                  {customizedNamesCount}
                </span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#8C6339] font-semibold block mt-0.5">
                  Nomes Editados
                </span>
              </div>

              <div className="bg-[#FFF8F0] border border-[#D9B58B]/40 px-3.5 py-2.5 text-center min-w-[85px]">
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#9C6D38] block">
                  {noImageCount}
                </span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#9C6D38] font-semibold block mt-0.5">
                  Sem Foto
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ações Administrativas */}
          <div className="mt-6 pt-4 border-t border-[#E8E1D7] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsChangingCode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EAE1] hover:bg-[#2C3E35] hover:text-white text-[#2C3E35] font-semibold uppercase tracking-[0.14em] text-[11px] border border-[#E5DDCF] transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Alterar Código de Acesso</span>
              </button>

              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EAE1] hover:bg-[#2C3E35] hover:text-white text-[#2C3E35] font-semibold uppercase tracking-[0.14em] text-[11px] border border-[#E5DDCF] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup / Restaurar</span>
              </button>
            </div>

            <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              Sincronização instantânea no celular e no computador
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white border border-[#E8E1D7] p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Busca por texto */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C3E35]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prato por nome..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7F4EF] border border-[#E8E1D7] text-xs text-[#2C3E35] focus:outline-none focus:border-[#6B8B70] transition-colors placeholder:text-[#2C3E35]/40"
            />
          </div>

          {/* Filtro por Categoria */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por Categoria"
              className="bg-[#F7F4EF] border border-[#E8E1D7] text-xs font-semibold text-[#2C3E35] px-3 py-2 uppercase tracking-[0.1em] focus:outline-none focus:border-[#6B8B70]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filtro por Status da Foto */}
            <div className="flex items-center border border-[#E8E1D7] bg-[#F7F4EF] p-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-[#2C3E35] text-white'
                    : 'text-[#2C3E35]/70 hover:text-[#2C3E35]'
                }`}
              >
                Todos ({totalDishes})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('WITH_IMAGE')}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors ${
                  statusFilter === 'WITH_IMAGE'
                    ? 'bg-[#2C3E35] text-white'
                    : 'text-[#2C3E35]/70 hover:text-[#2C3E35]'
                }`}
              >
                Com Foto ({withImageCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NO_IMAGE')}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors ${
                  statusFilter === 'NO_IMAGE'
                    ? 'bg-[#2C3E35] text-white'
                    : 'text-[#2C3E35]/70 hover:text-[#2C3E35]'
                }`}
              >
                Sem Foto ({noImageCount})
              </button>
            </div>
          </div>
        </div>

        {/* Lista / Grid de Pratos com Ações de Foto */}
        {filteredDishes.length === 0 ? (
          <div className="bg-white border border-[#E8E1D7] p-12 text-center">
            <UtensilsCrossed className="w-8 h-8 text-[#6B8B70] mx-auto mb-3" />
            <p className="font-serif text-lg font-bold text-[#2C3E35]">Nenhum prato encontrado</p>
            <p className="text-xs text-[#2C3E35]/60 mt-1">
              Tente mudar os termos da busca ou selecionar outra categoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((item) => {
              const displaySrc = item.imageUrl || item.image;
              const hasImage = Boolean(displaySrc && displaySrc.trim() !== '');

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8E1D7] hover:border-[#6B8B70]/60 transition-all flex flex-col overflow-hidden shadow-2xs group"
                >
                  {/* Visual da Imagem / Thumbnail */}
                  <div className="relative aspect-4/3 bg-[#EFE9DF] overflow-hidden flex items-center justify-center border-b border-[#E8E1D7]">
                    {hasImage ? (
                      <img
                        src={displaySrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <UtensilsCrossed className="w-8 h-8 text-[#6B8B70]/60 mx-auto mb-1" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6B8B70] block">
                          Sem Foto Cadastrada
                        </span>
                      </div>
                    )}

                    {/* Badge de Status */}
                    <div className="absolute top-2 left-2">
                      {hasImage ? (
                        <span className="bg-[#2C3E35] text-white text-[9px] uppercase tracking-[0.16em] font-bold px-2 py-0.5">
                          Foto Ativa
                        </span>
                      ) : (
                        <span className="bg-[#D9B58B] text-[#2C3E35] text-[9px] uppercase tracking-[0.16em] font-bold px-2 py-0.5">
                          Pendente
                        </span>
                      )}
                    </div>

                    {/* Preço do Prato */}
                    <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-xs font-serif font-bold px-2 py-0.5">
                      {item.price}
                    </div>
                  </div>

                  {/* Informações do Prato */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#6B8B70] block">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {(() => {
                            const isMostOrdered = mostOrderedIds.includes(item.id);
                            const position = mostOrderedIds.indexOf(item.id) + 1;
                            if (isMostOrdered) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('MOST_ORDERED');
                                  }}
                                  className="bg-[#E06D53]/15 hover:bg-[#E06D53]/25 text-[#C75338] text-[8px] uppercase tracking-[0.14em] font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Prato ativo nos Mais Pedidos da Home. Clique para gerenciar."
                                >
                                  <Flame className="w-2.5 h-2.5" />
                                  <span>Mais Pedidos #{position}</span>
                                </button>
                              );
                            }
                            return null;
                          })()}

                          {(() => {
                            const orig = originalMap.get(item.id);
                            if (orig && orig.name !== item.name) {
                              return (
                                <span
                                  className="bg-[#A67C52]/15 text-[#7D5832] text-[8px] uppercase tracking-[0.14em] font-bold px-1.5 py-0.5 rounded-xs"
                                  title={`Nome original: ${orig.name}`}
                                >
                                  Nome Editado
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#2C3E35] leading-snug mb-1">
                        {item.name}
                      </h3>
                      {item.description ? (
                        <p className="text-[11px] text-[#2C3E35]/70 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#2C3E35]/40 italic">Sem descrição</p>
                      )}
                    </div>

                    {/* Botões de Ação para o Prato */}
                    <div className="mt-4 pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-bold transition-colors cursor-pointer"
                        title="Alterar foto e nome deste prato"
                      >
                        <Pencil className="w-3 h-3 shrink-0" />
                        <span>Editar Foto & Nome</span>
                      </button>

                      {(() => {
                        const orig = originalMap.get(item.id);
                        const isModified = orig && (orig.name !== item.name || orig.image !== item.image);
                        if (isModified) {
                          return (
                            <button
                              type="button"
                              onClick={() => handleResetSingleItem(item)}
                              className="w-8 h-8 flex items-center justify-center text-[#2C3E35]/60 hover:text-[#A67C52] hover:bg-[#F0EAE1] border border-transparent hover:border-[#D9D0C3] transition-colors shrink-0"
                              title="Restaurar nome e foto originais"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {hasImage && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item)}
                          className="w-8 h-8 flex items-center justify-center text-[#2C3E35]/60 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0"
                          title="Remover foto deste prato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </main>

      {/* =========================================================================
          MODAL: EDITAR PRODUTO (FOTO E NOME)
          ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#1A241F]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F7F4EF] max-w-lg w-full border border-[#E8E1D7] p-6 sm:p-8 shadow-2xl relative my-auto text-[#2C3E35]">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#EFE9DF] hover:bg-[#2C3E35] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#6B8B70]">
                EDITAR PRODUTO &bull; {editingItem.category}
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs flex items-center gap-1">
                <Smartphone className="w-2.5 h-2.5" />
                <Monitor className="w-2.5 h-2.5" />
                Sincroniza Celular e PC
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C3E35] mb-2 leading-tight">
              Alterar Nome e Foto
            </h2>
            <p className="text-xs text-[#2C3E35]/70 mb-5 font-light">
              As alterações feitas aqui são salvas no servidor e atualizam imediatamente
              no site tanto no computador quanto no celular dos clientes.
            </p>

            {/* 1. CAMPO: NOME DO PRODUTO */}
            <div className="mb-5 bg-white p-4 border border-[#E8E1D7] shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-[0.18em] font-bold text-[#2C3E35]">
                  Nome do Produto
                </label>
                {(() => {
                  const orig = originalMap.get(editingItem.id);
                  if (orig && nameInput.trim() !== orig.name) {
                    return (
                      <button
                        type="button"
                        onClick={() => setNameInput(orig.name)}
                        className="text-[10px] text-[#A67C52] hover:text-[#8C6339] font-bold underline flex items-center gap-1 cursor-pointer"
                        title="Restaurar nome padrão original"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Restaurar original ({orig.name})
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Cuscuz Especial com Carne Seca"
                className="w-full p-3 bg-[#FBF9F6] border border-[#D9D0C3] focus:border-[#2C3E35] focus:bg-white text-sm font-serif font-bold text-[#2C3E35] outline-none transition-colors"
                required
              />
              <p className="text-[10px] text-[#2C3E35]/60 mt-1">
                Esse nome aparecerá no cardápio, na sacola de compras e na mensagem de pedido do WhatsApp.
              </p>
            </div>

            {/* 2. CAMPO: FOTO DO PRODUTO */}
            <div className="mb-5 bg-white p-4 border border-[#E8E1D7] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] uppercase tracking-[0.18em] font-bold text-[#2C3E35]">
                  Foto do Prato
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage('');
                      setUrlInput('');
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Remover foto
                  </button>
                )}
              </div>

              {/* Pré-visualização da Imagem */}
              <div className="relative aspect-16/10 bg-[#EFE9DF] border-2 border-dashed border-[#D9D0C3] overflow-hidden flex items-center justify-center mb-3">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-[#6B8B70]/50 mx-auto mb-1.5" />
                    <p className="text-xs text-[#2C3E35]/60 font-medium">Nenhuma foto selecionada</p>
                    <p className="text-[10px] text-[#2C3E35]/40 mt-0.5">
                      Envie um arquivo do aparelho ou informe um link abaixo
                    </p>
                  </div>
                )}

                {isProcessingFile && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-[#2C3E35] animate-spin" />
                  </div>
                )}
              </div>

              {/* Alternador de Modo: Arquivo ou URL */}
              <div className="flex border-b border-[#E8E1D7] mb-3">
                <button
                  type="button"
                  onClick={() => setUploadMode('FILE')}
                  className={`flex-1 py-2 text-xs uppercase tracking-[0.14em] font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'FILE'
                      ? 'border-[#2C3E35] text-[#2C3E35]'
                      : 'border-transparent text-[#2C3E35]/50 hover:text-[#2C3E35]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Arquivo (Celular / PC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('URL')}
                  className={`flex-1 py-2 text-xs uppercase tracking-[0.14em] font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'URL'
                      ? 'border-[#2C3E35] text-[#2C3E35]'
                      : 'border-transparent text-[#2C3E35]/50 hover:text-[#2C3E35]'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link Web (URL)</span>
                </button>
              </div>

              {uploadMode === 'FILE' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-[#F7F4EF] border border-[#2C3E35]/40 hover:bg-[#2C3E35] hover:text-white text-[#2C3E35] text-xs uppercase tracking-[0.14em] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Escolher Foto do Celular / Computador</span>
                  </button>
                  <p className="text-[10px] text-[#2C3E35]/60 text-center mt-1.5">
                    Formatos aceitos: JPG, PNG, WEBP. A foto é otimizada automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setPreviewImage(e.target.value);
                    }}
                    placeholder="https://exemplo.com/foto-do-prato.jpg"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#D9D0C3] focus:border-[#2C3E35] text-xs font-mono outline-none"
                  />
                  <p className="text-[10px] text-[#2C3E35]/50">
                    Cole o link direto da imagem na internet.
                  </p>
                </div>
              )}
            </div>

            {/* Mensagem de sucesso */}
            {actionSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}

            {/* Ações Salvar / Cancelar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={isSaving || !nameInput.trim()}
                className={`flex-1 py-3 px-4 text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 transition-colors ${
                  !isSaving && nameInput.trim()
                    ? 'bg-[#2C3E35] hover:bg-[#1E2C25] text-white cursor-pointer'
                    : 'bg-[#D9D0C3] text-white/70 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Foto e Nome</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEditingItem(null)}
                disabled={isSaving}
                className="py-3 px-4 bg-transparent border border-[#2C3E35]/30 hover:bg-[#EFE9DF] text-[#2C3E35] text-xs uppercase tracking-[0.16em] font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALTERAR CÓDIGO DE ACESSO
          ========================================================================= */}
      {isChangingCode && (
        <div className="fixed inset-0 z-50 bg-[#1A241F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F4EF] max-w-md w-full border border-[#E8E1D7] p-6 sm:p-8 shadow-2xl relative text-[#2C3E35]">
            <button
              onClick={() => setIsChangingCode(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#EFE9DF] hover:bg-[#2C3E35] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 bg-[#2C3E35] text-white flex items-center justify-center mb-3">
              <Key className="w-5 h-5" />
            </div>

            <h2 className="font-serif text-xl font-bold text-[#2C3E35] mb-1">
              Alterar Código de Acesso
            </h2>
            <p className="text-xs text-[#2C3E35]/70 mb-4 font-light">
              Defina um novo código secreto para proteger este painel administrativo.
            </p>

            <form onSubmit={handleSaveNewCode} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] font-bold text-[#2C3E35]/80 mb-1">
                  Novo Código
                </label>
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="Ex: sabor2026"
                  required
                  className="w-full p-3 bg-white border border-[#D9D0C3] focus:border-[#2C3E35] text-sm font-mono outline-none"
                />
              </div>

              {codeChangeStatus && (
                <p className="text-xs font-semibold text-emerald-800">{codeChangeStatus}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs uppercase tracking-[0.18em] font-bold transition-colors"
                >
                  Salvar Novo Código
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingCode(false)}
                  className="py-3 px-4 border border-[#2C3E35]/30 text-xs uppercase tracking-[0.16em] font-bold"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BACKUP E RESTAURAÇÃO DE FOTOS
          ========================================================================= */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A241F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F4EF] max-w-lg w-full border border-[#E8E1D7] p-6 sm:p-8 shadow-2xl relative text-[#2C3E35]">
            <button
              onClick={() => setIsBackupModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#EFE9DF] hover:bg-[#2C3E35] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#2C3E35] mb-2">
              Backup &amp; Restauração de Fotos
            </h2>
            <p className="text-xs text-[#2C3E35]/70 mb-6">
              Exporte uma cópia das fotos configuradas para guardar no seu computador ou restaure um
              backup anterior.
            </p>

            <div className="space-y-6">
              {/* Exportar */}
              <div className="p-4 bg-white border border-[#E8E1D7]">
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#2C3E35] mb-1">
                  1. Exportar Cópia de Segurança
                </h3>
                <p className="text-[11px] text-[#2C3E35]/70 mb-3">
                  Baixe um arquivo contendo todas as fotos que você já colocou nos pratos.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-2 py-2 px-3 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-[11px] uppercase tracking-[0.16em] font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo de Backup</span>
                </button>
              </div>

              {/* Importar */}
              <div className="p-4 bg-white border border-[#E8E1D7]">
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#2C3E35] mb-1">
                  2. Restaurar Backup
                </h3>
                <p className="text-[11px] text-[#2C3E35]/70 mb-2">
                  Cole o conteúdo do arquivo JSON de backup para restaurar:
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={3}
                  placeholder='{"cuscuz-ovo-queijo": "data:image/..."}'
                  className="w-full p-2 bg-[#F7F4EF] border border-[#D9D0C3] text-[11px] font-mono mb-2"
                />
                <button
                  type="button"
                  onClick={handleImportBackup}
                  disabled={!importJsonText.trim()}
                  className="inline-flex items-center gap-2 py-2 px-3 bg-[#6B8B70] hover:bg-[#58735C] text-white text-[11px] uppercase tracking-[0.16em] font-bold transition-colors disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Restaurar Fotos</span>
                </button>
              </div>

              {/* Limpar todas as fotos */}
              <div className="pt-2 border-t border-[#E8E1D7] flex justify-between items-center">
                <span className="text-[11px] text-rose-800 font-semibold">
                  Restaurar Fotos Padrão:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza? Isso apagará todas as fotos customizadas e voltará ao cardápio padrão original.')) {
                      clearAllCustomImages();
                      window.location.reload();
                    }
                  }}
                  className="text-xs text-rose-700 hover:text-rose-900 underline font-medium"
                >
                  Limpar Todas as Fotos Customizadas
                </button>
              </div>

              {backupNotice && (
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2 border border-emerald-200">
                  {backupNotice}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
