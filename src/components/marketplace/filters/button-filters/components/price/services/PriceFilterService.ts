import { PriceRangeItem, PriceFilterCriteria, PriceSite } from '../types/PriceFilterTypes';

/**
 * Service for price filtering logic
 * Handles price ranges, calculations, and filtering
 */
export class PriceFilterService {
  
  /**
   * Predefined price intervals for filtering
   * Based on common price ranges in R$ (Brazilian Real)
   */
  private static readonly PRICE_INTERVALS: PriceRangeItem[] = [
    {
      id: 'price_5000_plus',
      label: 'R$ 5.000+',
      min: 5000,
      max: null
    },
    {
      id: 'price_1000_5000',
      label: 'R$ 1.000 - R$ 5.000',
      min: 1000,
      max: 5000
    },
    {
      id: 'price_500_1000',
      label: 'R$ 500 - R$ 1.000',
      min: 500,
      max: 1000
    },
    {
      id: 'price_200_500',
      label: 'R$ 200 - R$ 500',
      min: 200,
      max: 500
    },
    {
      id: 'price_100_200',
      label: 'R$ 100 - R$ 200',
      min: 100,
      max: 200
    },
    {
      id: 'price_50_100',
      label: 'R$ 50 - R$ 100',
      min: 50,
      max: 100
    },
    {
      id: 'price_0_50',
      label: 'R$ 1 - R$ 50',
      min: 1,
      max: 50
    },
  ];

  /**
   * Get all predefined price intervals
   */
  public static getPriceIntervals(): PriceRangeItem[] {
    return this.PRICE_INTERVALS;
  }

  /**
   * Parse Brazilian currency string to number
   * Handles formats like "R$ 1.234,56", "R$ 99,99", "1234.56", etc.
   * FIXED: Now correctly handles Brazilian number format
   */
  public static parseBrazilianCurrency(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remove currency symbols and spaces
      let cleanValue = value.replace(/R\$/g, '').replace(/\s/g, '');
      
      // Check if it's in Brazilian format (1.234,56) or American format (1234.56)
      const hasBothCommaAndDot = cleanValue.includes(',') && cleanValue.includes('.');
      const hasOnlyComma = cleanValue.includes(',') && !cleanValue.includes('.');
      const hasOnlyDot = !cleanValue.includes(',') && cleanValue.includes('.');
      
      if (hasBothCommaAndDot) {
        // Brazilian format: 1.234,56 -> 1234.56
        cleanValue = cleanValue.replace(/\./g, '').replace(/,/g, '.');
      } else if (hasOnlyComma) {
        // Only comma, treat as decimal separator: 99,99 -> 99.99
        cleanValue = cleanValue.replace(/,/g, '.');
      } else if (hasOnlyDot) {
        // Only dot - determine if it's thousands separator or decimal
        const dotIndex = cleanValue.lastIndexOf('.');
        const afterDot = cleanValue.substring(dotIndex + 1);
        
        if (afterDot.length === 3 && !afterDot.includes(',')) {
          // Likely thousands separator: 1.234 -> 1234
          cleanValue = cleanValue.replace(/\./g, '');
        }
        // If afterDot.length <= 2, treat as decimal (1234.56)
      }
      
      const numericValue = parseFloat(cleanValue);
      console.log('🔢 [Price Filter] parseBrazilianCurrency:', {
        original: value,
        cleaned: cleanValue,
        result: numericValue
      });
      return isNaN(numericValue) ? 0 : numericValue;
    }
    
    return 0;
  }

  /**
   * Detect price field from available fields
   */
  public static detectPriceField(fields: any[]): any | null {
    if (!fields || fields.length === 0) return null;

    // Look for field with field_type 'product'
    const productField = fields.find(f => f.field_type === 'product');
    if (productField) return productField;

    // Fallback: look for fields with 'preço', 'price', 'valor' in label
    const priceField = fields.find(f => {
      const label = f.label?.toLowerCase() || '';
      return label.includes('preço') || label.includes('price') || label.includes('valor');
    });

    return priceField;
  }

  /**
   * Extract price value from entry data
   * Uses same logic as MarketplaceValueFormatter for consistency
   */
  public static extractPriceValue(entry: PriceSite, priceField: any): number {
    if (!priceField || !entry.values) {
      return 0;
    }

    try {
      const rawValue = entry.values[priceField.id];
      
      if (!rawValue) {
        return 0;
      }

      // If it's a product field, use the same logic as MarketplaceValueFormatter
      if (priceField.field_type === 'product') {
        try {
          const productData = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
          
          console.log('🛍️ [Price Filter] Product data:', {
            entryId: entry.id,
            rawValue: typeof rawValue === 'string' ? rawValue.substring(0, 200) + '...' : rawValue,
            productData: {
              promotional_price: productData.promotional_price,
              price: productData.price
            }
          });
          
          // First check if there's a valid promotional_price
          let priceToUse: number | null = null;
          
          if (productData.promotional_price) {
            const promotionalPrice = this.parseBrazilianCurrency(productData.promotional_price);
            if (!isNaN(promotionalPrice) && promotionalPrice > 0) {
              priceToUse = promotionalPrice;
              console.log('✅ Using promotional_price:', promotionalPrice);
            }
          }
          
          // If no valid promotional_price, use regular price
          if (priceToUse === null && productData.price) {
            const regularPrice = this.parseBrazilianCurrency(productData.price);
            if (!isNaN(regularPrice)) {
              priceToUse = regularPrice;
              console.log('✅ Using regular price:', regularPrice);
            }
          }
          
          return priceToUse || 0;
        } catch (parseError) {
          console.log('❌ JSON parse error, trying direct parseFloat:', parseError);
          // If parsing fails, try our Brazilian currency parser
          const directPrice = this.parseBrazilianCurrency(rawValue);
          return directPrice;
        }
      }

      // For other field types, try our Brazilian currency parser
      const directPrice = this.parseBrazilianCurrency(rawValue);
      console.log('🔢 [Price Filter] Non-product field:', {
        rawValue,
        directPrice
      });
      return directPrice;
    } catch (error) {
      console.warn('[Price Filter] Error extracting price value:', error);
      return 0;
    }
  }

  /**
   * Count sites in each price interval
   */
  public static countSitesInIntervals(entries: PriceSite[], fields: any[]): Record<string, number> {
    console.log('🔍 [Price Filter] Starting countSitesInIntervals');
    console.log('🔍 [Price Filter] Entries count:', entries.length);
    console.log('🔍 [Price Filter] Fields:', fields.map(f => ({ 
      id: f.id, 
      label: f.label, 
      field_type: f.field_type 
    })));

    const counts: Record<string, number> = {};
    const intervals = this.getPriceIntervals();
    
    // Initialize counters
    intervals.forEach(interval => {
      counts[interval.id] = 0;
    });

    // Detect price field
    const priceField = this.detectPriceField(fields);
    console.log('🔍 [Price Filter] Detected price field:', priceField);
    
    if (!priceField) {
      console.log('❌ [Price Filter] No price field detected!');
      return counts;
    }

    // Sample first few entries for debugging
    console.log('🔍 [Price Filter] Sampling first 3 entries:');
    entries.slice(0, 3).forEach((entry, index) => {
      console.log(`🔍 [Price Filter] Entry ${index + 1}:`, {
        entryId: entry.id,
        allValues: entry.values,
        priceFieldValue: entry.values?.[priceField.id]
      });
    });

    // Count sites in each interval
    let validPriceCount = 0;
    entries.forEach((entry, index) => {
      const priceValue = this.extractPriceValue(entry, priceField);
      
      if (priceValue > 0) {
        validPriceCount++;
        
        if (validPriceCount <= 10) {
          console.log(`💰 [Price Filter] Valid price ${validPriceCount}:`, {
            entryId: entry.id,
            priceValue,
            rawValue: entry.values?.[priceField.id]
          });
        }
        
        const interval = intervals.find(int => {
          if (int.max === null) {
            // For the highest interval (5000+)
            return priceValue >= int.min;
          }
          return priceValue >= int.min && priceValue <= int.max;
        });
        
        if (interval) {
          counts[interval.id]++;
          
          if (validPriceCount <= 5) {
            console.log(`✅ [Price Filter] Matched interval:`, {
              priceValue,
              intervalId: interval.id,
              intervalLabel: interval.label,
              intervalRange: `${interval.min} - ${interval.max || '∞'}`
            });
          }
        }
      } else if (index < 10) {
        console.log(`❌ [Price Filter] Invalid price:`, {
          entryId: entry.id,
          priceValue,
          rawValue: entry.values?.[priceField.id]
        });
      }
    });

    console.log('🔍 [Price Filter] Summary:');
    console.log('📊 Valid prices found:', validPriceCount);
    console.log('📊 Final counts:', counts);
    console.log('📊 Total counted:', Object.values(counts).reduce((a, b) => a + b, 0));

    return counts;
  }

  /**
   * Check if a price value falls within a specific interval
   */
  private static isValueInInterval(value: number, interval: PriceRangeItem): boolean {
    const meetsMinimum = value >= interval.min;
    const meetsMaximum = interval.max === null || value <= interval.max;
    return meetsMinimum && meetsMaximum;
  }

  /**
   * Classify a price value into its corresponding interval
   */
  public static classifyPriceValue(priceValue: number): PriceRangeItem | null {
    if (priceValue <= 0) return null;

    for (const interval of this.PRICE_INTERVALS) {
      if (this.isValueInInterval(priceValue, interval)) {
        return interval;
      }
    }

    return null;
  }

  /**
   * Filter sites based on price criteria
   */
  public static filterSites(sites: PriceSite[], criteria: PriceFilterCriteria, fields: any[]): PriceSite[] {
    if (!criteria.selectedIntervals.length && !criteria.customRange) {
      return sites;
    }

    const priceField = this.detectPriceField(fields);
    if (!priceField) {
      return sites;
    }

    return sites.filter(site => {
      const priceValue = this.extractPriceValue(site, priceField);
      
      // If site has no price data, exclude it
      if (priceValue <= 0) {
        return false;
      }

      // Check against selected intervals
      if (criteria.selectedIntervals.length > 0) {
        const matchesInterval = criteria.selectedIntervals.some(intervalId => {
          const interval = this.PRICE_INTERVALS.find(i => i.id === intervalId);
          return interval && this.isValueInInterval(priceValue, interval);
        });

        if (matchesInterval) {
          return true;
        }
      }

      // Check against custom range
      if (criteria.customRange) {
        const { min, max } = criteria.customRange;
        const minCheck = min === null || priceValue >= min;
        const maxCheck = max === null || priceValue <= max;
        return minCheck && maxCheck;
      }

      return false;
    });
  }

  /**
   * Format price value for display
   */
  public static formatPriceValue(value: number): string {
    if (value === 0) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Validate price range values
   */
  public static validatePriceRange(min: number | null, max: number | null): {
    isValid: boolean;
    error?: string;
  } {
    if (min !== null && min < 0) {
      return { isValid: false, error: 'Valor mínimo não pode ser negativo' };
    }

    if (max !== null && max < 0) {
      return { isValid: false, error: 'Valor máximo não pode ser negativo' };
    }

    if (min !== null && max !== null && min > max) {
      return { isValid: false, error: 'Valor mínimo não pode ser maior que o máximo' };
    }

    return { isValid: true };
  }
}
