import { ReactNode } from "react";

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
  return (
    <div className={`group relative ${className}`}>
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
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white !text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50" style={{ color: '#fff' }}>
        <span style={{ color: '#fff', fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', fontFamily: 'inherit', WebkitTextFillColor: '#fff', textShadow: 'none', filter: 'none', background: 'none', boxShadow: 'none', border: 'none', outline: 'none', textDecoration: 'none', fontStyle: 'inherit', letterSpacing: 'inherit', wordBreak: 'inherit', whiteSpace: 'inherit', textAlign: 'inherit', verticalAlign: 'inherit', textTransform: 'inherit', textRendering: 'inherit', MozOsxFontSmoothing: 'inherit', WebkitFontSmoothing: 'inherit', fontVariant: 'inherit', colorScheme: 'light' }}>
          {text}
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>
  );
}
