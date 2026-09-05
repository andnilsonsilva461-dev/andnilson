import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { ExternalLink } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface MenuSectionProps {
  items?: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  onOpenBasket?: () => void;
  cartCount?: number;
}

type MainCategory = 'TUDO' | 'CUSCUZ' | 'TAPIOCAS' | 'CAFÉ' | 'BEBIDAS';

type TapiocaSubCategory =
  | 'TODAS'
  | 'FRANGO'
  | 'QUEIJO'
  | 'CARNE SECA'
  | 'BANANA DA TERRA'
  | 'CALABRESA'
  | 'FITNESS'
  | 'DOCES';

const MAIN_CATEGORIES: { id: MainCategory; label: string }[] = [
  { id: 'TUDO', label: 'TUDO' },
  { id: 'CUSCUZ', label: 'CUSCUZ' },
  { id: 'TAPIOCAS', label: 'TAPIOCAS' },
  { id: 'CAFÉ', label: 'CAFÉ' },
  { id: 'BEBIDAS', label: 'BEBIDAS' },
];

const TAPIOCA_SUBCATEGORIES: { id: TapiocaSubCategory; label: string; fullCategory?: string }[] = [
  { id: 'TODAS', label: 'TODAS' },
  { id: 'FRANGO', label: 'FRANGO', fullCategory: 'TAPIOCA RENDA — FRANGO' },
  { id: 'QUEIJO', label: 'QUEIJO', fullCategory: 'TAPIOCA RENDA — QUEIJO' },
  { id: 'CARNE SECA', label: 'CARNE SECA', fullCategory: 'TAPIOCA RENDA — CARNE SECA' },
  { id: 'BANANA DA TERRA', label: 'BANANA DA TERRA', fullCategory: 'TAPIOCA RENDA — BANANA DA TERRA' },
  { id: 'CALABRESA', label: 'CALABRESA', fullCategory: 'TAPIOCA RENDA — CALABRESA' },
  { id: 'FITNESS', label: 'FITNESS', fullCategory: 'TAPIOCA RENDA — FITNESS' },
  { id: 'DOCES', label: 'DOCES', fullCategory: 'TAPIOCAS DOCES' },
];

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  onSelectItem,
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>('TUDO');
  const [selectedTapiocaSub, setSelectedTapiocaSub] = useState<TapiocaSubCategory>('TODAS');

  const sourceItems = items || MENU_ITEMS;

  // Filter products strictly based on active navigation tabs
  const filteredItems = useMemo(() => {
    if (selectedMainCategory === 'TUDO') {
      return sourceItems;
    }

    if (selectedMainCategory === 'CUSCUZ') {
      return sourceItems.filter((item) => item.category === 'CUSCUZ');
    }

    if (selectedMainCategory === 'CAFÉ') {
      return sourceItems.filter((item) => item.category === 'CAFÉ');
    }

    if (selectedMainCategory === 'BEBIDAS') {
      return sourceItems.filter((item) => item.category === 'BEBIDAS');
    }

    if (selectedMainCategory === 'TAPIOCAS') {
      if (selectedTapiocaSub === 'TODAS') {
        return sourceItems.filter(
          (item) => item.category.startsWith('TAPIOCA')
        );
      }

      const subMatch = TAPIOCA_SUBCATEGORIES.find((s) => s.id === selectedTapiocaSub);
      if (subMatch && subMatch.fullCategory) {
        return sourceItems.filter((item) => item.category === subMatch.fullCategory);
      }
    }

    return sourceItems;
  }, [sourceItems, selectedMainCategory, selectedTapiocaSub]);

  const handleSelectMain = (cat: MainCategory) => {
    setSelectedMainCategory(cat);
    if (cat === 'TAPIOCAS') {
      setSelectedTapiocaSub('TODAS');
    }
  };

  return (
    <section id="cardapio" className="relative w-full bg-[#F7F4EF] text-[#2C3E35] py-16 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        
        {/* Cabeçalho Editorial */}
        <div className="mb-10 sm:mb-14 pb-6 border-b border-[#E8E1D7]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70] block mb-2">
                Cardápio da Casa &bull; Sabor da Roça
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-medium text-[#2C3E35] leading-tight">
                Da roça para a sua mesa.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#2C3E35]/75 mt-2 max-w-xl font-normal">
                Cuscuz ao vapor, tapiocas rendadas crocantes e cafés frescos feitos na hora com ingredientes selecionados.
              </p>
            </div>

            {/* Total de Itens encontrados */}
            <div className="text-right hidden sm:block">
              <span className="font-sans text-xs uppercase tracking-[0.08em] text-[#2C3E35]/60 font-medium">
                {filteredItems.length} {filteredItems.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>
          </div>

          {/* Navegação 1: Topo do Cardápio */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-[#E8E1D7]/60">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x [webkit-overflow-scrolling:touch]">
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = selectedMainCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`filter-tab-${cat.id.toLowerCase()}`}
                    type="button"
                    onClick={() => handleSelectMain(cat.id)}
                    className={`whitespace-nowrap text-xs uppercase tracking-[0.08em] font-medium py-2 px-3.5 transition-colors border-b-2 shrink-0 min-h-[40px] flex items-center cursor-pointer ${
                      isActive
                        ? 'text-[#2C3E35] border-[#2C3E35]'
                        : 'text-[#2C3E35]/60 border-transparent hover:text-[#2C3E35] hover:border-[#2C3E35]/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegação 2: Sub-categorias de TAPIOCAS */}
          {selectedMainCategory === 'TAPIOCAS' && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E8E1D7]/40">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block mb-2">
                Recheios &bull; Selecione a variação
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x [webkit-overflow-scrolling:touch]">
                {TAPIOCA_SUBCATEGORIES.map((sub) => {
                  const isSubActive = selectedTapiocaSub === sub.id;
                  return (
                    <button
                      key={sub.id}
                      id={`subfilter-${sub.id.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => setSelectedTapiocaSub(sub.id)}
                      className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] font-medium py-1.5 px-3 transition-colors shrink-0 border min-h-[36px] flex items-center cursor-pointer ${
                        isSubActive
                          ? 'bg-[#2C3E35] text-white border-[#2C3E35]'
                          : 'bg-[#F0EAE1] text-[#2C3E35]/80 border-[#E5DDCF] hover:border-[#2C3E35]/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Catálogo Editorial de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-10 lg:gap-x-12 gap-y-10 sm:gap-y-14">
          {filteredItems.map((item, idx) => {
            // Variação rítmica sutil na proporção visual da imagem
            const imageAspectClass =
              idx % 3 === 0
                ? 'aspect-[4/3.2]'
                : idx % 3 === 1
                ? 'aspect-[4/3]'
                : 'aspect-[4/3.3]';

            return (
              <article
                key={item.id}
                id={`card-produto-${item.id}`}
                onClick={() => onSelectItem(item)}
                className="group flex flex-col cursor-pointer bg-transparent active:scale-[0.99] transition-transform duration-150"
              >
                {/* Fotografia Gastronômica ou Placeholder Editorial via ProductImage */}
                <ProductImage
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  aspectRatio={imageAspectClass}
                  category={item.category}
                  containerClassName="mb-3.5 sm:mb-4 border border-[#E8E1D7]"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  placeholderLabel="Fotografia em preparo"
                >
                  {/* Categoria do Produto em Etiqueta Discreta */}
                  <span className="absolute bottom-2.5 left-2.5 bg-[#2C3E35]/90 backdrop-blur-xs text-white text-[9.5px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 pointer-events-none">
                    {item.category.replace('TAPIOCA RENDA — ', '')}
                  </span>
                </ProductImage>

                {/* Informações do Produto */}
                <div className="flex flex-col flex-1">
                  {/* Nome do Produto */}
                  <h3 className="font-serif text-lg font-medium text-[#2C3E35] leading-snug group-hover:text-[#6B8B70] transition-colors mb-1.5">
                    {item.name}
                  </h3>

                  {/* Descrição Oficial */}
                  {item.description ? (
                    <p className="font-sans text-xs sm:text-[13px] text-[#2C3E35]/75 font-normal leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  ) : (
                    <div className="mb-4" />
                  )}

                  {/* Preço e Botão PEDIR */}
                  <div className="mt-auto pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-3">
                    <div>
                      <span className="font-sans text-base sm:text-lg font-semibold text-[#2C3E35]">
                        {item.price}
                      </span>
                    </div>

                    {/* Botão PEDIR */}
                    <a
                      id={`btn-pedir-${item.id}`}
                      href={item.ifoodUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-[0.08em] font-medium text-white bg-[#2C3E35] hover:bg-[#6B8B70] active:scale-[0.98] transition-colors text-center"
                      aria-label={`Pedir ${item.name} no iFood`}
                    >
                      <span>Pedir</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};
