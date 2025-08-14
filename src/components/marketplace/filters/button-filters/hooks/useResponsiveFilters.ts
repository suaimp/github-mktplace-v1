/**
 * Hook para gerenciar responsividade dos filtros do marketplace
 * Responsabilidade: Determinar quais filtros devem ser exibidos ou ocultados baseado no breakpoint
 */

import { useState, useEffect } from 'react';

interface ResponsiveFiltersState {
  showPrice: boolean;
  showTraffic: boolean;
  showDA: boolean;
  showNiche: boolean;
  showLinks: boolean;
  showCountry: boolean;
  moreFiltersOpen: boolean;
}

export const useResponsiveFilters = () => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular quais filtros devem ser exibidos baseado nos breakpoints
  const filtersState: ResponsiveFiltersState = {
    showPrice: windowWidth >= 1710,
    showTraffic: windowWidth >= 1655,
    showDA: windowWidth >= 1550,
    showNiche: windowWidth >= 1470,
    showLinks: windowWidth >= 1375,
    showCountry: windowWidth >= 925,
    moreFiltersOpen
  };

  // Determinar se deve mostrar o botão "Mais Filtros"
  const shouldShowMoreFilters = windowWidth < 1710;

  // Contar quantos filtros estão ocultos
  const hiddenFiltersCount = [
    !filtersState.showPrice,
    !filtersState.showTraffic,
    !filtersState.showDA,
    !filtersState.showNiche,
    !filtersState.showLinks,
    !filtersState.showCountry
  ].filter(Boolean).length;

  return {
    ...filtersState,
    shouldShowMoreFilters,
    hiddenFiltersCount,
    windowWidth,
    setMoreFiltersOpen
  };
};
