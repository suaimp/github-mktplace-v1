import { parseNicheValue } from '../../../../../niche_rendering/services/nicheValueParser';
import type { NicheFilterItem, NicheFilterCriteria, NicheSite, ParsedNicheData } from '../types/NicheFilterTypes';
import type { NicheOption } from '../../../../../niche_rendering/types';

/**
 * Service for handling niche filter operations
 * Updated to handle database format: [{"niche": "text", "price": "R$ 159,00"}]
 */
export class NicheFilterService {
  
  /**
   * Parse niche value specifically for the database format
   */
  private static parseNicheValueCustom(value: any): NicheOption[] {
    console.log('[NicheFilterService] Parsing niche value:', value, typeof value);
    
    try {
      if (!value) {
        console.log('[NicheFilterService] Value is null/undefined');
        return [];
      }

      let parsedData: any = value;

      // Se for string, tenta fazer parse do JSON
      if (typeof value === 'string') {
        console.log('[NicheFilterService] Value is string, attempting JSON parse');
        try {
          parsedData = JSON.parse(value);
          console.log('[NicheFilterService] Successfully parsed JSON:', parsedData);
        } catch (error) {
          console.log('[NicheFilterService] Failed to parse JSON, treating as text:', error);
          return [{ text: value.trim() }];
        }
      }

      // Se for array (formato esperado: [{"niche": "text", "price": "R$ 159,00"}])
      if (Array.isArray(parsedData)) {
        console.log('[NicheFilterService] Value is array with', parsedData.length, 'items');
        const niches: NicheOption[] = [];
        
        parsedData.forEach((item, index) => {
          console.log(`[NicheFilterService] Processing array item ${index}:`, item);
          
          if (typeof item === 'object' && item !== null) {
            // Formato do banco: {"niche": "texto", "price": "R$ 159,00"}
            if (item.niche && typeof item.niche === 'string') {
              const nicheText = item.niche.trim();
              if (nicheText) {
                niches.push({ 
                  text: nicheText,
                  icon: item.icon || undefined
                });
                console.log(`[NicheFilterService] Added niche from 'niche' field: ${nicheText}`);
              }
            }
            // Formato alternativo: {"text": "texto", ...}
            else if (item.text && typeof item.text === 'string') {
              const nicheText = item.text.trim();
              if (nicheText) {
                niches.push({ 
                  text: nicheText,
                  icon: item.icon || undefined
                });
                console.log(`[NicheFilterService] Added niche from 'text' field: ${nicheText}`);
              }
            }
          }
          // Se for string simples no array
          else if (typeof item === 'string' && item.trim()) {
            const nicheText = item.trim();
            niches.push({ text: nicheText });
            console.log(`[NicheFilterService] Added niche from string: ${nicheText}`);
          }
        });
        
        console.log('[NicheFilterService] Final extracted niches from array:', niches);
        return niches;
      }

      // Se for objeto único
      if (typeof parsedData === 'object' && parsedData !== null) {
        console.log('[NicheFilterService] Value is single object:', parsedData);
        
        if (parsedData.niche && typeof parsedData.niche === 'string') {
          const nicheText = parsedData.niche.trim();
          if (nicheText) {
            console.log(`[NicheFilterService] Added niche from single object: ${nicheText}`);
            return [{ 
              text: nicheText,
              icon: parsedData.icon || undefined
            }];
          }
        }
      }

      console.log('[NicheFilterService] Could not parse value, returning empty array');
      return [];
    } catch (error) {
      console.warn('[NicheFilterService] Error parsing niche value:', error);
      return [];
    }
  }
  /**
   * Extract and count niches from marketplace entries using field metadata
   */
  public static extractNichesWithCounts(entries: NicheSite[], fields?: any[]): NicheFilterItem[] {
    console.log('[NicheFilterService] Starting extraction with entries:', entries.length);
    console.log('[NicheFilterService] Fields provided:', fields?.length || 0);
    
    if (!entries || entries.length === 0) {
      console.log('⚠️ [NicheFilterService] No entries provided');
      return [];
    }

    // ONLY work with proper field metadata - prevent picking up wrong fields
    if (!fields || fields.length === 0) {
      console.log('⚠️ [NicheFilterService] No field metadata provided - cannot extract niches safely');
      return [];
    }

    // Find niche fields using field_type (same as marketplace table)
    const nicheFields = fields.filter(field => field.field_type === 'niche');
    console.log('[NicheFilterService] Found niche fields by field_type:', nicheFields.map(f => ({id: f.id, label: f.label})));
    
    if (nicheFields.length === 0) {
      console.log('⚠️ [NicheFilterService] No niche fields found with field_type === "niche"');
      return [];
    }

    const nicheCountMap = new Map<string, { niche: NicheOption; count: number }>();

    entries.forEach((entry, index) => {
      if (index < 3) {
        console.log(`[NicheFilterService] Processing entry ${index}:`, {
          id: entry.id,
          values: entry.values ? Object.keys(entry.values) : [],
          hasValues: !!entry.values
        });
      }
      
      const parsedData = this.parseNicheFromEntryWithFields(entry, nicheFields);
      
      if (index < 3) {
        console.log(`[NicheFilterService] Parsed data for entry ${index}:`, parsedData);
      }
      
      if (parsedData.niches.length > 0) {
        parsedData.niches.forEach(niche => {
          const key = niche.text.toLowerCase();
          const existing = nicheCountMap.get(key);
          
          if (existing) {
            existing.count++;
          } else {
            nicheCountMap.set(key, {
              niche: { ...niche },
              count: 1
            });
          }
        });
      }
    });

    console.log('[NicheFilterService] Final niche map entries:', Array.from(nicheCountMap.entries()));

    // Convert map to array and sort by count (descending) then by name
    const result = Array.from(nicheCountMap.entries())
      .map(([_, data]) => ({
        id: data.niche.text.toLowerCase().replace(/\s+/g, '-'),
        label: data.niche.text,
        count: data.count,
        niche: data.niche,
        text: data.niche.text,
        isSelected: false
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.niche.text.localeCompare(b.niche.text);
      });

    console.log('[NicheFilterService] Final result:', result);
    return result;
  }

  /**
   * Parse niche data from marketplace entry using field metadata
   */
  private static parseNicheFromEntryWithFields(entry: NicheSite, nicheFields: any[]): ParsedNicheData {
    console.log('[NicheFilterService] Parsing entry with fields:', entry?.id || 'no-id', 'niche fields:', nicheFields.length);
    
    try {
      // ONLY use field metadata - no fallback to avoid picking up wrong fields
      if (nicheFields && nicheFields.length > 0 && entry.values) {
        for (const nicheField of nicheFields) {
          const fieldValue = entry.values[nicheField.id];
          if (fieldValue) {
            console.log(`[NicheFilterService] Found niche field ${nicheField.id} (${nicheField.label}) with value:`, fieldValue);
            
            // Try official parser first
            const officialResult = parseNicheValue(fieldValue);
            if (officialResult && officialResult.length > 0) {
              console.log('[NicheFilterService] Official parser worked:', officialResult);
              return { niches: officialResult, rawValue: fieldValue };
            }
            
            // Try custom parser for database format
            const customResult = this.parseNicheValueCustom(fieldValue);
            if (customResult.length > 0) {
              console.log('[NicheFilterService] Custom parser worked:', customResult);
              return { niches: customResult, rawValue: fieldValue };
            }
          }
        }
      }

      // No fallback - if no field metadata, return empty
      console.log('[NicheFilterService] No valid niche fields found or no field metadata provided');
      return { niches: [], rawValue: null };
    } catch (error) {
      console.warn('[NicheFilterService] Error parsing niche from entry with fields:', error);
      return { niches: [], rawValue: null };
    }
  }

  /**
   * Parse niche data from marketplace entry
   */
  private static parseNicheFromEntry(entry: NicheSite): ParsedNicheData {
    console.log('[NicheFilterService] Parsing entry:', entry?.id || 'no-id');
    
    try {
      // Procura em entry.values primeiro
      if (entry.values) {
        console.log('[NicheFilterService] Entry values keys:', Object.keys(entry.values));
        
        for (const [fieldId, fieldValue] of Object.entries(entry.values)) {
          console.log(`[NicheFilterService] Checking field ${fieldId}:`, typeof fieldValue, fieldValue);
          
          if (this.isNicheField(fieldId, fieldValue)) {
            console.log(`[NicheFilterService] Found niche field ${fieldId}`);
            
            // Primeiro tenta o serviço oficial
            const officialResult = parseNicheValue(fieldValue);
            if (officialResult && officialResult.length > 0) {
              console.log('[NicheFilterService] Official parser worked:', officialResult);
              return { niches: officialResult, rawValue: fieldValue };
            }
            
            // Se o oficial falhar, usa o custom para formato do banco
            const customResult = this.parseNicheValueCustom(fieldValue);
            if (customResult.length > 0) {
              console.log('[NicheFilterService] Custom parser worked:', customResult);
              return { niches: customResult, rawValue: fieldValue };
            }
          }
        }
      }

      // Fallback: propriedades diretas
      const directProps = ['niche', 'niches', 'category', 'categories'];
      for (const prop of directProps) {
        const value = (entry as any)[prop];
        if (value) {
          console.log(`[NicheFilterService] Found direct property ${prop}:`, value);
          const niches = this.parseNicheValueCustom(value);
          if (niches.length > 0) {
            return { niches, rawValue: value };
          }
        }
      }

      console.log('[NicheFilterService] No niche data found in entry');
      return { niches: [], rawValue: null };
    } catch (error) {
      console.warn('[NicheFilterService] Error parsing niche from entry:', error);
      return { niches: [], rawValue: null };
    }
  }

  /**
   * Check if a field is a niche field
   */
  private static isNicheField(fieldId: string, fieldValue: any): boolean {
    // Check if value indicates this might be niche data
    if (!fieldValue) return false;
    
    // Check field ID patterns (more comprehensive)
    const nicheFieldPatterns = [
      /niche/i,
      /categoria/i,
      /category/i,
      /segmento/i,
      /genre/i,
      /topic/i,
      /tema/i
    ];

    const fieldIdMatches = nicheFieldPatterns.some(pattern => pattern.test(fieldId));
    
    // Check if value structure looks like niche data
    let valueStructureMatches = false;
    
    try {
      if (typeof fieldValue === 'string') {
        // If it's a JSON string, try to parse it
        if (fieldValue.trim().startsWith('[') || fieldValue.trim().startsWith('{')) {
          const parsed = JSON.parse(fieldValue);
          valueStructureMatches = this.hasNicheStructure(parsed);
        } else {
          // Simple string could be a niche
          valueStructureMatches = fieldValue.trim().length > 0;
        }
      } else if (Array.isArray(fieldValue)) {
        valueStructureMatches = this.hasNicheStructure(fieldValue);
      } else if (typeof fieldValue === 'object' && fieldValue !== null) {
        valueStructureMatches = this.hasNicheStructure(fieldValue);
      }
    } catch (error) {
      console.warn('⚠️ [NicheFilterService] Error checking value structure:', error);
    }

    const result = fieldIdMatches || valueStructureMatches;
    console.log(`🔍 [NicheFilterService] Field ${fieldId} isNiche: ${result} (fieldIdMatches: ${fieldIdMatches}, valueStructureMatches: ${valueStructureMatches})`);
    
    return result;
  }

  /**
   * Check if a value has niche-like structure
   */
  private static hasNicheStructure(value: any): boolean {
    if (Array.isArray(value)) {
      return value.some(item => 
        (typeof item === 'object' && item !== null && (item.text || item.name || item.label)) ||
        (typeof item === 'string' && item.trim().length > 0)
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      return !!(value.text || value.name || value.label || value.icon || value.emoji);
    }
    
    return false;
  }

  /**
   * Create filter function for niche filtering
   */
  public static createFilterFunction(criteria: NicheFilterCriteria, fields?: any[]): (entry: NicheSite) => boolean {
    if (!criteria.selectedNiches || criteria.selectedNiches.length === 0) {
      return () => true; // No filter applied
    }

    const selectedTexts = criteria.selectedNiches.map(n => n.toLowerCase());

    // Find niche fields using field_type
    const nicheFields = fields ? fields.filter(field => field.field_type === 'niche') : [];

    return (entry: NicheSite): boolean => {
      let parsedData: ParsedNicheData;
      
      if (nicheFields.length > 0) {
        // Use field metadata approach
        parsedData = this.parseNicheFromEntryWithFields(entry, nicheFields);
      } else {
        // Fallback to original method (for backward compatibility)
        parsedData = this.parseNicheFromEntry(entry);
      }
      
      if (parsedData.niches.length === 0) {
        return false; // Entry has no niches, so it doesn't match any filter
      }

      // Check if any of the entry's niches match the selected niches
      return parsedData.niches.some(entryNiche => 
        selectedTexts.includes(entryNiche.text.toLowerCase())
      );
    };
  }

  /**
   * Filter niches by search term
   */
  public static filterNichesBySearch(niches: NicheFilterItem[], searchTerm: string): NicheFilterItem[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return niches;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return niches.filter(niche => 
      niche.text.toLowerCase().includes(lowercaseSearch)
    );
  }

  /**
   * Get active filters text for display
   */
  public static getActiveFiltersText(selectedNiches: string[]): string {
    if (!selectedNiches || selectedNiches.length === 0) {
      return '';
    }

    if (selectedNiches.length === 1) {
      return selectedNiches[0];
    }

    return `${selectedNiches.length} nichos selecionados`;
  }
}
