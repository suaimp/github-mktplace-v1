import { ReactNode } from "react";
import { useMarketplaceTableTooltipPosition } from "./hooks/useMarketplaceTableTooltipPosition";

interface MarketplaceTableInfoTooltipProps {
  text: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Componente InfoTooltip especializado para a tabela marketplace.
 * Usa posicionamento baseado nos limites da tabela em vez da div com overflow.
 */
export default function MarketplaceTableInfoTooltip({
  text,
  className = "",
  children
}: MarketplaceTableInfoTooltipProps) {
  const { placement, alignX, triggerRef, tooltipRef } = useMarketplaceTableTooltipPosition();

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
    <div className={`group relative ${className}`} ref={triggerRef as any}>
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
      <div
        ref={tooltipRef as any}
        className={`absolute ${alignClass} ${responsiveClasses} w-auto max-w-[200px] px-3 py-2 bg-gray-900 text-white !text-white text-[13px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        style={{ 
          color: '#fff',
          minWidth: '92px',
          maxWidth: 'min(200px, calc(100vw - 32px))',
          wordWrap: 'break-word',
          whiteSpace: 'normal'
        }}
      >
        <span
          className="block"
          style={{ 
            color: '#fff', 
            fontSize: 'inherit', 
            fontWeight: 'inherit', 
            lineHeight: 'inherit', 
            fontFamily: 'inherit', 
            WebkitTextFillColor: '#fff', 
            textShadow: 'none', 
            filter: 'none', 
            background: 'none', 
            boxShadow: 'none', 
            border: 'none', 
            outline: 'none', 
            textDecoration: 'none', 
            fontStyle: 'inherit', 
            letterSpacing: 'inherit', 
            wordBreak: 'normal', 
            whiteSpace: 'normal', 
            textAlign: 'inherit', 
            verticalAlign: 'inherit', 
            textTransform: 'inherit', 
            textRendering: 'inherit', 
            MozOsxFontSmoothing: 'inherit', 
            WebkitFontSmoothing: 'inherit', 
            fontVariant: 'inherit', 
            colorScheme: 'light' 
          }}
        >
          {text}
        </span>
        {placement === 'top' ? (
          <div className={`absolute top-full ${alignX === 'center' ? 'left-1/2 -translate-x-1/2' : alignX === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent border-t-gray-900`}></div>
        ) : (
          <div className={`absolute bottom-full ${alignX === 'center' ? 'left-1/2 -translate-x-1/2' : alignX === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent border-b-gray-900`}></div>
        )}
      </div>
    </div>
  );
}
