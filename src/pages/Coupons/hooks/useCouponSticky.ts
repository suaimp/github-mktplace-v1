
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseCouponStickyOptions {
  offsetTop?: number;
  onlyOnDesktop?: boolean;
}

export function useCouponSticky({ offsetTop = 20, onlyOnDesktop = true }: UseCouponStickyOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [elementStyles, setElementStyles] = useState<React.CSSProperties>({});
  const [placeholderStyles, setPlaceholderStyles] = useState<React.CSSProperties>({});
  const originalRect = useRef<{ top: number; left: number; width: number; height: number } | null>(null);
  const originalWidth = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    if (!elementRef.current) return;
    if (onlyOnDesktop && window.innerWidth < 768) {
      setIsFixed(false);
      setElementStyles({});
      setPlaceholderStyles({ display: 'none' });
      originalRect.current = null;
      originalWidth.current = null;
      return;
    }
    const element = elementRef.current;
    if (!originalRect.current && !isFixed) {
      const rect = element.getBoundingClientRect();
      originalRect.current = {
        top: rect.top + window.scrollY,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      originalWidth.current = rect.width;
    }
    if (!originalRect.current) return;
    const scrollY = window.scrollY;
    const shouldBeFixed = scrollY > originalRect.current.top - offsetTop;
    if (shouldBeFixed && !isFixed) {
      const currentRect = element.getBoundingClientRect();
      setIsFixed(true);
      setElementStyles({
        position: 'fixed',
        top: offsetTop,
        left: currentRect.left,
        width: originalWidth.current || currentRect.width,
        zIndex: 10,
      });
      setPlaceholderStyles({
        height: originalRect.current.height,
        width: '100%',
        display: 'block',
      });
    } else if (!shouldBeFixed && isFixed) {
      setIsFixed(false);
      setElementStyles({});
      setPlaceholderStyles({ display: 'none' });
      originalRect.current = null;
      originalWidth.current = null;
    }
  }, [isFixed, offsetTop, onlyOnDesktop]);

  const handleResize = useCallback(() => {
    originalRect.current = null;
    setIsFixed(false);
    setElementStyles({});
    setPlaceholderStyles({ display: 'none' });
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