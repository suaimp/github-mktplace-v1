import { MarketplaceTab } from '../types';

interface MarketplaceTabButtonProps {
  /** Dados da tab com ícone */
  tab: MarketplaceTab;
  /** Se a tab está ativa */
  isActive: boolean;
  /** Callback de clique */
  onClick: (tabId: string) => void;
  /** Se deve exibir como modo compacto */
  compact?: boolean;
  /** Largura mínima customizada */
  minWidth?: string;
}

/**
 * Componente de botão de tab estendido com suporte a ícones
 */
export default function MarketplaceTabButton({ 
  tab, 
  isActive, 
  onClick, 
  compact = false,
  minWidth 
}: MarketplaceTabButtonProps) {
  const handleClick = () => {
    if (!tab.disabled) {
      onClick(tab.id);
    }
  };

  // Classes base do botão
  const baseClasses = [
    'inline-flex',
    'items-center',
    'gap-2', // Espaçamento entre ícone, label e badge
    'justify-center',
    'rounded-md',
    'h-full',
    'text-sm',
    'font-medium',
    'transition-colors',
    'duration-200',
    'ease-in-out',
    'whitespace-nowrap',
    'group',
    compact ? 'px-2 py-1.5' : 'px-3 py-2',
  ];

  // Definir largura mínima
  const minWidthClass = minWidth ? '' : (compact ? 'min-w-[80px]' : 'min-w-[100px]');
  if (minWidthClass) {
    baseClasses.push(minWidthClass);
  }

  // Classes condicionais baseadas no estado
  const stateClasses = tab.disabled
    ? [
        'bg-gray-100',
        'text-gray-400',
        'cursor-not-allowed',
        'dark:bg-gray-800',
        'dark:text-gray-600'
      ]
    : isActive
    ? [
        'bg-white',
        'text-gray-900',
        'shadow-theme-xs',
        'dark:bg-white/[0.03]',
        'dark:text-white'
      ]
    : [
        'bg-transparent',
        'text-gray-500',
        'hover:text-gray-700',
        'dark:text-gray-400',
        'dark:hover:text-gray-200',
        'cursor-pointer'
      ];

  const allClasses = [...baseClasses, ...stateClasses].join(' ');

  // Estilo para largura mínima customizada
  const buttonStyle = minWidth ? { minWidth } : undefined;

  return (
    <button
      className={allClasses}
      style={buttonStyle}
      onClick={handleClick}
      disabled={tab.disabled}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={tab.disabled}
    >
      {tab.icon && (
        <span className="w-4 h-4 flex-shrink-0">
          {tab.icon}
        </span>
      )}
      <span>{tab.label}</span>
      {typeof tab.count === 'number' && (
        <span 
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium leading-normal transition-colors duration-200 ${
            tab.disabled
              ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : isActive
              ? 'text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15'
              : 'bg-white dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400'
          }`}
        >
          {tab.count}
        </span>
      )}
    </button>
  );
}
