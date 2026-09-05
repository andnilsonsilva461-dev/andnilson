import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { STORE_CONFIG, getWhatsAppUrl } from '../config/store';
import { getStoreOpenStatus } from '../utils/statusUtils';
import { useSitePhotos } from '../hooks/useSitePhotos';

export const LocationSection: React.FC = () => {
  const sitePhotos = useSitePhotos();
  const locationPhoto = sitePhotos.location || '/images/sabor_roca_video_frame.jpg';
  const [status, setStatus] = useState(getStoreOpenStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getStoreOpenStatus());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="localizacao" className="py-16 sm:py-20 md:py-24 bg-[#F7F4EF] text-[#2C3E35] border-t border-[#E8E1D7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Cabeçalho Editorial */}
        <div className="max-w-2xl mb-12">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-[#6B8B70] block mb-2">
            Onde Fica
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[38px] font-medium text-[#2C3E35] leading-tight">
            Shopping Avenida &bull; Feira de Santana
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#2C3E35]/80 mt-2 font-normal leading-relaxed">
            Venha tomar um café passado e saborear uma tapioca feita na hora.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Coluna Esquerda: Informações Diretas e Horários */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Status Aberto / Fechado sutil */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border border-[#E8E1D7] bg-[#F0EAE1]/80 text-xs font-normal">
              <span
                className={`w-2 h-2 rounded-full ${
                  status.isOpen ? 'bg-[#6B8B70]' : 'bg-[#A67C52]'
                }`}
              />
              <span className="font-sans text-[#2C3E35] font-medium">{status.statusText}</span>
              <span className="font-sans text-[#2C3E35]/65 font-normal">({status.nextScheduleText})</span>
            </div>

            {/* Endereço em bloco editorial limpo */}
            <div className="p-6 bg-[#F0EAE1]/80 border border-[#E3D9CC]">
              <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block mb-1">
                Endereço
              </span>
              <p className="font-serif text-xl font-medium text-[#2C3E35]">
                {STORE_CONFIG.address.street}, {STORE_CONFIG.address.number}
              </p>
              <p className="font-sans text-sm text-[#2C3E35]/80 mt-1 font-normal">
                {STORE_CONFIG.address.neighborhood} &bull; {STORE_CONFIG.address.city} &bull; {STORE_CONFIG.address.state}
              </p>
              <p className="font-sans text-xs text-[#2C3E35]/65 mt-0.5 font-normal">
                Praça de Alimentação do Shopping Avenida
              </p>

              <div className="mt-4 pt-4 border-t border-[#E3D9CC]/70 flex flex-wrap gap-4">
                <a
                  href={STORE_CONFIG.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] hover:text-[#6B8B70] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#6B8B70]" />
                  <span>Abrir no Google Maps &rarr;</span>
                </a>
              </div>
            </div>

            {/* Horários */}
            <div className="p-6 bg-[#F0EAE1]/80 border border-[#E3D9CC]">
              <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block mb-3">
                Horários de Atendimento
              </span>
              <div className="space-y-2 text-xs sm:text-sm text-[#2C3E35]/85 font-sans">
                <div className="flex justify-between py-1 border-b border-[#E3D9CC]/50">
                  <span className="font-normal">Segunda a Sábado</span>
                  <span className="font-medium text-[#2C3E35]">{STORE_CONFIG.hours.weekdays}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-normal">Domingo e Feriados</span>
                  <span className="font-medium text-[#2C3E35]">{STORE_CONFIG.hours.sunday}</span>
                </div>
              </div>
            </div>

            {/* Ações diretas */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={getWhatsAppUrl('Olá! Gostaria de saber mais informações sobre o cardápio e horário do Sabor da Roça no Shopping Avenida.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3E35] hover:bg-[#1F2C25] text-white text-xs uppercase tracking-[0.08em] font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Falar no WhatsApp</span>
              </a>

              <a
                href={STORE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.08em] font-medium text-[#2C3E35] hover:text-[#6B8B70] border-b border-[#2C3E35]/40 hover:border-[#6B8B70] pb-0.5 transition-colors"
              >
                @sabordaroca_avenida
              </a>
            </div>

          </div>

          {/* Coluna Direita: Mapa / Imagem Real do Local */}
          <div className="lg:col-span-6 relative">
            <div className="overflow-hidden border border-[#E8E1D7] group relative">
              <img
                src={locationPhoto}
                alt="Balcão e letreiro iluminado do Sabor Da Roça no Shopping Avenida"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="p-4 bg-[#F0EAE1] border-t border-[#E3D9CC] flex items-center justify-between">
                <div>
                  <span className="font-serif text-sm font-medium text-[#2C3E35] block">
                    Balcão Sabor Da Roça
                  </span>
                  <span className="font-sans text-[11px] text-[#2C3E35]/70 font-normal">
                    Shopping Avenida &bull; Piso Praça de Alimentação
                  </span>
                </div>
                <a
                  href={STORE_CONFIG.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.08em] font-medium text-[#6B8B70] hover:text-[#2C3E35] transition-colors"
                >
                  Como chegar &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
