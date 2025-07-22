import { useEffect, useRef, useState, useCallback } from 'react';
import { TooltipPlacement, TooltipAlignX } from '../types/tooltip.types';
import { calculateTooltipPosition } from '../utils/tooltipPositionCalculator';
import { useDOMReady } from './useDOMReady';

interface UseTooltipPositioningResult {
  placement: TooltipPlacement;
  alignX: TooltipAlignX;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  updatePosition: () => void;
}

export function useTooltipPositioning(): UseTooltipPositioningResult {
  const [placement, setPlacement] = useState<TooltipPlacement>('bottom');
  const [alignX, setAlignX] = useState<TooltipAlignX>('center');
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const position = calculateTooltipPosition(
      triggerRef.current,
      tooltipRef.current
    );
    
    setPlacement(position.placement);
    setAlignX(position.alignX);
  }, []);

  // Executar posicionamento inicial após montagem
  useDOMReady({
    onReady: updatePosition,
    delay: 0
  });

  // Executar posicionamento quando tooltip fica visível
  useEffect(() => {
    const observer = new MutationObserver(() => {
      updatePosition();
    });

    if (triggerRef.current) {
      observer.observe(triggerRef.current, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [updatePosition]);

  // Eventos de scroll e resize
  useEffect(() => {
    const handleEvents = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleEvents);
    window.addEventListener('scroll', handleEvents, true);

    // Também escutar por mudanças no scroll de containers pais
    let scrollContainer: HTMLElement | null = null;
    let parent = triggerRef.current?.parentElement;
    
    while (parent) {
      const overflowY = getComputedStyle(parent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollContainer = parent;
        parent.addEventListener('scroll', handleEvents);
        break;
      }
      parent = parent.parentElement;
    }

    return () => {
      window.removeEventListener('resize', handleEvents);
      window.removeEventListener('scroll', handleEvents, true);
      
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleEvents);
      }
    };
  }, [updatePosition]);

  return { 
    placement, 
    alignX, 
    triggerRef, 
    tooltipRef, 
    updatePosition 
  };
}
