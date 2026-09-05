import React from 'react';
import { ExternalLink, ArrowRight, Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { useMostOrdered } from '../hooks/useMostOrdered';
import { ProductImage } from './ProductImage';

interface HomeMostOrderedProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  onViewFullMenu: () => void;
  featuredItemIds?: string[];
}

export const HomeMostOrdered: React.FC<HomeMostOrderedProps> = ({
  items,
  onSelectItem,
  onAddToCart,
  onViewFullMenu,
  featuredItemIds: customItemIds,
}) => {
  const dynamicItemIds = useMostOrdered();
  const activeIds = customItemIds || dynamicItemIds;

  // Localiza os itens selecionados na exata ordem configurada pelo administrador
  const mostOrderedItems = activeIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as MenuItem[];

  return (
    <section
      id="mais-pedidos"
      className="relative w-full bg-[#F7F4EF] text-[#2C3E35] py-14 sm:py-20 md:py-24 border-b border-[#E8E1D7]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-4 h-[1px] bg-[#6B8B70]" />
            <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70]">
              Sabor da Roça &bull; Destaques
            </span>
            <span className="w-4 h-[1px] bg-[#6B8B70]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-[38px] font-medium text-[#2C3E35] leading-tight">
            Os Mais Pedidos
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#2C3E35]/75 mt-2 font-normal leading-relaxed">
            Uma seleção com os pratos e sabores mais amados pelos nossos clientes.
          </p>
        </div>

        {/* Grade compacta de 4 a 6 produtos selecionados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {mostOrderedItems.map((item) => {
            return (
              <article
                key={item.id}
                id={`featured-card-${item.id}`}
                onClick={() => onSelectItem(item)}
                className="group flex flex-col bg-[#F0EAE1]/40 border border-[#E8E1D7] p-4 sm:p-5 transition-all duration-200 hover:border-[#6B8B70]/50 hover:bg-[#F0EAE1] cursor-pointer"
              >
                {/* Fotografia Gastronômica via ProductImage */}
                <ProductImage
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  aspectRatio="aspect-[4/3]"
                  category={item.category}
                  containerClassName="mb-4 border border-[#E8E1D7]"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                >
                  <span className="absolute top-2.5 left-2.5 bg-[#2C3E35]/90 backdrop-blur-xs text-white text-[9.5px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 pointer-events-none">
                    {item.category.replace('TAPIOCA RENDA — ', '')}
                  </span>
                </ProductImage>

                {/* Conteúdo */}
                <div className="flex flex-col flex-1">
                  <h3 className="font-serif text-lg font-medium text-[#2C3E35] leading-snug group-hover:text-[#6B8B70] transition-colors mb-1.5">
                    {item.name}
                  </h3>

                  {item.description ? (
                    <p className="font-sans text-xs text-[#2C3E35]/70 font-normal leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  ) : (
                    <div className="mb-4" />
                  )}

                  {/* Preço e Ações de Pedido */}
                  <div className="mt-auto pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-2">
                    <span className="font-sans text-base sm:text-lg font-semibold text-[#2C3E35]">
                      {item.price}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onAddToCart && (
                        <button
                          type="button"
                          id={`btn-add-cart-home-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 border border-[#2C3E35]/40 hover:bg-[#2C3E35] hover:text-white text-[#2C3E35] text-[10.5px] uppercase tracking-[0.06em] font-medium transition-colors cursor-pointer min-h-[32px]"
                          title={`Adicionar ${item.name} à sacola`}
                          aria-label={`Adicionar ${item.name} à sacola`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Adicionar</span>
                        </button>
                      )}

                      <a
                        id={`btn-pedir-home-${item.id}`}
                        href={item.ifoodUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.06em] font-medium text-white bg-[#2C3E35] hover:bg-[#6B8B70] active:scale-[0.98] transition-colors text-center min-h-[32px]"
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

        {/* Botão Editorial Destacado: VER CARDÁPIO COMPLETO */}
        <div className="mt-12 sm:mt-16 text-center">
          <button
            id="btn-ver-cardapio-completo"
            type="button"
            onClick={onViewFullMenu}
            className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3.5 bg-[#2C3E35] hover:bg-[#1E2C25] text-white text-xs sm:text-sm uppercase tracking-[0.08em] font-medium transition-colors border border-[#2C3E35] cursor-pointer"
          >
            <span>Ver Cardápio Completo</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
          <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#2C3E35]/65 mt-3 font-normal">
            Tapiocas Salgadas &bull; Tapiocas Doces &bull; Cuscuz &bull; Cafés &bull; Bebidas
          </p>
        </div>
      </div>
    </section>
  );
};
