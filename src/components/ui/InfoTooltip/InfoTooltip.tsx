import { ReactNode, useEffect, useState } from "react";
import { useTooltipPosition } from "./useTooltipPosition";

interface InfoTooltipProps {
  text: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function InfoTooltip({
  text,
  className = "",
  children
}: InfoTooltipProps) {
  const { placement, alignX, triggerRef, tooltipRef } = useTooltipPosition();
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!triggerRef.current) return;
    // Detecta o container com scroll
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
    if (scrollContainer instanceof HTMLElement) {
      setMaxWidth(scrollContainer.clientWidth - 24); // 24px de margem de segurança
    } else {
      setMaxWidth(window.innerWidth - 24);
    }
  }, [triggerRef.current]);

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
        className={`absolute ${alignClass} w-auto px-3 py-2 bg-gray-900 text-white !text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        style={{ color: '#fff', width: 'max-content' }}
      >
        <span
          className="block"
          style={{ color: '#fff', fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', fontFamily: 'inherit', WebkitTextFillColor: '#fff', textShadow: 'none', filter: 'none', background: 'none', boxShadow: 'none', border: 'none', outline: 'none', textDecoration: 'none', fontStyle: 'inherit', letterSpacing: 'inherit', wordBreak: 'normal', whiteSpace: 'normal', textAlign: 'inherit', verticalAlign: 'inherit', textTransform: 'inherit', textRendering: 'inherit', MozOsxFontSmoothing: 'inherit', WebkitFontSmoothing: 'inherit', fontVariant: 'inherit', colorScheme: 'light' }}
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
