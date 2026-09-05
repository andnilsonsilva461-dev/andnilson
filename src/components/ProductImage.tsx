import React, { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export interface ProductImageProps {
  /** URL da imagem do produto (HTTP/HTTPS ou caminho configurado) */
  src?: string | null;
  /** Texto alternativo obrigatório para acessibilidade */
  alt: string;
  /** Classes CSS para a tag img (ex: 'w-full h-full object-cover') */
  className?: string;
  /** Classes adicionais para o container wrapper */
  containerClassName?: string;
  /** Proporção da imagem para evitar Layout Shift (CLS), ex: 'aspect-[4/3]' */
  aspectRatio?: string;
  /** Categoria opcional para exibição no placeholder */
  category?: string;
  /** Se true, carrega com prioridade máxima (eager) em vez de lazy */
  priority?: boolean;
  /** Texto explicativo do placeholder quando não houver foto */
  placeholderLabel?: string;
  /** Elementos filhos opcionais sobre a imagem (como tags ou badges) */
  children?: React.ReactNode;
}

/**
 * Componente centralizado de exibição de imagens de produtos.
 *
 * Características arquiteturais:
 * 1. Consome diretamente `product.imageUrl` por URL (sem dependência de arquivos binários locais).
 * 2. Em caso de ausência de URL ou falha de carregamento (ex: deploy no Vercel),
 *    exibe um placeholder elegante com proporção fixa sem quebrar o layout.
 * 3. Aplica carregamento preguiçoso (loading="lazy"), decodificação assíncrona
 *    e previne Cumulative Layout Shift (CLS).
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  aspectRatio = 'aspect-[4/3]',
  category,
  priority = false,
  placeholderLabel = 'Foto em breve',
  children,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reseta o estado de erro caso a URL seja atualizada dinamicamente
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasValidUrl = Boolean(src && src.trim() !== '' && !hasError);

  return (
    <div
      className={`relative overflow-hidden bg-[#EFE9DF] flex items-center justify-center ${
        aspectRatio ? aspectRatio : ''
      } ${containerClassName}`}
    >
      {hasValidUrl ? (
        <img
          src={src as string}
          alt={alt || 'Foto do produto Sabor da Roça'}
          className={className}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#F2ECE3] to-[#EAE2D7] select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#6B8B70]/35 flex items-center justify-center mb-1.5 text-[#2C3E35]/70 bg-white/40 shadow-2xs">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B8B70]" strokeWidth={1.5} />
          </div>
          <span className="font-serif italic text-xs sm:text-sm text-[#2C3E35]/85 leading-tight">
            Sabor da Roça
          </span>
          <span className="font-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.14em] text-[#6B8B70] font-medium mt-1">
            {placeholderLabel}
          </span>
          {category && (
            <span className="font-sans text-[8px] uppercase tracking-[0.08em] text-[#2C3E35]/50 mt-0.5">
              {category.replace('TAPIOCA RENDA — ', '')}
            </span>
          )}
        </div>
      )}

      {/* Renderiza badges ou elementos sobrepostos */}
      {children}
    </div>
  );
};
