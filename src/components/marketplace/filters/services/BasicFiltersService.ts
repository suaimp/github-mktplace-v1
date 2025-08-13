/**
 * Basic Filters Service
 * Responsabilidade: Aplicar filtros básicos (country, links, search, etc)
 */

export interface BasicFiltersConfig {
  selectedFilters: Record<string, string[]>;
  selectedCountries: string[];
  selectedLinks: string[];
  selectedNiches: string[];
  searchTerm: string;
}

export class BasicFiltersService {
  
  public static applyCustomFilters(
    entries: any[], 
    selectedFilters: Record<string, string[]>, 
    fields: any[]
  ): any[] {
    let result = [...entries];

    if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
      console.log('🔥 [applyCustomFilters] No filters to apply');
      return result;
    }

    console.log('🔥 [applyCustomFilters] INICIO - Entries:', result.length);
    console.log('🔥 [applyCustomFilters] selectedFilters:', JSON.stringify(selectedFilters, null, 2));
    console.log('🔥 [applyCustomFilters] Available fields:', fields.map(f => ({ id: f.id, field_type: f.field_type, label: f.label })));
    
    let processedCount = 0;
    let matchedCount = 0;

    result = result.filter((entry) => {
      processedCount++;
      
      for (const [fieldId, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;

        const field = fields.find(f => f.id === fieldId);
        if (!field) continue;

        const entryValue = entry.values?.[fieldId];
        if (!entryValue) return false;

        let matchesFilter = false;

        if (field.field_type === "select" || field.field_type === "multiselect") {
          if (Array.isArray(entryValue)) {
            matchesFilter = entryValue.some(val => selectedValues.includes(val));
          } else {
            matchesFilter = selectedValues.includes(entryValue);
          }
        }

        if (!matchesFilter) {
          return false;
        }
      }

      matchedCount++;
      return true;
    });

    console.log('🔥 [applyCustomFilters] FIM - Processadas:', processedCount, 'Matched:', matchedCount, 'Result length:', result.length);
    return result;
  }

  public static applyCountryFilter(entries: any[], selectedCountries: string[], fields: any[]): any[] {
    if (selectedCountries.length === 0) return entries;

    return entries.filter((entry) => {
      const countryField = fields.find(f => f.field_type === 'country');
      if (countryField) {
        const countryValue = entry.values[countryField.id];
        
        if (countryValue && typeof countryValue === 'object') {
          const countryCodes = Object.keys(countryValue);
          return selectedCountries.some(selectedCountry => 
            countryCodes.includes(selectedCountry.toUpperCase())
          );
        }
        
        if (countryValue && typeof countryValue === 'string') {
          return selectedCountries.includes(countryValue.toUpperCase());
        }
      }
      return false;
    });
  }

  public static applyLinksFilter(entries: any[], selectedLinks: string[], fields: any[]): any[] {
    if (selectedLinks.length === 0) return entries;

    return entries.filter((entry) => {
      // Check all relevant fields for link types
      return Object.entries(entry.values).some(([fieldId, value]) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field || !value) return false;

        const fieldLabel = field.label?.toLowerCase() || '';
        const stringValue = String(value).toLowerCase();

        // Check if this field could contain link information
        const isLinkField = 
          field.field_type === "url" ||
          fieldLabel.includes('link') ||
          fieldLabel.includes('url') ||
          fieldLabel.includes('site') ||
          fieldLabel.includes('tipo') ||
          fieldLabel.includes('type');

        if (!isLinkField) return false;

        // Check if the value matches any selected link type
        return selectedLinks.some(selectedType => {
          const lowerType = selectedType.toLowerCase();
          
          // Direct match for link types like dofollow/nofollow
          if (stringValue === lowerType) return true;
          if (stringValue.includes(lowerType)) return true;
          
          // URL pattern matching for social media
          switch (lowerType) {
            case 'facebook':
              return stringValue.includes('facebook.com') || stringValue.includes('fb.com');
            case 'instagram':
              return stringValue.includes('instagram.com') || stringValue.includes('instagr.am');
            case 'youtube':
              return stringValue.includes('youtube.com') || stringValue.includes('youtu.be');
            case 'tiktok':
              return stringValue.includes('tiktok.com');
            case 'twitter':
              return stringValue.includes('twitter.com') || stringValue.includes('x.com');
            case 'linkedin':
              return stringValue.includes('linkedin.com');
            case 'pinterest':
              return stringValue.includes('pinterest.com');
            case 'whatsapp':
              return stringValue.includes('whatsapp.com') || stringValue.includes('wa.me');
            case 'telegram':
              return stringValue.includes('telegram.org') || stringValue.includes('t.me');
            case 'website':
            case 'site':
              // Generic website - exclude social media domains
              return field.field_type === "url" && 
                     !stringValue.includes('facebook.com') && 
                     !stringValue.includes('instagram.com') && 
                     !stringValue.includes('youtube.com') && 
                     !stringValue.includes('tiktok.com') && 
                     !stringValue.includes('twitter.com') && 
                     !stringValue.includes('x.com') && 
                     !stringValue.includes('linkedin.com');
            default:
              return false;
          }
        });
      });
    });
  }

  /**
   * Apply category filter using field metadata approach
   */
  public static applyCategoryFilter(entries: any[], selectedCategories: string[], fields: any[]): any[] {
    if (selectedCategories.length === 0) return entries;

    return entries.filter((entry) => {
      // Find category field by field_type or label patterns
      const categoryField = fields.find(field => 
        field.field_type === "categories" || 
        field.field_type === "category" ||
        (field.field_type === "multiselect" && field.label?.toLowerCase().includes('categoria')) ||
        field.label?.toLowerCase().includes('categoria') ||
        field.label?.toLowerCase().includes('category')
      );

      if (!categoryField) {
        return false;
      }

      const entryValue = entry.values[categoryField.id];
      if (!entryValue) return false;

      // Extract categories from different data formats
      let categories: string[] = [];
      
      if (Array.isArray(entryValue)) {
        categories = entryValue.map(item => {
          if (typeof item === 'string') {
            return item.trim();
          } else if (typeof item === 'object' && item !== null) {
            return item.name || item.label || item.title || item.value || item.toString();
          } else {
            return item.toString().trim();
          }
        });
      } else if (typeof entryValue === 'string') {
        if (entryValue.includes(',')) {
          categories = entryValue.split(',').map(cat => cat.trim());
        } else if (entryValue.includes(';')) {
          categories = entryValue.split(';').map(cat => cat.trim());
        } else if (entryValue.includes('|')) {
          categories = entryValue.split('|').map(cat => cat.trim());
        } else {
          categories = [entryValue.trim()];
        }
      } else if (typeof entryValue === 'object' && entryValue !== null) {
        categories = [entryValue.name || entryValue.label || entryValue.title || entryValue.value || entryValue.toString()];
      } else {
        categories = [entryValue.toString().trim()];
      }

      // Check if any category matches the selected categories
      return selectedCategories.some(selectedCategory => {
        return categories.some(cat => {
          const lowerCat = cat.toLowerCase();
          const lowerSelected = selectedCategory.toLowerCase();
          
          // Case-insensitive match
          if (lowerCat === lowerSelected) return true;
          
          // Normalized match (without accents)
          const normalizedCat = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const normalizedSelected = selectedCategory.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          return normalizedCat === normalizedSelected;
        });
      });
    });
  }

  public static applySearchFilter(entries: any[], searchTerm: string, fields: any[]): any[] {
    if (!searchTerm) return entries;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return entries.filter((entry) => {
      return Object.entries(entry.values).some(([fieldId, value]) => {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) return false;

        if (["text", "textarea", "email", "url"].includes(field.field_type)) {
          return String(value).toLowerCase().includes(lowerSearchTerm);
        }
        return false;
      });
    });
  }

  public static applyAllBasicFilters(
    entries: any[], 
    config: BasicFiltersConfig, 
    fields: any[]
  ): any[] {
    let result = [...entries];

    // Apply category filter using the new specific method
    if (config.selectedFilters.category) {
      result = this.applyCategoryFilter(result, config.selectedFilters.category, fields);
    }

    // Apply country filter
    result = this.applyCountryFilter(result, config.selectedCountries, fields);

    // Apply links filter
    result = this.applyLinksFilter(result, config.selectedLinks, fields);

    // Apply search filter
    result = this.applySearchFilter(result, config.searchTerm, fields);

    return result;
  }
}
