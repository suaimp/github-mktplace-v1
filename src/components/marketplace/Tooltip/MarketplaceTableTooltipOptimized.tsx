import React, { ReactNode, useState, useRef } from "react";
import { useMarketplaceTooltip } from "./hooks/useMarketplaceTooltip";

interface MarketplaceTableTooltipOptimizedProps {
  text: ReactNode;
  className?: string;
  children?: ReactNode;
  tableLoaded?: boolean;
  entriesCount?: number;
}

const MarketplaceTableTooltipOptimized: React.FC<MarketplaceTableTooltipOptimizedProps> = ({ 
  text, 
  className = "", 
  children,
  tableLoaded,
  entriesCount
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { placement, alignX, triggerRef, tooltipRef } = useMarketplaceTooltip({
    tableLoaded,
    entriesCount
  });

  const handleMouseEnter = () => {
    // Cancela qualquer timeout de esconder
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Primeiro renderiza o tooltip, depois o torna visível
    setShouldRender(true);
    // Pequeno delay para garantir que o elemento foi renderizado antes de calcular posição
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  };

  const handleMouseLeave = () => {
    // Primeiro esconde o tooltip
    setIsVisible(false);
    
    // Remove do DOM após a transição (300ms)
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  let alignClass = '';
  if (alignX === 'left') {
    alignClass = 'left-0 -translate-x-0';
  } else if (alignX === 'right') {
    alignClass = 'right-0 translate-x-0';
  } else {
    alignClass = 'left-1/2 -translate-x-1/2';
  }
  
  // Em telas pequenas, garantir que o tooltip não ultrapasse os limites da viewport
  const responsiveClasses = 'max-[570px]:left-[16px] max-[570px]:right-[16px] max-[570px]:translate-x-0 max-[570px]:w-auto';

  return (
    <div 
      className={`relative ${className}`} 
      ref={triggerRef as any}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children || (
        <svg
          className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      
      {/* Só renderiza o tooltip quando necessário */}
      {shouldRender && (
        <div
          ref={tooltipRef as any}
          className={`absolute ${alignClass} ${responsiveClasses} w-auto max-w-[200px] px-3 py-2 bg-gray-900 text-white !text-white text-[13px] rounded-lg transition-opacity duration-300 pointer-events-none z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            color: '#fff', 
            minWidth: '92px',
            maxWidth: 'min(200px, calc(100vw - 32px))',
            wordWrap: 'break-word',
            whiteSpace: 'normal'
          }}
        >
          <span className="block" style={{ color: '#fff' }}>{text}</span>
          {placement === 'top' ? (
            <div className={`absolute top-full ${alignX === 'center' ? 'left-1/2 -translate-x-1/2' : alignX === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent border-t-gray-900`}></div>
          ) : (
            <div className={`absolute bottom-full ${alignX === 'center' ? 'left-1/2 -translate-x-1/2' : alignX === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent border-b-gray-900`}></div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketplaceTableTooltipOptimized;
