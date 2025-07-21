import { useEffect, useRef, useState } from 'react';

export type TooltipPlacement = 'top' | 'bottom';
export type TooltipAlignX = 'center' | 'left' | 'right';

interface UseTooltipPositionResult {
  placement: TooltipPlacement;
  alignX: TooltipAlignX;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook para posicionamento inteligente de tooltips.
 * Detecta se há espaço suficiente abaixo/acima e à esquerda/direita do trigger (ícone) dentro do container com overflow/scroll.
 * Ajusta o alinhamento vertical (placement) e horizontal (alignX) do tooltip.
 */
export function useTooltipPosition(): UseTooltipPositionResult {
  const [placement, setPlacement] = useState<TooltipPlacement>('bottom');
  const [alignX, setAlignX] = useState<TooltipAlignX>('center');
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updatePlacement() {
      if (!triggerRef.current || !tooltipRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      // Container com scroll (pode ser body ou outro)
      let scrollContainer: HTMLElement | Window = window;
      let parent = triggerRef.current.parentElement;
      while (parent) {
        const overflowY = getComputedStyle(parent).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }
      let containerBottom = window.innerHeight;
      let containerTop = 0;
      let containerLeft = 0;
      let containerRight = window.innerWidth;
      if (scrollContainer instanceof HTMLElement) {
        const containerRect = scrollContainer.getBoundingClientRect();
        containerBottom = containerRect.bottom;
        containerTop = containerRect.top;
        containerLeft = containerRect.left;
        containerRight = containerRect.right;
      }
      // Espaço abaixo/acima do trigger
      const spaceBelow = containerBottom - triggerRect.bottom;
      const spaceAbove = triggerRect.top - containerTop;
      // Espaço à esquerda/direita do trigger
      const tooltipWidth = tooltipRect.width;
      const triggerCenter = (triggerRect.left + triggerRect.right) / 2;
      const leftEdge = triggerCenter - tooltipWidth / 2;
      const rightEdge = triggerCenter + tooltipWidth / 2;
      // Ajuste vertical
      if (spaceBelow < tooltipRect.height + 8 && spaceAbove > tooltipRect.height + 8) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
      // Ajuste horizontal
      if (leftEdge < containerLeft + 8 && rightEdge > containerRight - 8) {
        setAlignX('center'); // Não cabe nem à esquerda nem à direita, centraliza o máximo possível
      } else if (leftEdge < containerLeft + 8) {
        setAlignX('left'); // Encosta à esquerda
      } else if (rightEdge > containerRight - 8) {
        setAlignX('right'); // Encosta à direita
      } else {
        setAlignX('center'); // Centralizado
      }
    }
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, []);

  return { placement, alignX, triggerRef, tooltipRef };
} 