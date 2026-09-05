import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Grid,
  List,
  Plus,
  UtensilsCrossed,
} from 'lucide-react';
import { MenuItem } from '../types';
import { getWhatsAppUrl } from '../config/store';
import { ProductImage } from './ProductImage';

interface DedicatedMenuPageProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  onReturnHome: () => void;
}

type MainCategory = 'TODOS' | 'TAPIOCAS' | 'CUSCUZ' | 'CAFÉS' | 'BEBIDAS' | 'BOLOS';
type TapiocaType = 'SALGADAS' | 'DOCES';
type SalgadaFlavor =
  | 'TODAS'
  | 'FRANGO'
  | 'QUEIJO'
  | 'CARNE SECA'
  | 'BANANA DA TERRA'
  | 'CALABRESA'
  | 'FITNESS';

const MAIN_CATEGORIES: { id: MainCategory; label: string }[] = [
  { id: 'TODOS', label: 'TODOS' },
  { id: 'TAPIOCAS', label: 'TAPIOCAS' },
  { id: 'CUSCUZ', label: 'CUSCUZ' },
  { id: 'CAFÉS', label: 'CAFÉS' },
  { id: 'BEBIDAS', label: 'BEBIDAS' },
  { id: 'BOLOS', label: 'BOLOS' },
];

const SALGADA_FLAVORS: { id: SalgadaFlavor; label: string; categoryKey?: string }[] = [
  { id: 'TODAS', label: 'TODAS' },
  { id: 'FRANGO', label: 'FRANGO', categoryKey: 'TAPIOCA RENDA — FRANGO' },
  { id: 'QUEIJO', label: 'QUEIJO', categoryKey: 'TAPIOCA RENDA — QUEIJO' },
  { id: 'CARNE SECA', label: 'CARNE SECA', categoryKey: 'TAPIOCA RENDA — CARNE SECA' },
  { id: 'BANANA DA TERRA', label: 'BANANA DA TERRA', categoryKey: 'TAPIOCA RENDA — BANANA DA TERRA' },
  { id: 'CALABRESA', label: 'CALABRESA', categoryKey: 'TAPIOCA RENDA — CALABRESA' },
  { id: 'FITNESS', label: 'FITNESS', categoryKey: 'TAPIOCA RENDA — FITNESS' },
];

export const DedicatedMenuPage: React.FC<DedicatedMenuPageProps> = ({
  items,
  onSelectItem,
  onAddToCart,
  onReturnHome,
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>('TODOS');
  const [selectedTapiocaType, setSelectedTapiocaType] = useState<TapiocaType>('SALGADAS');
  const [selectedSalgadaFlavor, setSelectedSalgadaFlavor] = useState<SalgadaFlavor>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  const handleSelectMain = (cat: MainCategory) => {
    setSelectedMainCategory(cat);
    if (cat === 'TAPIOCAS') {
      setSelectedTapiocaType('SALGADAS');
      setSelectedSalgadaFlavor('TODAS');
    }
  };

  // Filtragem dos produtos com suporte a busca e categorias
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedMainCategory === 'CUSCUZ') {
      result = result.filter((item) => item.category === 'CUSCUZ');
    } else if (selectedMainCategory === 'CAFÉS') {
      result = result.filter(
        (item) => item.category === 'CAFÉ' || item.category.includes('CAFÉ')
      );
    } else if (selectedMainCategory === 'BEBIDAS') {
      result = result.filter((item) => item.category === 'BEBIDAS');
    } else if (selectedMainCategory === 'BOLOS') {
      result = result.filter((item) => item.category.toUpperCase().includes('BOLO'));
    } else if (selectedMainCategory === 'TAPIOCAS') {
      if (selectedTapiocaType === 'DOCES') {
        result = result.filter((item) => item.category === 'TAPIOCAS DOCES');
      } else {
        // Salgadas
        if (selectedSalgadaFlavor === 'TODAS') {
          result = result.filter(
            (item) => item.category.startsWith('TAPIOCA RENDA') && item.category !== 'TAPIOCAS DOCES'
          );
        } else {
          const flavorMatch = SALGADA_FLAVORS.find((f) => f.id === selectedSalgadaFlavor);
          if (flavorMatch && flavorMatch.categoryKey) {
            result = result.filter((item) => item.category === flavorMatch.categoryKey);
          } else {
            result = result.filter((item) => item.category.startsWith('TAPIOCA RENDA'));
          }
        }
      }
    }

    // Busca textual por nome, categoria ou ingredientes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedMainCategory, selectedTapiocaType, selectedSalgadaFlavor, searchQuery]);

  return (
    <div className="w-full bg-[#F7F4EF] text-[#2C3E35] min-h-[75vh] pt-24 sm:pt-28 pb-20 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Navegação de Retorno sutil */}
        <div className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35]/70 hover:text-[#2C3E35] transition-colors py-1 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6B8B70] group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para a Página Inicial</span>
          </button>
        </div>

        {/* Título e Subtítulo Editorial */}
        <header className="mb-8 sm:mb-12 pb-6 border-b border-[#E8E1D7]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#6B8B70] block mb-1.5">
                Sabor da Roça &bull; Tapioca &amp; Café
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-medium text-[#2C3E35] tracking-normal leading-tight">
                Nosso Cardápio
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#2C3E35]/75 mt-1.5 font-normal">
                Todas as fotos dos pratos preparadas com ingredientes selecionados da roça.
              </p>
            </div>

            {/* Controles do Cabeçalho: Busca & Alternador de Visualização */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Campo de Busca Rápida */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C3E35]/40 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar no cardápio..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#E8E1D7] text-xs text-[#2C3E35] placeholder:text-[#2C3E35]/45 focus:outline-none focus:border-[#6B8B70] transition-colors"
                />
              </div>

              {/* Contador de produtos e Alternador Grade / Lista */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-sans text-xs uppercase tracking-[0.08em] text-[#2C3E35]/60 font-medium whitespace-nowrap">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
                </span>

                <div className="flex items-center border border-[#E8E1D7] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('GRID')}
                    title="Visualizar em Grade com Fotos"
                    aria-label="Visualizar em Grade com Fotos"
                    className={`p-1.5 transition-colors cursor-pointer ${
                      viewMode === 'GRID'
                        ? 'bg-[#2C3E35] text-white'
                        : 'text-[#2C3E35]/60 hover:text-[#2C3E35]'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('LIST')}
                    title="Visualizar em Lista"
                    aria-label="Visualizar em Lista"
                    className={`p-1.5 transition-colors cursor-pointer ${
                      viewMode === 'LIST'
                        ? 'bg-[#2C3E35] text-white'
                        : 'text-[#2C3E35]/60 hover:text-[#2C3E35]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Categorias Principais (Filtros horizontais compactos) */}
          <nav
            aria-label="Categorias do Cardápio"
            className="mt-6 sm:mt-8 pt-4 border-t border-[#E8E1D7]/70"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x [webkit-overflow-scrolling:touch]">
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = selectedMainCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`filter-main-${cat.id.toLowerCase()}`}
                    type="button"
                    onClick={() => handleSelectMain(cat.id)}
                    className={`whitespace-nowrap text-xs uppercase tracking-[0.08em] font-medium py-1.5 px-3.5 transition-colors shrink-0 border min-h-[38px] flex items-center cursor-pointer ${
                      isActive
                        ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                        : 'bg-[#F0EAE1]/50 text-[#2C3E35]/75 border-[#E5DDCF] hover:border-[#2C3E35]/40 hover:text-[#2C3E35]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sub-navegação quando TAPIOCAS é selecionada */}
          {selectedMainCategory === 'TAPIOCAS' && (
            <div className="mt-4 pt-4 border-t border-[#E8E1D7]/50 space-y-3">
              {/* Nível 1: SALGADAS / DOCES */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium mr-1 shrink-0">
                  Tipo:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="tapioca-type-salgadas"
                    onClick={() => {
                      setSelectedTapiocaType('SALGADAS');
                      setSelectedSalgadaFlavor('TODAS');
                    }}
                    className={`text-[11px] uppercase tracking-[0.08em] font-medium px-3 py-1 border transition-colors cursor-pointer ${
                      selectedTapiocaType === 'SALGADAS'
                        ? 'bg-[#6B8B70] text-white border-[#6B8B70]'
                        : 'bg-white text-[#2C3E35]/80 border-[#E5DDCF] hover:border-[#2C3E35]/40'
                    }`}
                  >
                    Salgadas
                  </button>

                  <button
                    type="button"
                    id="tapioca-type-doces"
                    onClick={() => setSelectedTapiocaType('DOCES')}
                    className={`text-[11px] uppercase tracking-[0.08em] font-medium px-3 py-1 border transition-colors cursor-pointer ${
                      selectedTapiocaType === 'DOCES'
                        ? 'bg-[#6B8B70] text-white border-[#6B8B70]'
                        : 'bg-white text-[#2C3E35]/80 border-[#E5DDCF] hover:border-[#2C3E35]/40'
                    }`}
                  >
                    Doces
                  </button>
                </div>
              </div>

              {/* Nível 2: RECHEIOS DE SALGADAS */}
              {selectedTapiocaType === 'SALGADAS' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x [webkit-overflow-scrolling:touch]">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#2C3E35]/60 font-normal mr-1 shrink-0">
                    Recheio:
                  </span>
                  {SALGADA_FLAVORS.map((flavor) => {
                    const isFlavorActive = selectedSalgadaFlavor === flavor.id;
                    return (
                      <button
                        key={flavor.id}
                        id={`salgada-flavor-${flavor.id.toLowerCase().replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => setSelectedSalgadaFlavor(flavor.id)}
                        className={`whitespace-nowrap text-[10px] uppercase tracking-[0.08em] font-medium px-2.5 py-1 transition-colors shrink-0 border cursor-pointer ${
                          isFlavorActive
                            ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                            : 'bg-white/80 text-[#2C3E35]/70 border-[#E8E1D7] hover:border-[#2C3E35]/30'
                        }`}
                      >
                        {flavor.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Caso especial: BOLOS sem prato cadastrado */}
        {selectedMainCategory === 'BOLOS' && filteredItems.length === 0 && (
          <div className="p-8 sm:p-12 bg-[#F0EAE1]/60 border border-[#E5DDCF] text-center max-w-2xl mx-auto my-8">
            <div className="w-10 h-10 mx-auto border border-[#6B8B70]/40 flex items-center justify-center mb-3 text-[#6B8B70]">
              <UtensilsCrossed className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#2C3E35] mb-2">
              Fornadas do Dia
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#2C3E35]/80 font-normal leading-relaxed mb-6 max-w-md mx-auto">
              Nossos bolos caseiros (aipim, cenoura com chocolate e fubá cremoso) saem fresquinhos todos os dias no balcão do Shopping Avenida.
            </p>
            <a
              href={getWhatsAppUrl('Olá! Gostaria de saber quais bolos do dia estão disponíveis hoje na Roça.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs font-medium uppercase tracking-[0.08em] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#6B8B70]" />
              <span>Consultar Sabores no WhatsApp</span>
            </a>
          </div>
        )}

        {/* Nenhum prato encontrado com o filtro atual */}
        {filteredItems.length === 0 && selectedMainCategory !== 'BOLOS' && (
          <div className="bg-white border border-[#E8E1D7] p-12 text-center max-w-md mx-auto my-8">
            <UtensilsCrossed className="w-8 h-8 text-[#6B8B70] mx-auto mb-3" />
            <p className="font-serif text-xl font-medium text-[#2C3E35]">Nenhum prato encontrado</p>
            <p className="text-xs text-[#2C3E35]/65 mt-1.5 leading-relaxed">
              Tente pesquisar com outro nome ou selecionar outra categoria acima.
            </p>
          </div>
        )}

        {/* VISUALIZAÇÃO EM GRADE COM FOTOS — CONFORME O PAINEL */}
        {filteredItems.length > 0 && viewMode === 'GRID' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredItems.map((item) => {
              return (
                <article
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="group flex flex-col bg-white border border-[#E8E1D7] hover:border-[#6B8B70]/70 transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.99]"
                >
                  {/* Foto Gastronômica / Thumbnail via ProductImage */}
                  <ProductImage
                    src={item.imageUrl || item.image}
                    alt={item.name}
                    aspectRatio="aspect-[4/3]"
                    category={item.category}
                    containerClassName="border-b border-[#E8E1D7]"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    placeholderLabel="Fotografia em preparo"
                  >
                    {/* Categoria do Produto em Etiqueta Discreta */}
                    <span className="absolute bottom-2.5 left-2.5 bg-[#2C3E35]/90 backdrop-blur-xs text-white text-[9px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 pointer-events-none">
                      {item.category.replace('TAPIOCA RENDA — ', '')}
                    </span>
                  </ProductImage>

                  {/* Informações do Produto */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    {/* Nome do Prato */}
                    <h3 className="font-serif text-lg sm:text-[19px] font-medium text-[#2C3E35] group-hover:text-[#6B8B70] transition-colors leading-snug mb-1.5">
                      {item.name}
                    </h3>

                    {/* Descrição do Prato */}
                    {item.description ? (
                      <p className="font-sans text-xs sm:text-[13px] text-[#2C3E35]/75 font-normal leading-relaxed mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    ) : (
                      <div className="mb-4" />
                    )}

                    {/* Barra Inferior: Preço & Ações */}
                    <div className="mt-auto pt-3.5 border-t border-[#E8E1D7] flex items-center justify-between gap-2">
                      <span className="font-sans text-base sm:text-lg font-semibold text-[#2C3E35] whitespace-nowrap">
                        {item.price}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {onAddToCart && (
                          <button
                            type="button"
                            id={`btn-add-cart-grid-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(item);
                            }}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[#2C3E35] hover:text-white hover:bg-[#2C3E35] border border-[#2C3E35]/35 text-[10.5px] font-medium uppercase tracking-[0.06em] transition-colors cursor-pointer min-h-[32px]"
                            title={`Adicionar ${item.name} à sacola`}
                            aria-label={`Adicionar ${item.name} à sacola`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Adicionar</span>
                          </button>
                        )}

                        <a
                          id={`btn-pedir-${item.id}`}
                          href={item.ifoodUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.06em] font-medium text-white bg-[#2C3E35] hover:bg-[#6B8B70] active:scale-[0.98] transition-colors whitespace-nowrap min-h-[32px]"
                          aria-label={`Pedir ${item.name} no iFood`}
                        >
                          <span>iFood</span>
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* VISUALIZAÇÃO EM LISTA — TAMBÉM COM FOTO EM MINIATURA */}
        {filteredItems.length > 0 && viewMode === 'LIST' && (
          <div className="bg-white border border-[#E8E1D7] divide-y divide-[#E8E1D7]">
            {filteredItems.map((item) => {
              return (
                <article
                  key={item.id}
                  id={`menu-row-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 group hover:bg-[#F0EAE1]/30 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    {/* Miniatura da Foto via ProductImage */}
                    <ProductImage
                      src={item.imageUrl || item.image}
                      alt={item.name}
                      aspectRatio=""
                      containerClassName="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-[#E8E1D7]"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Nome, Categoria e Descrição */}
                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block mb-0.5">
                        {item.category.replace('TAPIOCA RENDA — ', '')}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-medium text-[#2C3E35] group-hover:text-[#6B8B70] transition-colors leading-snug">
                        {item.name}
                      </h4>
                      {item.description ? (
                        <p className="font-sans text-xs text-[#2C3E35]/70 font-normal leading-relaxed mt-0.5 max-w-2xl line-clamp-2">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Preço e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E1D7]/50">
                    <span className="font-sans text-sm sm:text-base font-semibold text-[#2C3E35] whitespace-nowrap">
                      {item.price}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onAddToCart && (
                        <button
                          type="button"
                          id={`btn-add-cart-list-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[#2C3E35] hover:text-white hover:bg-[#2C3E35] border border-[#2C3E35]/35 text-[10.5px] font-medium uppercase tracking-[0.06em] transition-colors cursor-pointer min-h-[30px]"
                          title={`Adicionar ${item.name} à sacola`}
                          aria-label={`Adicionar ${item.name} à sacola`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Adicionar</span>
                        </button>
                      )}

                      <a
                        id={`btn-pedir-list-${item.id}`}
                        href={item.ifoodUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-white bg-[#2C3E35] hover:bg-[#6B8B70] transition-colors shrink-0 min-h-[30px]"
                        aria-label={`Pedir ${item.name} no iFood`}
                      >
                        <span>iFood</span>
                        <span aria-hidden="true" className="text-xs">&rarr;</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
