import { useEffect } from 'react';
import { useTooltipPositioning } from './useTooltipPositioning';
import { useTooltipVisibility } from './useTooltipVisibility';

interface UseTooltipResult {
  placement: 'top' | 'bottom';
  alignX: 'center' | 'left' | 'right';
  isVisible: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  updatePosition: () => void;
}

export function useTooltip(): UseTooltipResult {
  const positioning = useTooltipPositioning();
  const visibility = useTooltipVisibility();

  // Executar posicionamento inicial e quando tooltip fica visível
  useEffect(() => {
    if (visibility.isVisible) {
      // Pequeno delay para garantir que o tooltip foi renderizado
      const timeoutId = setTimeout(() => {
        positioning.updatePosition();
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [visibility.isVisible, positioning.updatePosition]);

  // Executar posicionamento inicial após montagem (fallback)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      positioning.updatePosition();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [positioning.updatePosition]);

  return {
    placement: positioning.placement,
    alignX: positioning.alignX,
    isVisible: visibility.isVisible,
    triggerRef: positioning.triggerRef,
    tooltipRef: positioning.tooltipRef,
    updatePosition: positioning.updatePosition
  };
}
