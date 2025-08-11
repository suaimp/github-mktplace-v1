import { PriceDisplayProps } from './types';

/**
 * Componente global para exibir preços com formatação similar ao MarketplaceTable
 * Mostra preço antigo riscado, preço promocional e porcentagem de desconto
 */
export function PriceDisplay({ 
  priceData, 
  className = '', 
  size = 'md',
  alignment = 'right'
}: PriceDisplayProps) {
  const formatCurrency = (value: string) => {
    // Se já está formatado, retorna como está
    if (value.includes('R$')) {
      return value;
    }
    
    // Senão, converte para número e formata
    const numericValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) {
      return value;
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  const calculateDiscountPercentage = (originalPrice: string, promotionalPrice: string): number => {
    try {
      
      // Função para converter formato brasileiro para formato de parsing
      const parseBrazilianCurrency = (value: string): number => {
        // Remove tudo exceto dígitos, vírgulas e pontos
        let cleaned = value.replace(/[^\d,.-]/g, '');
        
        // Se tem vírgula, trata como separador decimal brasileiro
        if (cleaned.includes(',')) {
          // Remove pontos (separadores de milhares) e substitui vírgula por ponto
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        }
        // Se não tem vírgula mas tem ponto, verifica se é decimal ou milhares
        else if (cleaned.includes('.')) {
          // Se tem mais de um ponto, ou se o último ponto tem exatamente 3 dígitos após, é separador de milhares
          const lastDotIndex = cleaned.lastIndexOf('.');
          const digitsAfterLastDot = cleaned.length - lastDotIndex - 1;
          
          if (digitsAfterLastDot === 3 || cleaned.split('.').length > 2) {
            // É separador de milhares, remove todos os pontos
            cleaned = cleaned.replace(/\./g, '');
          }
          // Senão, deixa como está (é decimal)
        }
        
        return parseFloat(cleaned);
      };
      
      const original = parseBrazilianCurrency(originalPrice);
      const promotional = parseBrazilianCurrency(promotionalPrice);
      
      if (isNaN(original) || isNaN(promotional) || original <= promotional) {
        return 0;
      }
      
      const percentage = Math.round(((original - promotional) / original) * 100);
      return percentage;
    } catch (error) {
      return 0;
    }
  };

  // Classes baseadas no tamanho
  const sizeClasses = {
    sm: {
      oldPrice: 'text-xs',
      currentPrice: 'text-sm',
      discount: 'text-xs'
    },
    md: {
      oldPrice: 'text-sm',
      currentPrice: 'text-base',
      discount: 'text-sm'
    },
    lg: {
      oldPrice: 'text-base',
      currentPrice: 'text-lg',
      discount: 'text-base'
    }
  };

  // Classes de alinhamento
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const currentSizeClasses = sizeClasses[size];
  const alignmentClass = alignmentClasses[alignment];

  // Se há promoção, mostra o layout com desconto
  if (priceData.hasPromotion && priceData.promotionalPrice) {
    const discountPercentage = calculateDiscountPercentage(priceData.price, priceData.promotionalPrice);
    
    return (
      <div className={`${alignmentClass} ${className}`}>
        {/* Preço antigo riscado */}
        <div className={`${currentSizeClasses.oldPrice} text-gray-400 line-through`}>
          {formatCurrency(priceData.price)}
        </div>
        
        {/* Preço promocional e desconto */}
        <div className="flex items-center gap-1" style={{ 
          justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'center' ? 'center' : 'flex-end' 
        }}>
          <span className={`${currentSizeClasses.currentPrice} font-semibold text-gray-900 dark:text-white`}>
            {formatCurrency(priceData.promotionalPrice)}
          </span>
          
          {discountPercentage > 0 && (
            <span className={`${currentSizeClasses.discount} font-medium text-green-600 dark:text-green-400`}>
              {discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>
    );
  }

  // Se não há promoção, mas há old_price diferente, mostra desconto baseado no old_price
  if (priceData.oldPrice && priceData.oldPrice !== priceData.price) {
    const discountPercentage = calculateDiscountPercentage(priceData.oldPrice, priceData.price);
    
    if (discountPercentage > 0) {
      return (
        <div className={`${alignmentClass} ${className}`}>
          {/* Preço antigo riscado */}
          <div className={`${currentSizeClasses.oldPrice} text-gray-400 line-through`}>
            {formatCurrency(priceData.oldPrice)}
          </div>
          
          {/* Preço atual e desconto */}
          <div className="flex items-center gap-1" style={{ 
            justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'center' ? 'center' : 'flex-end' 
          }}>
            <span className={`${currentSizeClasses.currentPrice} font-semibold text-gray-900 dark:text-white`}>
              {formatCurrency(priceData.price)}
            </span>
            
            <span className={`${currentSizeClasses.discount} font-medium text-green-600 dark:text-green-400`}>
              {discountPercentage}% OFF
            </span>
          </div>
        </div>
      );
    }
  }

  // Caso padrão: apenas o preço normal
  return (
    <div className={`${alignmentClass} ${className}`}>
      <span className={`${currentSizeClasses.currentPrice} text-gray-500 dark:text-gray-400`}>
        {formatCurrency(priceData.price)}
      </span>
    </div>
  );
}
