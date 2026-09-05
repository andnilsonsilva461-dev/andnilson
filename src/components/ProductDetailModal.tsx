import React from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, MessageCircle, Plus, UtensilsCrossed } from 'lucide-react';
import { MenuItem } from '../types';
import { getWhatsAppUrl } from '../config/store';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart?: (item: MenuItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  if (!item) return null;

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#1A241F]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#F7F4EF] max-w-2xl w-full border border-[#E3D9CC] overflow-hidden relative my-auto text-[#2C3E35] shadow-2xl max-h-[92svh] flex flex-col sm:block overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar com touch target de 44px */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-11 h-11 bg-[#F0EAE1]/90 hover:bg-[#2C3E35] hover:text-white text-[#2C3E35] flex items-center justify-center transition-colors rounded-full shadow-sm cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Foto Gastronômica ou Placeholder via ProductImage */}
          <ProductImage
            src={item.imageUrl || item.image}
            alt={item.name}
            aspectRatio=""
            containerClassName="h-[200px] xs:h-[230px] sm:h-auto sm:min-h-[280px] shrink-0"
            priority
            placeholderLabel="FOTOGRAFIA EM PREPARO"
          >
            <span className="absolute bottom-3 left-3 px-2.5 py-1 text-[9.5px] uppercase tracking-[0.08em] font-medium bg-[#2C3E35] text-white">
              {item.category}
            </span>
          </ProductImage>

          {/* Textos Editoriais e Botões de Ação */}
          <div className="p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block mb-1">
                Receita da Casa &bull; Feito na Hora
              </span>

              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#2C3E35] mb-2 leading-tight">
                {item.name}
              </h3>

              {item.description ? (
                <p className="font-sans text-xs sm:text-[13px] text-[#2C3E35]/80 font-normal leading-relaxed mb-5 line-clamp-3 sm:line-clamp-none">
                  {item.description}
                </p>
              ) : (
                <p className="font-sans text-xs sm:text-[13px] text-[#2C3E35]/60 italic font-normal mb-5">
                  Preparado artesanalmente com ingredientes frescos da roça.
                </p>
              )}
            </div>

            {/* Preço e Ações de Pedido */}
            <div className="pt-3.5 border-t border-[#E8E1D7] flex flex-col gap-2.5 sm:gap-3">
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#2C3E35]/60 font-normal">
                  Preço Oficial
                </span>
                <span className="font-sans text-xl sm:text-2xl font-semibold text-[#2C3E35]">
                  {item.price}
                </span>
              </div>

              {/* Botão PEDIR NO IFOOD direto */}
              <a
                id="modal-ifood-order-btn"
                href={item.ifoodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs uppercase tracking-[0.08em] font-medium text-white bg-[#EA1D2C] hover:bg-[#D01624] transition-colors min-h-[42px] active:scale-[0.98]"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Pedir no iFood</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              {/* Ações secundárias: Sacola ou WhatsApp */}
              <div className="grid grid-cols-2 gap-2">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(item);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] border border-[#2C3E35]/40 hover:bg-[#2C3E35] hover:text-white transition-colors min-h-[40px] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sacola</span>
                  </button>
                )}

                <a
                  id="modal-whatsapp-order-btn"
                  href={getWhatsAppUrl(`Olá! Gostaria de pedir: ${item.name} (${item.price})`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] border border-[#2C3E35]/40 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors min-h-[40px]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
