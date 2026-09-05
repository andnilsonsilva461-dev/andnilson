import React from 'react';
import { useSitePhotos } from '../hooks/useSitePhotos';

interface EditorialOpeningProps {
  onExploreMenu?: () => void;
}

export const EditorialOpening: React.FC<EditorialOpeningProps> = ({ onExploreMenu }) => {
  const sitePhotos = useSitePhotos();
  const openingImage = sitePhotos.editorial_opening || '/images/tapioca_recheada_1788311286058.jpg';
  return (
    <section className="relative w-full bg-[#F7F4EF] text-[#2C3E35] overflow-visible py-16 sm:py-20 md:py-28 border-b border-[#E8E1D7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Composição assimétrica editorial (Revista de Gastronomia) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Lado Esquerdo: Tipografia e Textos Editoriais (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-8 z-10">
            {/* Etiqueta Superior Editorial */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <span className="w-5 h-[1px] bg-[#6B8B70]" />
              <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70]">
                Sabor da Roça &bull; Tapioca &amp; Café
              </p>
            </div>

            {/* Título de Abertura (elegante, peso médio, proporção de revista) */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-medium text-[#2C3E35] leading-[1.14] mb-4 sm:mb-5">
              Tem gosto <br className="hidden sm:inline" />
              <span className="italic font-normal">de casa.</span>
            </h2>

            {/* Frase / Subtítulo */}
            <p className="font-sans text-base sm:text-lg text-[#2C3E35]/80 font-normal leading-relaxed max-w-lg mb-7">
              Tapioca feita na hora, cuscuz quentinho, café e aquele bolo que combina com a prosa.
            </p>

            {/* Micro detalhe de localização e convite discreto */}
            <div className="flex items-center gap-6 pt-5 border-t border-[#E8E1D7]">
              <div>
                <span className="block font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium">
                  Localização
                </span>
                <span className="font-serif text-sm text-[#2C3E35] font-normal">
                  Shopping Avenida &bull; Feira de Santana
                </span>
              </div>

              {onExploreMenu && (
                <button
                  onClick={onExploreMenu}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] hover:text-[#6B8B70] transition-colors border-b border-[#2C3E35]/40 hover:border-[#6B8B70] pb-0.5 cursor-pointer"
                >
                  <span>Conhecer o cardápio</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </div>
          </div>

          {/* Lado Direito: Fotografia Gastronômica Grande e Real (5 colunas) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Foto sem card, sem sombra pesada, sem borda arredondada exagerada */}
            <div className="relative overflow-hidden group">
              <img
                src={openingImage}
                alt="Tapioca recheada na chapa com carne de sol e queijo coalho do Sabor da Roça"
                className="w-full h-[360px] sm:h-[440px] lg:h-[500px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="eager"
              />
              
              {/* Legenda editorial discreta na base */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-5 text-white flex justify-between items-end">
                <span className="font-serif text-sm tracking-wide">
                  Tapioca de Carne de Sol &amp; Queijo Coalho
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/80">
                  Feita na hora
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
