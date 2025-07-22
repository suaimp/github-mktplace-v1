import { useEffect } from 'react';
import { useTooltip } from './useTooltip';

interface UseMarketplaceTooltipOptions {
  tableLoaded?: boolean;
  entriesCount?: number;
}

export function useMarketplaceTooltip(options: UseMarketplaceTooltipOptions = {}) {
  const tooltip = useTooltip();
  const { tableLoaded = true, entriesCount = 0 } = options;

  // Executar posicionamento quando a tabela carrega completamente
  useEffect(() => {
    if (tableLoaded && entriesCount > 0) {
      // Aguardar renderização completa da tabela
      const timeoutId = setTimeout(() => {
        tooltip.updatePosition();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [tableLoaded, entriesCount, tooltip.updatePosition]);

  // Executar posicionamento após mudanças no DOM da tabela
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const hasTableChanges = mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.target instanceof HTMLElement &&
        (mutation.target.tagName === 'TBODY' || 
         mutation.target.tagName === 'THEAD' ||
         mutation.target.closest('table.marketplace-table'))
      );

      if (hasTableChanges) {
        setTimeout(() => {
          tooltip.updatePosition();
        }, 50);
      }
    });

    // Observar mudanças na tabela marketplace
    const marketplaceTable = document.querySelector('table.marketplace-table');
    if (marketplaceTable) {
      observer.observe(marketplaceTable, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [tooltip.updatePosition]);

  return tooltip;
}
