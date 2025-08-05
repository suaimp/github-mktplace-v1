/**
 * Service for detecting value types and determining appropriate rendering
 */

export type ValueType = 'linkType' | 'sponsored' | 'default';

/**
 * Detects if a value is of link type (Dofollow/Nofollow)
 */
export function isLinkTypeValue(value: any): boolean {
  if (typeof value !== 'string') return false;
  return value === 'Dofollow' || value === 'Nofollow';
}

/**
 * Detects if a value is of sponsored type (boolean for toggle or radio with Sim/Não)
 */
export function isSponsoredValue(fieldType: string, value: any): boolean {
  // Accept both toggle and radio
  if (fieldType === 'toggle') {
    return true;
  }
  
  if (fieldType === 'radio' && typeof value === 'string') {
    return value === 'Sim' || value === 'Não';
  }
  
  return false;
}

/**
 * Main detection function that determines the value type
 */
export function detectValueType(
  value: any,
  fieldType: string,
  fieldLabel?: string
): ValueType {
  
  // First check by field label
  if (fieldLabel) {
    const labelLower = fieldLabel.toLowerCase();
    
    // If field contains "patrocinado" and value is Sim/Não
    if (labelLower.includes('patrocinado') && typeof value === 'string' && (value === 'Sim' || value === 'Não')) {
      return 'sponsored';
    }
    
    // If field contains "link" and value is Dofollow/Nofollow
    if (labelLower.includes('link') && isLinkTypeValue(value)) {
      return 'linkType';
    }
  }
  
  // Then check by link type
  if (isLinkTypeValue(value)) {
    return 'linkType';
  }
  
  // Finally check if it's sponsored by field type
  if (isSponsoredValue(fieldType, value)) {
    return 'sponsored';
  }

  return 'default';
}
