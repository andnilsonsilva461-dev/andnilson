import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppUrl } from '../config/store';
import { getStoreOpenStatus } from '../utils/statusUtils';

interface FloatingWhatsAppProps {
  hasBottomBar?: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ hasBottomBar = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = getStoreOpenStatus();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed ${
        hasBottomBar ? 'bottom-[68px] sm:bottom-5' : 'bottom-5'
      } right-4 sm:right-5 z-40 flex flex-col items-end pointer-events-none transition-all duration-300`}
    >
      {/* Tooltip com transição suave de entrada e saída */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mb-2.5 p-3.5 bg-white rounded-2xl shadow-xl border border-[#E6DED5] max-w-[230px] relative text-left"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-1.5 right-1.5 p-1 text-[#2B1E16]/40 hover:text-[#2B1E16] rounded-full transition-colors cursor-pointer"
              aria-label="Fechar mensagem"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-[#A67C52] tracking-wider">
                {status.isOpen ? 'Atendimento Online' : 'Fale Conosco'}
              </span>
            </div>
            <p className="text-xs text-[#2B1E16] leading-snug font-normal">
              Dúvidas sobre o cardápio ou pedidos? Fale direto com a nossa equipe!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Flutuante Principal com suave Fade-In de Entrada */}
      <motion.a
        id="floating-whatsapp-btn"
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar conosco no WhatsApp"
        initial={{ opacity: 0, scale: 0.7, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-lg hover:shadow-2xl transition-colors duration-300"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
      </motion.a>
    </div>
  );
};

