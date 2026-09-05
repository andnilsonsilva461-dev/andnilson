import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Search,
  X,
  Sparkles,
  Smartphone,
  Monitor,
  AlertCircle,
  Eye,
  UtensilsCrossed,
  Replace,
} from 'lucide-react';
import { MenuItem } from '../types';
import {
  DEFAULT_MOST_ORDERED_IDS,
  getCachedMostOrderedIds,
  saveMostOrdered,
  resetMostOrdered,
  fetchServerMostOrdered,
} from '../utils/mostOrderedStorage';

interface AdminMostOrderedManagerProps {
  menuItems: MenuItem[];
  onReturnToStore: () => void;
}

export const AdminMostOrderedManager: React.FC<AdminMostOrderedManagerProps> = ({
  menuItems,
  onReturnToStore,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getCachedMostOrderedIds());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Modal selector state
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Preview toggle
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Sync on mount
  useEffect(() => {
    fetchServerMostOrdered().then((ids) => {
      if (ids && ids.length > 0) {
        setSelectedIds(ids);
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSelectedIds(e.detail);
      }
    };
    window.addEventListener('sabor-most-ordered-updated', handleUpdate);
    return () => window.removeEventListener('sabor-most-ordered-updated', handleUpdate);
  }, []);

  // Map of full items currently in most ordered
  const currentOrderedItems = useMemo(() => {
    return selectedIds
      .map((id) => menuItems.find((item) => item.id === id))
      .filter(Boolean) as MenuItem[];
  }, [selectedIds, menuItems]);

  // Categories list for picker
  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ['TODAS', ...cats];
  }, [menuItems]);

  // Filtered menu items for the picker modal
  const filteredPickerItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat =
        selectedCategory === 'TODAS' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Save changes helper
  const commitChanges = async (newIds: string[], message?: string) => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const result = await saveMostOrdered(newIds);
      setSelectedIds(result.itemIds);
      if (message) {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao salvar no servidor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Move item position
  const handleMoveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedIds.length) return;

    const updated = [...selectedIds];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    commitChanges(updated, 'Ordem dos Mais Pedidos atualizada!');
  };

  // Remove item
  const handleRemoveItem = (idToRemove: string) => {
    if (selectedIds.length <= 3) {
      const confirmed = window.confirm(
        'Atenção: Recomenda-se manter pelo menos 3 a 6 itens na seção Mais Pedidos para a página inicial ficar completa. Deseja remover mesmo assim?'
      );
      if (!confirmed) return;
    }

    const updated = selectedIds.filter((id) => id !== idToRemove);
    commitChanges(updated, 'Item removido dos Mais Pedidos.');
  };

  // Open modal to add new
  const handleOpenAddModal = () => {
    setReplaceTargetId(null);
    setSearchQuery('');
    setSelectedCategory('TODAS');
    setIsPickerOpen(true);
  };

  // Open modal to replace existing item
  const handleOpenReplaceModal = (targetId: string) => {
    setReplaceTargetId(targetId);
    setSearchQuery('');
    setSelectedCategory('TODAS');
    setIsPickerOpen(true);
  };

  // Select item from modal
  const handleSelectItemFromModal = (item: MenuItem) => {
    if (replaceTargetId) {
      // Replacing existing item
      const updated = selectedIds.map((id) =>
        id === replaceTargetId ? item.id : id
      );
      // Remove any duplicate if the item was already in the list elsewhere
      const unique: string[] = Array.from(new Set<string>(updated));
      commitChanges(unique, `Item substituído por "${item.name}" com sucesso!`);
    } else {
      // Adding new item
      if (selectedIds.includes(item.id)) {
        setErrorMessage(`O item "${item.name}" já está na lista dos Mais Pedidos.`);
        return;
      }
      const updated = [...selectedIds, item.id];
      commitChanges(updated, `"${item.name}" adicionado aos Mais Pedidos com sucesso!`);
    }

    setIsPickerOpen(false);
    setReplaceTargetId(null);
  };

  // Toggle item directly from the full catalog list
  const handleToggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      handleRemoveItem(itemId);
    } else {
      const updated = [...selectedIds, itemId];
      commitChanges(updated, 'Item adicionado aos Mais Pedidos!');
    }
  };

  // Reset to default
  const handleReset = async () => {
    const confirmed = window.confirm(
      'Deseja restaurar a seleção dos Mais Pedidos para a lista padrão original do Sabor da Roça?'
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const result = await resetMostOrdered();
      setSelectedIds(result.itemIds);
      setSuccessMessage('Mais Pedidos restaurados para o padrão original!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setErrorMessage('Erro ao restaurar lista padrão.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner Superior com Estatísticas & Explicação */}
      <div className="bg-white border border-[#E8E1D7] p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E06D53]" />
              <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#E06D53]">
                DESTAQUES DA HOME &bull; SEÇÃO OS MAIS PEDIDOS
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E35]">
              Gerenciar "Os Mais Pedidos"
            </h1>
            <p className="text-xs sm:text-sm text-[#2C3E35]/70 mt-1 max-w-2xl font-light leading-relaxed">
              Personalize exatamente quais pratos aparecem na seção principal da página inicial.
              Adicione novos pratos, remova, substitua e mude a ordem de exibição (1º, 2º, 3º...)
              com sincronização automática em todos os aparelhos.
            </p>
          </div>

          {/* Contadores e Ações Principais */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-[#FAF5ED] border border-[#E06D53]/30 px-4 py-2.5 text-center min-w-[100px]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#C75338] block">
                {selectedIds.length}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#C75338] font-semibold block mt-0.5">
                Pratos Ativos
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#85B08C]" />
              <span>Adicionar Prato</span>
            </button>
          </div>
        </div>

        {/* Notificações em Tempo Real */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-700 hover:text-rose-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Barra de Ferramentas / Restaurar & Status */}
        <div className="mt-6 pt-4 border-t border-[#E8E1D7] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EAE1] hover:bg-rose-900 hover:text-white text-[#2C3E35] font-semibold uppercase tracking-[0.14em] text-[11px] border border-[#E5DDCF] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Seleção Padrão</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLivePreview((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F7F4EF] text-[#2C3E35] font-medium uppercase tracking-[0.12em] text-[11px] border border-[#E8E1D7] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#6B8B70]" />
              <span>{showLivePreview ? 'Ocultar Prévia da Home' : 'Ver Prévia da Home'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <Monitor className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sincronizado automaticamente na Home</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: ITENS ATIVOS EM "OS MAIS PEDIDOS" COM REORDENAÇÃO */}
      <div className="bg-white border border-[#E8E1D7] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#E8E1D7]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2C3E35] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#E06D53]" />
              <span>Itens Selecionados ({currentOrderedItems.length})</span>
            </h2>
            <p className="text-xs text-[#2C3E35]/60 mt-0.5">
              A ordem abaixo é a mesma em que os pratos aparecem para o cliente na Home. Use as setas para reordenar.
            </p>
          </div>

          <span className="text-[11px] bg-[#FAF5ED] border border-[#E06D53]/20 text-[#C75338] px-3 py-1 font-semibold uppercase tracking-[0.1em] self-start sm:self-auto">
            Recomendado: 4 a 6 pratos
          </span>
        </div>

        {currentOrderedItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E8E1D7] bg-[#FAF7F2] p-6">
            <UtensilsCrossed className="w-10 h-10 text-[#2C3E35]/30 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#2C3E35] mb-1">
              Nenhum prato selecionado
            </h3>
            <p className="text-xs text-[#2C3E35]/70 max-w-md mx-auto mb-4">
              A seção "Mais Pedidos" está vazia. Adicione os pratos favoritos dos clientes ou restaure a seleção padrão.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#2C3E35] text-white text-xs font-bold uppercase tracking-[0.1em]"
              >
                Adicionar Prato
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-[#F0EAE1] text-[#2C3E35] text-xs font-bold uppercase tracking-[0.1em] border border-[#E8E1D7]"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentOrderedItems.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === currentOrderedItems.length - 1;
              const hasImage = Boolean(item.image && item.image.trim() !== '');

              return (
                <div
                  key={item.id}
                  className="bg-[#FAF7F2] border border-[#E8E1D7] p-4 flex flex-col justify-between hover:border-[#6B8B70]/60 transition-all shadow-2xs group relative"
                >
                  {/* Cabeçalho do Card com Número de Posição */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#2C3E35] text-white font-bold text-xs flex items-center justify-center rounded-xs">
                        {index + 1}º
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#6B8B70] truncate max-w-[140px]">
                        {item.category.replace('TAPIOCA RENDA — ', '')}
                      </span>
                    </div>

                    {/* Botões de Reordenação Rápida */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'UP')}
                        disabled={isFirst || isSaving}
                        title={isFirst ? 'Já é o primeiro da lista' : 'Mover para posição anterior'}
                        className="p-1 text-[#2C3E35]/60 hover:text-[#2C3E35] hover:bg-white border border-[#E8E1D7] disabled:opacity-25 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 hidden sm:inline" />
                        <ArrowUp className="w-3.5 h-3.5 sm:hidden" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'DOWN')}
                        disabled={isLast || isSaving}
                        title={isLast ? 'Já é o último da lista' : 'Mover para próxima posição'}
                        className="p-1 text-[#2C3E35]/60 hover:text-[#2C3E35] hover:bg-white border border-[#E8E1D7] disabled:opacity-25 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                        <ArrowDown className="w-3.5 h-3.5 sm:hidden" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail da Foto + Nome e Preço */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-20 h-20 bg-[#E8E1D7] border border-[#E8E1D7] shrink-0 overflow-hidden flex items-center justify-center">
                      {(item.imageUrl || item.image) ? (
                        <img
                          src={item.imageUrl || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UtensilsCrossed className="w-6 h-6 text-[#2C3E35]/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-serif text-sm font-bold text-[#2C3E35] leading-tight line-clamp-2 mb-1">
                        {item.name}
                      </h4>
                      <span className="font-sans text-xs font-semibold text-[#6B8B70]">
                        {item.price}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Ações: Substituir ou Remover */}
                  <div className="pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReplaceModal(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] font-semibold text-[#2C3E35] hover:text-[#6B8B70] transition-colors cursor-pointer"
                    >
                      <Replace className="w-3 h-3" />
                      <span>Trocar Prato</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remover este prato dos Mais Pedidos"
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] font-semibold text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: CATÁLOGO COMPLETO COM BOTÕES DE ATIVAÇÃO RÁPIDA (TOGGLE) */}
      <div className="bg-white border border-[#E8E1D7] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8E1D7]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2C3E35] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6B8B70]" />
              <span>Catálogo Completo do Cardápio</span>
            </h2>
            <p className="text-xs text-[#2C3E35]/60 mt-0.5">
              Clique em "+ Adicionar" ou "Remover" em qualquer prato abaixo para ligar/desligar instantaneamente dos Mais Pedidos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#2C3E35]/70 font-medium">
              Total no Cardápio: <strong>{menuItems.length} pratos</strong>
            </span>
          </div>
        </div>

        {/* Grade compacta de todos os pratos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto p-1">
          {menuItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const position = selectedIds.indexOf(item.id) + 1;

            return (
              <div
                key={item.id}
                className={`p-3 border text-xs flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-[#FAF5ED] border-[#E06D53]/40'
                    : 'bg-white border-[#E8E1D7] hover:border-[#2C3E35]/30'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-12 h-12 bg-[#EFE9DF] shrink-0 border border-[#E8E1D7] overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2C3E35]/40">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-[#6B8B70] block truncate">
                      {item.category.replace('TAPIOCA RENDA — ', '')}
                    </span>
                    <h5 className="font-serif font-bold text-[#2C3E35] leading-snug truncate" title={item.name}>
                      {item.name}
                    </h5>
                    <span className="text-[11px] font-semibold text-[#2C3E35]/80">
                      {item.price}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-[#E8E1D7]/60 flex items-center justify-between gap-1">
                  {isSelected ? (
                    <>
                      <span className="text-[10px] font-bold text-[#C75338] bg-[#E06D53]/10 px-1.5 py-0.5">
                        {position}º na Home
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className="text-[10px] uppercase font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                      >
                        Remover
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className="w-full py-1 text-center bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-[10px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
                    >
                      + Adicionar à Home
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 3: PRÉ-VISUALIZAÇÃO AO VIVO DA SEÇÃO DA HOME */}
      {showLivePreview && (
        <div className="bg-[#F7F4EF] border border-[#E8E1D7] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E1D7]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6B8B70]" />
              <span className="text-xs uppercase tracking-[0.14em] font-bold text-[#2C3E35]">
                Prévia da Seção "Os Mais Pedidos" na Página Inicial
              </span>
            </div>
            <span className="text-[11px] text-[#2C3E35]/60 font-sans">
              Visualização idêntica à do cliente
            </span>
          </div>

          {/* Renderização real da prévia */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-[1px] bg-[#6B8B70]" />
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70]">
                Sabor da Roça &bull; Destaques
              </span>
              <span className="w-4 h-[1px] bg-[#6B8B70]" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C3E35]">
              Os Mais Pedidos
            </h3>
            <p className="text-xs sm:text-sm text-[#2C3E35]/75 mt-1">
              Uma seleção com os pratos e sabores mais amados pelos nossos clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {currentOrderedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#F0EAE1]/40 border border-[#E8E1D7] p-4 flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#E2D9CC] overflow-hidden mb-3 border border-[#E8E1D7]">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-[#2C3E35]/30" />
                    </div>
                  )}
                </div>
                <h4 className="font-serif text-base font-medium text-[#2C3E35] mb-1">
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-xs text-[#2C3E35]/70 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto pt-2 border-t border-[#E8E1D7] flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#2C3E35]">
                    {item.price}
                  </span>
                  <span className="px-3 py-1 bg-[#2C3E35] text-white text-[10px] uppercase tracking-[0.08em] font-medium">
                    Pedir &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE SELEÇÃO / SUBSTITUIÇÃO DE PRATO */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-[#E8E1D7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="bg-[#2C3E35] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#85B08C] block">
                  {replaceTargetId ? 'SUBSTITUIR PRATO' : 'ADICIONAR NOVO PRATO AOS MAIS PEDIDOS'}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  {replaceTargetId
                    ? 'Escolha o prato substituto:'
                    : 'Selecione um prato do cardápio:'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setReplaceTargetId(null);
                }}
                className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Busca & Filtros por Categoria */}
            <div className="p-4 border-b border-[#E8E1D7] space-y-3 bg-[#FAF7F2]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#2C3E35]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prato por nome ou ingrediente..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E1D7] text-xs text-[#2C3E35] focus:outline-none focus:border-[#6B8B70]"
                />
              </div>

              {/* Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] border transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                        : 'bg-white text-[#2C3E35]/70 border-[#E8E1D7] hover:text-[#2C3E35]'
                    }`}
                  >
                    {cat.replace('TAPIOCA RENDA — ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com Rolagem dos Pratos */}
            <div className="p-6 overflow-y-auto space-y-3 max-h-[55vh]">
              {filteredPickerItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#2C3E35]/60">
                  Nenhum prato encontrado para a busca "{searchQuery}".
                </div>
              ) : (
                filteredPickerItems.map((item) => {
                  const isAlreadySelected = selectedIds.includes(item.id);
                  const isCurrentTarget = item.id === replaceTargetId;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 border flex items-center justify-between gap-3 transition-colors ${
                        isCurrentTarget
                          ? 'bg-amber-50 border-amber-300'
                          : isAlreadySelected
                          ? 'bg-[#F0EAE1]/50 border-[#E8E1D7]'
                          : 'bg-white border-[#E8E1D7] hover:border-[#6B8B70]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-[#EFE9DF] border border-[#E8E1D7] shrink-0 overflow-hidden">
                          {(item.imageUrl || item.image) ? (
                            <img
                              src={item.imageUrl || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#2C3E35]/30">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#6B8B70] block">
                            {item.category.replace('TAPIOCA RENDA — ', '')}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-[#2C3E35] truncate">
                            {item.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#2C3E35]">
                            {item.price}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrentTarget ? (
                          <span className="text-[11px] text-amber-800 font-semibold px-2 py-1 bg-amber-100">
                            Prato Atual
                          </span>
                        ) : isAlreadySelected && !replaceTargetId ? (
                          <span className="text-[11px] text-emerald-800 font-semibold px-2 py-1 bg-emerald-100">
                            ✓ Já Selecionado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectItemFromModal(item)}
                            className="px-3.5 py-1.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer shadow-2xs"
                          >
                            {replaceTargetId ? 'Escolher este' : '+ Selecionar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="bg-[#F7F4EF] px-6 py-3 border-t border-[#E8E1D7] flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setReplaceTargetId(null);
                }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2C3E35]/70 hover:text-[#2C3E35] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
