import React from 'react';
import { Plus, Check, Star, Sparkles, MessageCircle, UtensilsCrossed } from 'lucide-react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { FEATURED_FAVORITE } from '../data/contentData';
import { getWhatsAppUrl, IFOOD_URL } from '../config/store';
import { ProductImage } from './ProductImage';

interface FeaturedProductProps {
  onAddToCart?: (item: MenuItem) => void;
  onOpenDetails?: (item: MenuItem) => void;
}

export const FeaturedProduct: React.FC<FeaturedProductProps> = ({ onAddToCart, onOpenDetails }) => {
  const featuredItem = MENU_ITEMS.find((i) => i.id === 'tapioca-carne-sol-coalho') || MENU_ITEMS[0];
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(featuredItem);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <section id="destaque" className="py-16 md:py-24 bg-[#EFE8DE] text-[#2B1E16] border-t border-[#E6DED5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F8F5F0] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#E6DED5] shadow-xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Image with badges */}
            <div className="lg:col-span-6 relative">
              <ProductImage
                src={featuredItem.imageUrl || featuredItem.image}
                alt={featuredItem.name}
                aspectRatio="aspect-4/3"
                containerClassName="rounded-2xl shadow-xl bg-white border border-[#E6DED5]"
              >
                <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67C52] text-white shadow-md flex items-center gap-1.5 z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                  {FEATURED_FAVORITE.badge}
                </span>
              </ProductImage>
            </div>

            {/* Right Column: Descriptions, Price, Ordering buttons */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#A67C52]">
                  {FEATURED_FAVORITE.rating} ({FEATURED_FAVORITE.reviewsCount})
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2B1E16] mb-2 leading-tight">
                {FEATURED_FAVORITE.name}
              </h2>

              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#A67C52] mb-4">
                {FEATURED_FAVORITE.subtitle}
              </p>

              <p className="text-sm sm:text-base text-[#2B1E16]/80 font-normal leading-relaxed mb-6">
                {FEATURED_FAVORITE.description}
              </p>

              {/* Price and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E6DED5]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A67C52] font-bold block">
                    Preço Especial
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-extrabold text-[#2B1E16]">
                      {FEATURED_FAVORITE.price}
                    </span>
                    <span className="text-sm text-[#2B1E16]/40 line-through">
                      {FEATURED_FAVORITE.originalPrice}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAdd}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all shadow-md ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#A67C52] hover:bg-[#8A5D3B] text-white'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Adicionado!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Adicionar à Sacola</span>
                      </>
                    )}
                  </button>

                  <a
                    href={IFOOD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-full text-xs uppercase tracking-wider font-bold bg-[#EA1D2C] hover:bg-[#D01624] text-white shadow-md transition-all"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="hidden sm:inline">Pedir no iFood</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};



