import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { INSTAGRAM_POSTS } from '../data/contentData';
import { useSitePhotos } from '../hooks/useSitePhotos';

export const InstagramSection: React.FC = () => {
  const sitePhotos = useSitePhotos();

  return (
    <section id="instagram" className="py-16 sm:py-20 bg-[#F0EAE1] text-[#2C3E35] border-t border-[#E3D9CC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E3D9CC]">
          <div>
            <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70] block mb-1">
              Instagram
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C3E35]">
              @sabordaroca_avenida
            </h2>
          </div>

          <a
            href={STORE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] hover:text-[#6B8B70] transition-colors"
          >
            <span>Acompanhe nosso dia a dia</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Grade Fotográfica de Catálogo / Revista (Sem cards pesados) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTAGRAM_POSTS.map((item, idx) => {
            const photoKey = `insta_${idx + 1}`;
            const displayImage = sitePhotos[photoKey] || item.image;

            return (
              <a
                key={item.id}
                href={STORE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-square overflow-hidden bg-[#E8E1D7] relative"
              >
                <img
                  src={displayImage}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#2C3E35]/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-end text-white">
                  <p className="font-sans text-xs font-normal line-clamp-2 leading-tight">
                    {item.caption}
                  </p>
                  <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-white/90 font-medium mt-1">
                    Ver foto &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};
