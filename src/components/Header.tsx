import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { STORE_CONFIG, IFOOD_URL } from '../config/store';
import { useSitePhotos } from '../hooks/useSitePhotos';

interface HeaderProps {
  onOpenBasket?: () => void;
  cartCount?: number;
  currentView?: 'home' | 'menu';
  onNavigate?: (view: 'home' | 'menu', sectionId?: string) => void;
  isCartPulsing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBasket,
  cartCount = 0,
  currentView = 'home',
  onNavigate,
  isCartPulsing: externalPulse = false,
}) => {
  const sitePhotos = useSitePhotos();
  const logoUrl = sitePhotos.logo || '/images/sabor_da_roca_logo_1788311269974.jpg';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pulse animation state for the sacola (cart) icon
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const prevCountRef = useRef<number>(cartCount);

  // Trigger pulse whenever cartCount increases
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 900);
      prevCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  // Also respond to external pulse prop
  useEffect(() => {
    if (externalPulse) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 900);
      return () => clearTimeout(timer);
    }
  }, [externalPulse]);

  // Listen to custom global cart pulse event
  useEffect(() => {
    const handleCartPulse = () => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 900);
    };
    window.addEventListener('sabor-cart-pulse', handleCartPulse);
    return () => window.removeEventListener('sabor-cart-pulse', handleCartPulse);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Travar o scroll do body quando o menu mobile estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Início', href: '#inicio', view: 'home' as const, sectionId: 'inicio' },
    { label: 'Cardápio', href: '#cardapio', view: 'menu' as const },
    { label: 'O Espaço', href: '#espaco', view: 'home' as const, sectionId: 'espaco' },
    { label: 'Localização', href: '#localizacao', view: 'home' as const, sectionId: 'localizacao' },
  ];

  const isSolidHeader = isScrolled || currentView === 'menu';

  const handleLinkClick = (link: typeof navLinks[0], e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(link.view, link.sectionId);
      setMobileMenuOpen(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('home', 'inicio');
    }
  };

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSolidHeader
            ? 'bg-[#F7F4EF]/95 backdrop-blur-md text-[#2B1E16] border-b border-[#E6DED5] py-2.5 sm:py-3.5 shadow-sm'
            : 'bg-transparent text-white py-3.5 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo Brand: SABOR DA ROÇA */}
            <a
              id="brand-logo-link"
              href="#inicio"
              onClick={handleLogoClick}
              className="group flex items-center gap-2 sm:gap-3 focus:outline-none min-w-0 shrink cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/40 shrink-0 shadow-xs">
                <img
                  src={logoUrl}
                  alt="Logo Sabor Da Roça"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-serif text-sm xs:text-base sm:text-lg font-medium tracking-[0.06em] transition-colors leading-tight truncate ${
                    isSolidHeader ? 'text-[#2C3E35] group-hover:text-[#6B8B70]' : 'text-white drop-shadow-xs'
                  }`}
                >
                  SABOR DA ROÇA
                </span>
                <span
                  className={`text-[8px] sm:text-[9px] uppercase tracking-[0.1em] font-normal transition-colors truncate ${
                    isSolidHeader ? 'text-[#6B8B70]' : 'text-white/80'
                  }`}
                >
                  Tapioca &amp; Café
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav" className="hidden lg:flex items-center space-x-7" aria-label="Navegação Principal">
              {navLinks.map((link) => {
                const isActive =
                  (link.view === 'menu' && currentView === 'menu') ||
                  (link.view === 'home' && currentView === 'home' && link.label === 'Início');

                return (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(link, e)}
                    className={`text-xs uppercase tracking-[0.08em] font-medium transition-all py-1 relative group cursor-pointer ${
                      isActive
                        ? isSolidHeader
                          ? 'text-[#2C3E35] font-semibold'
                          : 'text-white font-semibold'
                        : isSolidHeader
                        ? 'text-[#2C3E35]/75 hover:text-[#6B8B70]'
                        : 'text-white/85 hover:text-white drop-shadow-xs'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 transition-all duration-200 ${
                        isActive
                          ? 'w-full ' + (isSolidHeader ? 'bg-[#6B8B70]' : 'bg-white')
                          : 'w-0 group-hover:w-full ' + (isSolidHeader ? 'bg-[#6B8B70]' : 'bg-white')
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            {/* Right Action CTA: Sacola, iFood e Menu Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Basket trigger button with subtle pulse animation */}
              {onOpenBasket && (
                <motion.button
                  id="header-basket-btn"
                  type="button"
                  onClick={onOpenBasket}
                  animate={
                    isPulsing
                      ? {
                          scale: [1, 1.15, 0.94, 1.06, 1],
                          transition: { duration: 0.55, ease: 'easeOut' },
                        }
                      : { scale: 1 }
                  }
                  whileTap={{ scale: 0.95 }}
                  className={`relative inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-medium transition-all min-h-[36px] shrink-0 cursor-pointer select-none ${
                    isPulsing
                      ? 'text-[#2C3E35] bg-[#E5DDCF] ring-2 ring-[#6B8B70]/80 shadow-md'
                      : isSolidHeader
                      ? 'text-[#2C3E35] bg-[#F0EAE1] hover:bg-[#E5DDCF]'
                      : 'text-white bg-white/20 hover:bg-white/30 backdrop-blur-xs border border-white/25'
                  }`}
                  aria-label={`Abrir sacola de pedidos (${cartCount} itens)`}
                  title="Sacola de Pedidos"
                >
                  {/* Expanding soft pulse wave / ripple on item addition */}
                  {isPulsing && (
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-xs bg-[#6B8B70]/40 pointer-events-none"
                    />
                  )}

                  {/* +1 floating pop indicator */}
                  <AnimatePresence>
                    {isPulsing && (
                      <motion.span
                        key="pulse-plus-one"
                        initial={{ opacity: 0, y: 2, scale: 0.5 }}
                        animate={{ opacity: 1, y: -18, scale: 1 }}
                        exit={{ opacity: 0, y: -26, scale: 0.8 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#2C3E35] text-[#A3D9A5] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md border border-[#6B8B70]/60 whitespace-nowrap z-30 pointer-events-none"
                      >
                        +1
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* ShoppingBag icon with micro-tilt pulse */}
                  <motion.div
                    animate={
                      isPulsing
                        ? {
                            rotate: [0, -12, 12, -6, 6, 0],
                            scale: [1, 1.25, 0.95, 1.1, 1],
                          }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="flex items-center justify-center"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </motion.div>

                  <span className="hidden md:inline ml-1.5 text-[11px] uppercase tracking-[0.06em]">
                    Sacola
                  </span>

                  {cartCount > 0 && (
                    <motion.span
                      key={`badge-${cartCount}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{
                        scale: isPulsing ? [1, 1.4, 1] : 1,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.35 }}
                      className="absolute -top-1 -right-1 sm:static sm:ml-1.5 w-4 h-4 rounded-full bg-[#EA1D2C] text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>
              )}

              {/* Primary Header CTA: Pedir no iFood */}
              <a
                id="header-ifood-btn"
                href={IFOOD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 text-[10px] xs:text-[11px] uppercase tracking-[0.08em] font-medium text-white bg-[#2C3E35] hover:bg-[#1E2C25] border border-[#2C3E35] transition-all duration-150 min-h-[36px] shrink-0"
              >
                <UtensilsCrossed className="w-3 h-3 text-[#6B8B70]" />
                <span className="hidden sm:inline">Pedir no iFood</span>
                <span className="sm:hidden">iFood</span>
              </a>

              {/* Mobile menu trigger */}
              <button
                id="mobile-menu-toggle-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 rounded transition-colors focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 cursor-pointer ${
                  isSolidHeader ? 'text-[#2C3E35] hover:text-[#6B8B70]' : 'text-white hover:text-white/80'
                }`}
                aria-label="Menu de Navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu com Animação Fluida */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#2B1E16]/65 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              id="mobile-nav-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#F7F4EF] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E6DED5]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#8B5E3C] shrink-0 shadow-sm">
                      <img
                        src={logoUrl}
                        alt="Logo Sabor Da Roça"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-base font-bold tracking-wider text-[#2B1E16]">
                        SABOR DA ROÇA
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-[#8B5E3C]">Tapioca &amp; Café</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#2B1E16] hover:text-[#8B5E3C] min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5"
                    aria-label="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <nav className="py-6 space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      onClick={(e) => handleLinkClick(link, e)}
                      className="block py-3 px-2 font-serif text-lg font-semibold text-[#2B1E16] hover:text-[#6B8B70] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Mobile Footer CTAs */}
              <div className="space-y-2.5 pt-6 border-t border-[#E6DED5]">
                {onOpenBasket && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBasket();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-[#2C3E35] text-white text-xs uppercase tracking-wider font-semibold shadow-sm active:scale-[0.98] min-h-[46px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#85B08C]" />
                      <span>Ver Sacola</span>
                    </div>
                    {cartCount > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-[#EA1D2C] text-white text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/60 font-normal">Vazia</span>
                    )}
                  </button>
                )}

                <a
                  href={IFOOD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#EA1D2C] text-white text-xs uppercase tracking-wider font-bold shadow-sm active:scale-[0.98] min-h-[46px]"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Pedir no iFood</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};



