import React from 'react';
import { Instagram, MessageCircle, ArrowUp, Lock } from 'lucide-react';
import { STORE_CONFIG, getWhatsAppUrl, IFOOD_URL } from '../config/store';
import { useSitePhotos } from '../hooks/useSitePhotos';

interface FooterProps {
  onOpenAdmin?: () => void;
  onNavigateTo?: (view: 'home' | 'menu', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateTo }) => {
  const sitePhotos = useSitePhotos();
  const logoUrl = sitePhotos.logo || '/images/sabor_da_roca_logo_1788311269974.jpg';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (view: 'home' | 'menu', sectionId?: string, e?: React.MouseEvent) => {
    if (onNavigateTo) {
      if (e) e.preventDefault();
      onNavigateTo(view, sectionId);
    }
  };

  return (
    <footer className="bg-[#1A241F] text-[#F7F4EF] pt-16 pb-12 border-t border-[#2C3E35]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Marca e Descrição */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                <img
                  src={logoUrl}
                  alt="Sabor Da Roça"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-medium tracking-normal text-white block">
                  Sabor da Roça
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-[#6B8B70] font-medium block">
                  Tapioca &amp; Café &bull; Shopping Avenida
                </span>
              </div>
            </div>

            <p className="font-sans text-xs text-[#F7F4EF]/75 font-normal max-w-sm leading-relaxed">
              O verdadeiro sabor da roça em cada detalhe. Tapiocas na chapa, cuscuz quentinho no vapor, cafés passados e bolos do dia em Feira de Santana.
            </p>

            <p className="font-sans text-xs text-[#F7F4EF]/60 font-normal">
              {STORE_CONFIG.address.street}, {STORE_CONFIG.address.number} &bull; {STORE_CONFIG.address.neighborhood} &bull; Feira de Santana - BA
            </p>
          </div>

          {/* Links de Navegação */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.08em] font-medium text-[#6B8B70] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2 font-sans text-xs text-[#F7F4EF]/80 font-normal">
              <li>
                <a
                  href="#inicio"
                  onClick={(e) => handleNav('home', 'inicio', e)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#cardapio"
                  onClick={(e) => handleNav('menu', undefined, e)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cardápio da Casa
                </a>
              </li>
              <li>
                <a
                  href="#espaco"
                  onClick={(e) => handleNav('home', 'espaco', e)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  O Espaço
                </a>
              </li>
              <li>
                <a
                  href="#localizacao"
                  onClick={(e) => handleNav('home', 'localizacao', e)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Onde Fica &bull; Shopping Avenida
                </a>
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.08em] font-medium text-[#6B8B70] mb-4">
              Horários
            </h4>
            <ul className="space-y-2 font-sans text-xs text-[#F7F4EF]/75 font-normal">
              <li className="flex justify-between pb-1 border-b border-white/5">
                <span>Segunda a Sábado:</span>
                <span className="font-medium text-white">{STORE_CONFIG.hours.weekdays}</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo e Feriados:</span>
                <span className="font-medium text-white">{STORE_CONFIG.hours.sunday}</span>
              </li>
            </ul>
          </div>

          {/* Redes & Contato */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.08em] font-medium text-[#6B8B70] mb-4">
              Conexão
            </h4>
            
            <div className="flex items-center gap-3">
              <a
                href={STORE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#6B8B70] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram @sabordaroca_avenida"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp Sabor Da Roça"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <a
                href={IFOOD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs uppercase tracking-[0.08em] font-medium text-[#F7F4EF]/80 hover:text-white border-b border-white/30 hover:border-white pb-0.5 transition-colors"
              >
                Pedir pelo iFood &rarr;
              </a>
            </div>
          </div>

        </div>

        {/* Linha Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F4EF]/55 font-sans font-normal">
          <p>© {new Date().getFullYear()} Sabor da Roça &bull; Shopping Avenida, Feira de Santana - BA.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (onOpenAdmin) {
                  onOpenAdmin();
                } else {
                  window.location.hash = '#admin';
                }
              }}
              className="inline-flex items-center gap-1.5 text-[#F7F4EF]/50 hover:text-[#85B08C] transition-colors focus:outline-none"
              title="Gerenciador de fotos do cardápio"
            >
              <Lock className="w-3 h-3 text-[#6B8B70]" />
              <span>Acesso Lojista (Painel)</span>
            </button>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
