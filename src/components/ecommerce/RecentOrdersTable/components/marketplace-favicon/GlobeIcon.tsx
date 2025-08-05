import React from 'react';

interface GlobeIconProps {
  size?: number;
  className?: string;
}

/**
 * Ícone de planeta/globo para usar como fallback quando favicons não carregam
 * Baseado no padrão usado no marketplace
 */
export const GlobeIcon: React.FC<GlobeIconProps> = ({ 
  size = 20, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="#F3F4F6"
      />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};
