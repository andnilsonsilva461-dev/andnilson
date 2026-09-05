import React from 'react';
import { getWhatsAppUrl } from '../config/store';
import { useSitePhotos } from '../hooks/useSitePhotos';

interface EditorialHighlightProps {
  onAddToCart?: () => void;
  onOpenDetails?: () => void;
}

export const EditorialHighlight: React.FC<EditorialHighlightProps> = ({
  onAddToCart,
  onOpenDetails,
}) => {
  const sitePhotos = useSitePhotos();
  const highlightPhoto = sitePhotos.editorial_highlight || '/images/tapioca_recheada_1788311286058.jpg';

  const whatsappOrderUrl = getWhatsAppUrl(
    'Olá! Gostaria de pedir o Destaque da Casa: Tapioca Carne de Sol & Coalho Tostado (R$ 22,00)'
  );

  return (
    <section className="relative w-full bg-[#F0EAE1] text-[#2C3E35] overflow-hidden py-16 sm:py-20 md:py-28 border-y border-[#E3D9CC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Lado Esquerdo: Texto Editorial e Informações (6 colunas) */}
          <div className="lg:col-span-6 flex flex-col justify-center z-10">
            {/* Etiqueta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-5 h-[1.5px] bg-[#6B8B70]" />
              <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70]">
                Destaque da Casa
              </span>
            </div>

            {/* Título Grande */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-medium text-[#2C3E35] leading-tight mb-4">
              Tapioca Carne de Sol &amp; Coalho Tostado
            </h2>

            {/* Descrição Curta */}
            <p className="font-sans text-sm sm:text-base text-[#2C3E35]/80 font-normal leading-relaxed mb-6 max-w-lg">
              Massa fininha e crocante na chapa quente, recheada fartamente com carne de sol desfiada artesanal, queijo coalho dourado e um fio generoso de manteiga de garrafa da Bahia.
            </p>

            {/* Detalhe dos Ingredientes em Linha Editorial */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B8B70] font-normal mb-8">
              <span>Feita na hora</span>
              <span>&bull;</span>
              <span>Sem glúten</span>
              <span>&bull;</span>
              <span>Manteiga de garrafa pura</span>
              <span>&bull;</span>
              <span>Queijo coalho tostado</span>
            </div>

            {/* Preço & Pedido */}
            <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-4 sm:gap-8 pt-4 border-t border-[#E3D9CC]">
              <div>
                <span className="block font-sans text-[10px] uppercase tracking-[0.08em] text-[#2C3E35]/60 font-normal">
                  Preço
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-medium text-[#2C3E35]">
                  R$ 22,00
                </span>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-[#2C3E35] hover:bg-[#1F2C25] text-white text-xs uppercase tracking-[0.08em] font-medium transition-colors"
                >
                  Pedir pelo WhatsApp
                </a>

                {onAddToCart && (
                  <button
                    type="button"
                    onClick={onAddToCart}
                    className="text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] hover:text-[#6B8B70] border-b border-[#2C3E35]/30 hover:border-[#6B8B70] pb-0.5 transition-colors"
                  >
                    + Adicionar à Sacola
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Fotografia Grande do Produto que ultrapassa levemente os limites (6 colunas) */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            {/* Sem card, sem moldura, sem sombra artificial pesada */}
            <div 
              onClick={onOpenDetails}
              className="relative cursor-pointer group overflow-hidden"
            >
              <img
                src={highlightPhoto}
                alt="Destaque da Casa: Tapioca Carne de Sol & Coalho Tostado"
                className="w-full h-[380px] sm:h-[460px] lg:h-[540px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Etiqueta sutil editorial */}
              <div className="absolute top-4 right-4 bg-[#2C3E35]/85 text-white text-[10px] uppercase tracking-[0.08em] px-3 py-1 font-normal">
                Sabor da Roça
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
