import { useState, useEffect } from 'react';

/**
 * Hook para detectar se está em dispositivo móvel
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar no carregamento inicial
    checkIsMobile();

    // Adicionar listener para mudanças no tamanho da tela
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
