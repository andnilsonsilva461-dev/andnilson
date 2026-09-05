/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { EditorialOpening } from './components/EditorialOpening';
import { HomeMostOrdered } from './components/HomeMostOrdered';
import { DedicatedMenuPage } from './components/DedicatedMenuPage';
import { SpaceExperience } from './components/SpaceExperience';
import { InstagramSection } from './components/InstagramSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { MenuItem, CartItem } from './types';
import { MENU_ITEMS } from './data/menuData';
import { getCustomImages } from './utils/imageStorage';
import {
  getCachedMenuCustomizations,
  fetchServerMenuCustomizations,
} from './utils/menuCustomizationStorage';
import { getActiveHeroVideo, DEFAULT_HERO_VIDEO_URL } from './utils/heroVideoStorage';
import { fetchServerSitePhotos } from './utils/sitePhotosStorage';

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return (
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true')
    );
  });

  const [currentView, setCurrentView] = useState<'home' | 'menu'>(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hash === '#cardapio' ||
        window.location.hash === '#cardapio-completo' ||
        window.location.search.includes('view=cardapio'))
    ) {
      return 'menu';
    }
    return 'home';
  });

  const [heroVideoSrc, setHeroVideoSrc] = useState<string>(DEFAULT_HERO_VIDEO_URL);

  useEffect(() => {
    // Initial fetch from server
    const checkVideo = () => {
      getActiveHeroVideo().then((config) => {
        if (config?.src) {
          setHeroVideoSrc((prev) => (prev !== config.src ? config.src : prev));
        }
      });
    };

    checkVideo();
    fetchServerSitePhotos().catch(() => {});

    // Listen for real-time in-app updates
    const handleCustomSync = (e: any) => {
      if (e.detail?.src) {
        setHeroVideoSrc(e.detail.src);
      }
    };
    window.addEventListener('sabor-hero-video-synced', handleCustomSync);

    // Listen for storage events across browser windows/tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sabor_hero_video_sync_timestamp' || e.key === 'sabor_da_roca_cached_hero_video') {
        checkVideo();
      }
    };
    window.addEventListener('storage', handleStorage);

    // When user returns to tab (e.g., unlocking mobile phone), re-check server
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVideo();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic heartbeat sync so mobile and PC stay 100% in sync without manual refresh
    const interval = setInterval(checkVideo, 12000);

    return () => {
      window.removeEventListener('sabor-hero-video-synced', handleCustomSync);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const customImages = getCustomImages();
    const customizations = getCachedMenuCustomizations();
    return MENU_ITEMS.map((item) => {
      const customImg =
        customizations[item.id]?.imageUrl ??
        customizations[item.id]?.image ??
        customImages[item.id];
      const customName = customizations[item.id]?.name;
      const finalImg = customImg !== undefined ? customImg : (item.imageUrl || item.image);
      return {
        ...item,
        name: customName || item.name,
        image: finalImg,
        imageUrl: finalImg,
      };
    });
  });

  // Keep menuItems strictly synchronized with custom images and names from Admin Panel
  useEffect(() => {
    const syncMenu = (customs?: Record<string, any>) => {
      const customizations = customs || getCachedMenuCustomizations();
      const customImages = getCustomImages();
      setMenuItems((prev) =>
        MENU_ITEMS.map((item) => {
          const customImg =
            customizations[item.id]?.imageUrl ??
            customizations[item.id]?.image ??
            customImages[item.id];
          const customName = customizations[item.id]?.name;
          const finalImg = customImg !== undefined ? customImg : (item.imageUrl || item.image);
          return {
            ...item,
            name: customName || item.name,
            image: finalImg,
            imageUrl: finalImg,
          };
        })
      );
    };

    fetchServerMenuCustomizations().then((serverData) => {
      if (serverData && Object.keys(serverData).length > 0) {
        syncMenu(serverData);
      }
    });

    const handleCustomizationUpdate = (e: any) => {
      syncMenu(e.detail);
    };
    window.addEventListener('sabor-menu-customized', handleCustomizationUpdate);

    const handleStorageUpdate = (e: StorageEvent) => {
      if (
        e.key === 'sabor_da_roca_menu_customizations' ||
        e.key === 'sabor_da_roca_custom_images'
      ) {
        syncMenu();
      }
    };
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('sabor-menu-customized', handleCustomizationUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isCartPulsing, setIsCartPulsing] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    id: number;
    itemName: string;
    itemPrice: string;
  } | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sabor_da_roca_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen for hash changes to navigate in and out of #admin and #cardapio
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
        if (hash === '#cardapio' || hash === '#cardapio-completo') {
          setCurrentView('menu');
        } else if (hash === '#inicio' || hash === '' || hash === '#mais-pedidos') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save cart in local storage
  useEffect(() => {
    try {
      localStorage.setItem('sabor_da_roca_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, curr) => acc + (curr.item.rawPrice || 0) * curr.quantity,
    0
  );

  const handleUpdateItemImage = (itemId: string, newImageUrl: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, image: newImageUrl, imageUrl: newImageUrl } : item))
    );
    setSelectedProduct((prev) => (prev?.id === itemId ? { ...prev, image: newImageUrl, imageUrl: newImageUrl } : prev));
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, item: { ...ci.item, image: newImageUrl, imageUrl: newImageUrl } } : ci
      )
    );
  };

  const handleUpdateProduct = (
    itemId: string,
    updates: { name?: string; image?: string; imageUrl?: string }
  ) => {
    const chosenImage = updates.imageUrl !== undefined ? updates.imageUrl : updates.image;
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            ...(updates.name ? { name: updates.name } : {}),
            ...(chosenImage !== undefined ? { image: chosenImage, imageUrl: chosenImage } : {}),
          };
        }
        return item;
      })
    );
    setSelectedProduct((prev) => {
      if (prev?.id === itemId) {
        return {
          ...prev,
          ...(updates.name ? { name: updates.name } : {}),
          ...(chosenImage !== undefined ? { image: chosenImage, imageUrl: chosenImage } : {}),
        };
      }
      return prev;
    });
    setCartItems((prev) =>
      prev.map((ci) => {
        if (ci.item.id === itemId) {
          return {
            ...ci,
            item: {
              ...ci.item,
              ...(updates.name ? { name: updates.name } : {}),
              ...(chosenImage !== undefined ? { image: chosenImage, imageUrl: chosenImage } : {}),
            },
          };
        }
        return ci;
      })
    );
  };

  const handleResetProduct = (itemId: string) => {
    const original = MENU_ITEMS.find((m) => m.id === itemId);
    if (!original) return;
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...original } : item))
    );
    setSelectedProduct((prev) => (prev?.id === itemId ? { ...original } : prev));
    setCartItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, item: { ...original } } : ci))
    );
  };

  const handleRemoveItemImage = (itemId: string) => {
    const original = MENU_ITEMS.find((m) => m.id === itemId);
    const resetImage = original ? (original.imageUrl || original.image || '') : '';
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, image: resetImage, imageUrl: resetImage } : item))
    );
    setSelectedProduct((prev) => (prev?.id === itemId ? { ...prev, image: resetImage, imageUrl: resetImage } : prev));
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, item: { ...ci.item, image: resetImage, imageUrl: resetImage } } : ci
      )
    );
  };

  const handleAddToCart = (item: MenuItem, openDrawer: boolean = false) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });

    // Animação sutil de pulsação na sacola (ícone de carrinho)
    setIsCartPulsing(true);
    setTimeout(() => setIsCartPulsing(false), 900);

    // Disparar evento para componentes ouvintes
    try {
      window.dispatchEvent(new CustomEvent('sabor-cart-pulse', { detail: item }));
    } catch {}

    // Notificação rápida e elegante de confirmação
    const notifId = Date.now();
    setToastNotification({
      id: notifId,
      itemName: item.name,
      itemPrice: item.price,
    });
    setTimeout(() => {
      setToastNotification((curr) => (curr?.id === notifId ? null : curr));
    }, 3200);

    if (openDrawer) {
      setIsBasketOpen(true);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === id) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenFullMenu = () => {
    setCurrentView('menu');
    window.location.hash = '#cardapio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnHome = () => {
    setCurrentView('home');
    window.location.hash = '#inicio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: 'home' | 'menu', sectionId?: string) => {
    if (view === 'menu') {
      handleOpenFullMenu();
    } else {
      setCurrentView('home');
      if (sectionId && sectionId !== 'inicio') {
        window.location.hash = `#${sectionId}`;
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 80);
      } else {
        window.location.hash = '#inicio';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Dedicated Admin Screen (Fora do site)
  if (isAdminView) {
    return (
      <AdminPanel
        menuItems={menuItems}
        onUpdateItemImage={handleUpdateItemImage}
        onRemoveItemImage={handleRemoveItemImage}
        onUpdateProduct={handleUpdateProduct}
        onResetProduct={handleResetProduct}
        currentHeroVideo={heroVideoSrc}
        onUpdateHeroVideo={(newSrc) => setHeroVideoSrc(newSrc)}
        onReturnToStore={() => {
          setIsAdminView(false);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#F7F4EF] text-[#2C3E35] font-sans antialiased selection:bg-[#6B8B70] selection:text-white ${totalCartCount > 0 ? 'pb-16 sm:pb-0' : ''}`}>
      {/* 01 — Topo / Navegação */}
      <Header
        onOpenBasket={() => setIsBasketOpen(true)}
        cartCount={totalCartCount}
        currentView={currentView}
        onNavigate={handleNavigate}
        isCartPulsing={isCartPulsing}
      />

      <main>
        {currentView === 'home' ? (
          <>
            {/* 02 — Hero Section com Vídeo Oficial */}
            <Hero
              videoSrc={heroVideoSrc}
              onExploreMenu={handleOpenFullMenu}
              onOpenBasket={() => setIsBasketOpen(true)}
            />

            {/* 03 — Abertura Editorial */}
            <EditorialOpening
              onExploreMenu={handleOpenFullMenu}
            />

            {/* 04 — OS MAIS PEDIDOS (Apenas 4 a 6 produtos) + Botão VER CARDÁPIO COMPLETO */}
            <HomeMostOrdered
              items={menuItems}
              onSelectItem={(item) => setSelectedProduct(item)}
              onAddToCart={handleAddToCart}
              onViewFullMenu={handleOpenFullMenu}
            />

            {/* 05 — O Espaço */}
            <SpaceExperience />

            {/* 06 — Instagram da Roça */}
            <InstagramSection />

            {/* 08 — Horários & Localização */}
            <LocationSection />
          </>
        ) : (
          /* PÁGINA DEDICADA DO CARDÁPIO COMPLETO */
          <DedicatedMenuPage
            items={menuItems}
            onSelectItem={(item) => setSelectedProduct(item)}
            onAddToCart={handleAddToCart}
            onReturnHome={handleReturnHome}
          />
        )}
      </main>

      {/* 09 — Rodapé com links sincronizados e acesso administrativo discreto */}
      <Footer
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
        onNavigateTo={handleNavigate}
      />

      {/* WhatsApp Flutuante */}
      <FloatingWhatsApp hasBottomBar={totalCartCount > 0} />

      {/* BARRA INFERIOR FIXA NO MOBILE — MOSTRA APENAS SE HOUVER >= 1 PRODUTO */}
      <AnimatePresence>
        {totalCartCount > 0 && !isBasketOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2C3E35] text-[#F7F4EF] border-t border-[#3D5449] shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
          >
            <button
              type="button"
              id="mobile-fixed-bottom-cart-bar"
              onClick={() => setIsBasketOpen(true)}
              className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer min-h-[52px] active:bg-[#22312A] transition-colors"
              aria-label={`Abrir sacola com ${totalCartCount} ${totalCartCount === 1 ? 'item' : 'itens'}, total de R$ ${cartSubtotal.toFixed(2).replace('.', ',')}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none" role="img" aria-label="Sacola">🛍</span>
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-serif text-sm font-semibold tracking-wider text-white uppercase">
                    SACOLA
                  </span>
                  <span className="text-[#A3D9A5] text-xs font-mono font-medium">
                    &bull; {totalCartCount} {totalCartCount === 1 ? 'ITEM' : 'ITENS'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-mono text-sm font-semibold text-white">
                  R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] bg-[#6B8B70] text-white px-2.5 py-1">
                  Ver Sacola &rarr;
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÃO FLUTUANTE DISCRETO NO DESKTOP — CANTO INFERIOR DIREITO QUANDO HOUVER >= 1 PRODUTO */}
      <AnimatePresence>
        {totalCartCount > 0 && !isBasketOpen && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex fixed bottom-6 right-20 z-40 items-center"
          >
            <button
              type="button"
              id="desktop-floating-cart-button"
              onClick={() => setIsBasketOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[#2C3E35] text-[#F7F4EF] hover:bg-[#1E2C25] active:scale-98 border border-white/20 shadow-xl transition-all cursor-pointer group"
              aria-label={`Abrir sacola com ${totalCartCount} itens`}
            >
              <span className="text-sm" role="img" aria-label="Sacola">🛍</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-serif font-medium tracking-wide uppercase">SACOLA</span>
                <span className="text-[#A3D9A5] font-mono font-semibold">
                  &bull; {totalCartCount} {totalCartCount === 1 ? 'ITEM' : 'ITENS'}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-white/90 pl-1.5 border-l border-white/25">
                R$ {cartSubtotal.toFixed(2).replace('.', ',')}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sacola de Pedidos */}
      <CartDrawer
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Modal de Detalhes */}
      <ProductDetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Notificação sutil e elegante de item adicionado à sacola */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            key={toastNotification.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed bottom-16 sm:bottom-5 right-4 sm:right-6 z-50 max-w-sm bg-[#2C3E35] text-[#F7F4EF] p-3.5 shadow-2xl border border-[#6B8B70]/40 flex items-center justify-between gap-3 rounded-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#6B8B70]/25 flex items-center justify-center shrink-0 text-[#A3D9A5]">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {toastNotification.itemName}
                </p>
                <p className="text-[10px] text-[#A3D9A5] uppercase tracking-wider font-mono">
                  Adicionado à Sacola &bull; {toastNotification.itemPrice}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsBasketOpen(true);
                setToastNotification(null);
              }}
              className="shrink-0 px-3 py-1.5 bg-[#6B8B70] hover:bg-[#58735C] text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xs shadow-xs"
            >
              Ver Sacola
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


