import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, UtensilsCrossed, Copy, Check } from 'lucide-react';
import { CartItem } from '../types';
import { IFOOD_URL, getWhatsAppUrl } from '../config/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const subtotal = items.reduce((acc, curr) => acc + (curr.item.rawPrice || 0) * curr.quantity, 0);
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const [showIfoodGuidance, setShowIfoodGuidance] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Travar o scroll da página quando a sacola estiver aberta
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowIfoodGuidance(false);
      setCopiedFeedback(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Gerar resumo textual do pedido
  const generateOrderSummaryText = () => {
    let text = `Sabor da Roça — Pedido:\n`;
    items.forEach((ci) => {
      text += `• ${ci.quantity}x ${ci.item.name} (${ci.item.price})\n`;
    });
    text += `Total: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    return text;
  };

  // Gerar mensagem formatada para WhatsApp
  const generateWhatsAppOrderText = () => {
    let text = `🥞 *PEDIDO — SABOR DA ROÇA*\n`;
    text += `📍 Shopping Avenida, Feira de Santana - BA\n\n`;
    text += `Olá! Gostaria de fazer o seguinte pedido:\n\n`;

    items.forEach((ci, idx) => {
      text += `${idx + 1}. *${ci.quantity}x ${ci.item.name}* — ${ci.item.price}\n`;
      if (ci.item.recipe) text += `   _(${ci.item.recipe})_\n`;
      if (ci.milkOption) text += `   • Observação: ${ci.milkOption}\n`;
    });

    text += `\n💰 *Total:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    text += `\nPor favor, confirmem o pedido e o tempo de preparo. Muito obrigado(a)!`;
    return text;
  };

  // Tratar ação "COMPRAR NO IFOOD" com conformidade total aos mecanismos oficiais
  const handleCheckoutIfood = () => {
    if (items.length === 0) return;

    // Se houver 1 produto e ele possuir link direto do iFood cadastrado, abre diretamente
    if (items.length === 1 && items[0].item.ifoodUrl) {
      window.open(items[0].item.ifoodUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Abre a página oficial da loja no iFood
      window.open(IFOOD_URL, '_blank', 'noopener,noreferrer');
    }

    // Exibe orientação amigável mantendo os itens preservados na sacola
    setShowIfoodGuidance(true);
  };

  const copyOrderToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateOrderSummaryText());
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2500);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2B1E16]/50 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#F7F4EF] text-[#2C3E35] shadow-2xl h-full flex flex-col z-10 border-l border-[#E3D9CC]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#E3D9CC] flex items-center justify-between bg-[#F0EAE1]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl sm:text-2xl font-medium text-[#2C3E35]">SACOLA</span>
                  <span className="font-sans text-xs bg-[#2C3E35] text-white px-2 py-0.5 font-medium">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#2C3E35]/70 mt-0.5 font-normal">
                  Sabor da Roça &bull; Shopping Avenida
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 border border-[#E3D9CC] bg-[#F7F4EF] text-[#2C3E35] hover:bg-[#2C3E35] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar sacola"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso de Orientação iFood (Preserva a sacola e orienta o cliente) */}
            {showIfoodGuidance && items.length > 0 && (
              <div className="p-3.5 bg-[#EAE2D5] border-b border-[#D5C9B8] text-xs text-[#2C3E35] space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-[#2C3E35]">
                    Loja Sabor da Roça aberta no iFood ↗
                  </span>
                  <button
                    onClick={() => setShowIfoodGuidance(false)}
                    className="text-[#2C3E35]/50 hover:text-[#2C3E35] text-xs cursor-pointer"
                    aria-label="Fechar aviso"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11.5px] text-[#2C3E35]/85 leading-relaxed font-normal">
                  Seus {totalItemsCount} {totalItemsCount === 1 ? 'produto continua' : 'produtos continuam'} salvos aqui na sacola para sua conferência durante o pedido no iFood.
                </p>
                <button
                  type="button"
                  onClick={copyOrderToClipboard}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2C3E35] underline hover:text-[#1E2C25] cursor-pointer pt-0.5"
                >
                  {copiedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Lista copiada com sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar resumo dos itens</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-[#2C3E35]/60">
                  <div className="w-14 h-14 bg-[#F0EAE1] border border-[#E3D9CC] flex items-center justify-center mx-auto mb-4 text-[#6B8B70]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-medium text-[#2C3E35] mb-1">
                    Sua sacola está vazia
                  </h4>
                  <p className="font-sans text-xs max-w-xs mx-auto mb-6 text-[#2C3E35]/70 font-normal">
                    Selecione suas tapiocas rendadas, cuscuz recheado ou cafés favoritos no cardápio!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#2C3E35] text-white text-xs font-medium uppercase tracking-[0.08em] hover:bg-[#1F2C25] transition-colors cursor-pointer min-h-[40px]"
                  >
                    Ver Cardápio Teste
                  </button>
                </div>
              ) : (
                items.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="p-3 sm:p-3.5 bg-white border border-[#E3D9CC] space-y-2.5"
                  >
                    {/* Linha superior: Nome e Remover */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-serif font-medium text-sm sm:text-base text-[#2C3E35] leading-snug">
                          {cartItem.item.name}
                        </h5>
                        {cartItem.item.recipe && (
                          <p className="font-sans text-[11px] text-[#6B8B70] italic truncate font-normal mt-0.5">
                            {cartItem.item.recipe}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(cartItem.item.id)}
                        className="text-[#2C3E35]/40 hover:text-red-700 p-1 cursor-pointer transition-colors"
                        title={`Remover ${cartItem.item.name} da sacola`}
                        aria-label={`Remover ${cartItem.item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Linha inferior: Quantidade, Preço Unitário, Subtotal e Controles */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E3D9CC]/60 text-xs">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-[#2C3E35]/70">
                          {cartItem.quantity}x {cartItem.item.price}
                        </span>
                        <span className="font-sans text-xs font-semibold text-[#2C3E35]">
                          Subtotal: R$ {(cartItem.item.rawPrice * cartItem.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Controles [-] QTD [+] */}
                      <div className="flex items-center gap-1 bg-[#F0EAE1] p-0.5 border border-[#E3D9CC]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                          className="w-6 h-6 bg-white text-[#2C3E35] hover:bg-[#2C3E35] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-semibold w-6 text-center text-[#2C3E35]">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                          className="w-6 h-6 bg-white text-[#2C3E35] hover:bg-[#2C3E35] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#E3D9CC] bg-[#F0EAE1] space-y-3">
                {/* Total */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-serif text-sm font-semibold uppercase tracking-wider text-[#2C3E35]">
                    TOTAL
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#2C3E35]">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Botão Principal: COMPRAR NO IFOOD */}
                <button
                  type="button"
                  onClick={handleCheckoutIfood}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#EA1D2C] hover:bg-[#D01624] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] transition-all cursor-pointer min-h-[44px]"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>COMPRAR NO IFOOD</span>
                </button>

                {/* Alternativa: WhatsApp */}
                <a
                  href={getWhatsAppUrl(generateWhatsAppOrderText())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-medium uppercase tracking-[0.06em] transition-colors min-h-[36px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pedir pelo WhatsApp</span>
                </a>

                {/* Ações secundárias */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={onClearCart}
                    className="text-[#2C3E35]/60 hover:text-red-700 transition cursor-pointer font-sans underline"
                  >
                    Esvaziar sacola
                  </button>
                  <button
                    onClick={onClose}
                    className="text-[#2C3E35]/80 hover:text-[#2C3E35] transition cursor-pointer font-sans"
                  >
                    Continuar escolhendo &rarr;
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
