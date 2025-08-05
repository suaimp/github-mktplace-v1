import React from 'react';

interface DefaultFaviconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ícone padrão para usar quando favicon não carrega
 * Baseado no ícone exibido na marketplace table
 */
export const DefaultFavicon: React.FC<DefaultFaviconProps> = ({ 
  size = 20, 
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8 0-1.168.253-2.273.7-3.274L8.274 12.3c.7.7 1.825.7 2.525 0l2.828-2.828c.7-.7.7-1.825 0-2.525L10.053 3.374C10.673 3.132 11.336 3 12 3c4.411 0 8 3.589 8 8s-3.589 8-8 8z"
          fill="#D1D5DB"
        />
        <circle cx="12" cy="12" r="3" fill="#9CA3AF" />
      </svg>
    </div>
  );
};
