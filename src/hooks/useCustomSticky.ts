import { useEffect, useRef, useState, useCallback } from 'react';

interface UseCustomStickyOptions {
  offsetTop?: number;
  onlyOnDesktop?: boolean;
}

export function useCustomSticky({ offsetTop = 20, onlyOnDesktop = true }: UseCustomStickyOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [elementStyles, setElementStyles] = useState<React.CSSProperties>({});
  const [placeholderStyles, setPlaceholderStyles] = useState<React.CSSProperties>({});
  const originalRect = useRef<{ top: number; left: number; width: number; height: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!elementRef.current) return;

    // Skip on mobile if onlyOnDesktop is true
    if (onlyOnDesktop && window.innerWidth < 1150) {
      setIsFixed(false);
      setElementStyles({});
      setPlaceholderStyles({ display: 'none' });
      return;
    }

    const element = elementRef.current;
    
    // Capturar posição original apenas uma vez
    if (!originalRect.current && !isFixed) {
      const rect = element.getBoundingClientRect();
      
      originalRect.current = {
        top: rect.top + window.scrollY,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    }

    if (!originalRect.current) return;

    const scrollY = window.scrollY;
    const shouldBeFixed = scrollY > originalRect.current.top - offsetTop;

    if (shouldBeFixed && !isFixed) {
      // Recalcular largura no momento que fica fixed para garantir precisão
      const currentRect = element.getBoundingClientRect();
      const parentRect = element.parentElement?.getBoundingClientRect();
      
      setIsFixed(true);
      setElementStyles({
        position: 'fixed',
        top: offsetTop,
        left: currentRect.left,
        width: parentRect?.width || currentRect.width, // Usar largura do pai se disponível
        zIndex: 10,
      });
      // Placeholder para manter o espaço
      setPlaceholderStyles({
        height: originalRect.current.height,
        width: '100%', // Manter 100% da largura do container
        display: 'block',
      });
    } else if (!shouldBeFixed && isFixed) {
      setIsFixed(false);
      setElementStyles({});
      setPlaceholderStyles({ display: 'none' });
    }
  }, [isFixed, offsetTop, onlyOnDesktop]);

  const handleResize = useCallback(() => {
    // Reset no resize
    originalRect.current = null;
    setIsFixed(false);
    setElementStyles({});
    setPlaceholderStyles({ display: 'none' });
    // Reagendar para próximo frame
    requestAnimationFrame(updatePosition);
  }, [updatePosition]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial check
    requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePosition, handleResize]);

  return {
    ref: elementRef,
    placeholderRef,
    style: elementStyles,
    placeholderStyle: placeholderStyles,
    isFixed,
  };
}
