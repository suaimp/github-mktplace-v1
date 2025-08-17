import React, { ReactNode } from "react";
import { useTooltip } from "./hooks/useTooltip";

interface MarketplaceTooltipProps {
  text: ReactNode;
  className?: string;
  children?: ReactNode;
}

const MarketplaceTooltip: React.FC<MarketplaceTooltipProps> = ({ text, className = "", children }) => {
  const { placement, alignX, triggerRef, tooltipRef } = useTooltip();

  let alignClass = '';
  if (alignX === 'left') {
    alignClass = 'left-0 -translate-x-0';
  } else if (alignX === 'right') {
    alignClass = 'right-0 translate-x-0';
  } else {
    alignClass = 'left-1/2 -translate-x-1/2';
  }

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
        className={`absolute ${alignClass} w-auto max-w-[200px] px-3 py-2 bg-gray-900 text-white !text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
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
    </div>
  );
};

export default MarketplaceTooltip;
