import { useEffect, useRef, useState } from 'react';

export type TooltipPlacement = 'top' | 'bottom';
export type TooltipAlignX = 'center' | 'left' | 'right';

interface UseMarketplaceTableTooltipPositionResult {
  placement: TooltipPlacement;
  alignX: TooltipAlignX;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook especializado para posicionamento de tooltips na tabela marketplace.
 * Detecta especificamente os limites da tabela (.marketplace-table) em vez da div com overflow.
 * Ajusta o alinhamento vertical (placement) e horizontal (alignX) do tooltip com base na posição da tabela.
 */
export function useMarketplaceTableTooltipPosition(): UseMarketplaceTableTooltipPositionResult {
  const [placement, setPlacement] = useState<TooltipPlacement>('bottom');
  const [alignX, setAlignX] = useState<TooltipAlignX>('center');
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updatePlacement() {
      if (!triggerRef.current || !tooltipRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Procura especificamente pela tabela marketplace
      let marketplaceTable: HTMLElement | null = null;
      let parent = triggerRef.current.parentElement;
      
      while (parent) {
        if (parent.classList.contains('marketplace-table')) {
          marketplaceTable = parent;
          break;
        }
        parent = parent.parentElement;
      }
      
      // Se não encontrar a tabela marketplace, usa os limites da viewport como fallback
      let containerBottom = window.innerHeight;
      let containerTop = 0;
      let containerLeft = 0;
      let containerRight = window.innerWidth;
      
      if (marketplaceTable) {
        const tableRect = marketplaceTable.getBoundingClientRect();
        containerBottom = tableRect.bottom;
        containerTop = tableRect.top;
        containerLeft = tableRect.left;
        containerRight = tableRect.right;
      }
      
      // Espaço abaixo/acima do trigger
      const spaceBelow = containerBottom - triggerRect.bottom;
      const spaceAbove = triggerRect.top - containerTop;
      
      // Espaço à esquerda/direita do trigger
      const tooltipWidth = tooltipRect.width;
      const triggerCenter = (triggerRect.left + triggerRect.right) / 2;
      const leftEdge = triggerCenter - tooltipWidth / 2;
      const rightEdge = triggerCenter + tooltipWidth / 2;
      
      // Ajuste vertical baseado no espaço disponível na tabela
      if (spaceBelow < tooltipRect.height + 8 && spaceAbove > tooltipRect.height + 8) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
      
      // Ajuste horizontal baseado nos limites da tabela e largura da tela
      const screenWidth = window.innerWidth;
      const isSmallScreen = screenWidth < 570;
      
      if (isSmallScreen) {
        // Em telas pequenas, priorizar não ultrapassar os limites da viewport
        const viewportLeftEdge = triggerCenter - tooltipWidth / 2;
        const viewportRightEdge = triggerCenter + tooltipWidth / 2;
        const viewportPadding = 16; // 16px de margem da viewport
        
        if (viewportLeftEdge < viewportPadding) {
          setAlignX('left');
        } else if (viewportRightEdge > screenWidth - viewportPadding) {
          setAlignX('right');
        } else {
          setAlignX('center');
        }
      } else {
        // Em telas maiores, usar a lógica baseada na tabela
        if (leftEdge < containerLeft + 8 && rightEdge > containerRight - 8) {
          setAlignX('center'); // Não cabe nem à esquerda nem à direita, centraliza o máximo possível
        } else if (leftEdge < containerLeft + 8) {
          setAlignX('left'); // Encosta à esquerda da tabela
        } else if (rightEdge > containerRight - 8) {
          setAlignX('right'); // Encosta à direita da tabela
        } else {
          setAlignX('center'); // Centralizado
        }
      }
    }

    updatePlacement();
    
    // Adiciona listeners para atualizar posição quando necessário
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    
    // Observa mudanças na tabela (ex: scroll horizontal)
    if (triggerRef.current) {
      let parent = triggerRef.current.parentElement;
      while (parent) {
        if (parent.classList.contains('marketplace-table') || 
            getComputedStyle(parent).overflowX === 'auto' || 
            getComputedStyle(parent).overflowX === 'scroll') {
          parent.addEventListener('scroll', updatePlacement);
          break;
        }
        parent = parent.parentElement;
      }
    }
    
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
      
      // Remove listener do scroll da tabela se existir
      if (triggerRef.current) {
        let parent = triggerRef.current.parentElement;
        while (parent) {
          if (parent.classList.contains('marketplace-table') || 
              getComputedStyle(parent).overflowX === 'auto' || 
              getComputedStyle(parent).overflowX === 'scroll') {
            parent.removeEventListener('scroll', updatePlacement);
            break;
          }
          parent = parent.parentElement;
        }
      }
    };
  }, []);

  return { placement, alignX, triggerRef, tooltipRef };
}
