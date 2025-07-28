import { TabButtonProps } from '../types';

/**
 * Componente de botão individual da tab
 */
export default function TabButton({ 
  tab, 
  isActive, 
  onClick, 
  compact = false,
  minWidth 
}: TabButtonProps) {
  const handleClick = () => {
    if (!tab.disabled) {
      onClick(tab.id);
    }
  };

  // Classes base do botão
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    compact ? 'px-2 py-1.5' : 'px-3 py-2',
    'text-sm',
    'font-medium',
    'transition-colors',
    'duration-200',
    'ease-in-out',
    'whitespace-nowrap'
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
      {tab.label}
    </button>
  );
}
