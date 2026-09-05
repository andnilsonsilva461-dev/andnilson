import React from 'react';
import { SPACE_IMAGES } from '../data/contentData';
import { useSitePhotos } from '../hooks/useSitePhotos';

export const SpaceExperience: React.FC = () => {
  const sitePhotos = useSitePhotos();
  const spaceMain = sitePhotos.space_main || SPACE_IMAGES.mainHero.url;
  const spaceSecondary = sitePhotos.space_secondary || '/images/cuscuz_nordestino_1788311301928.jpg';

  return (
    <section id="espaco" className="py-16 sm:py-20 md:py-24 bg-[#F7F4EF] text-[#2C3E35] border-t border-[#E8E1D7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Cabeçalho Editorial */}
        <div className="max-w-2xl mb-12">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70] block mb-2">
            O Espaço
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[38px] font-medium text-[#2C3E35] leading-tight">
            Um refúgio acolhedor no Shopping Avenida.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#2C3E35]/80 mt-2.5 font-normal leading-relaxed">
            Mesas confortáveis, atendimento atencioso e aquele aroma inconfundível de tapioca na chapa e café passado na hora.
          </p>
        </div>

        {/* Composição Editorial Fotográfica */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Fotografia Principal do Balcão / Ambiente */}
          <div className="md:col-span-7 relative overflow-hidden group">
            <img
              src={spaceMain}
              alt="Ambiente acolhedor do Sabor Da Roça no Shopping Avenida"
              className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <span className="font-sans text-xs uppercase tracking-[0.08em] font-normal">
                Shopping Avenida &bull; Feira de Santana
              </span>
            </div>
          </div>

          {/* Lado Direito: Foto de Comida e Texto Editorial */}
          <div className="md:col-span-5 flex flex-col justify-between gap-6">
            <div className="overflow-hidden relative group">
              <img
                src={spaceSecondary}
                alt="Cuscuz saindo quentinho no vapor"
                className="w-full h-[220px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>

            <div className="p-6 bg-[#F0EAE1]/80 border border-[#E3D9CC]">
              <p className="font-serif italic text-base sm:text-lg text-[#2C3E35] font-normal leading-relaxed">
                &ldquo;A pausa ideal no Shopping Avenida: para o café da manhã revigorante, um almoço regional leve ou aquele cafezinho com bolo no fim de tarde.&rdquo;
              </p>
              <span className="block font-sans text-[11px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium mt-4">
                Sabor Da Roça &bull; Feira de Santana
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
