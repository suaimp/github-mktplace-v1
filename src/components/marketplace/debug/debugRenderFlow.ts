// Debug file to test Sim/Não badge rendering
// Este arquivo será usado para analisar o problema

export interface DebugCase {
  scenario: string;
  fieldType: string;
  value: any;
  fieldLabel?: string;
  expectedResult: string;
}

export const debugCases: DebugCase[] = [
  {
    scenario: "Toggle field with true value",
    fieldType: "toggle",
    value: true,
    expectedResult: "badge-sponsored-yes"
  },
  {
    scenario: "Toggle field with false value", 
    fieldType: "toggle",
    value: false,
    expectedResult: "badge-sponsored-no"
  },
  {
    scenario: "Radio field with Sim value",
    fieldType: "radio", 
    value: "Sim",
    expectedResult: "badge-sponsored-yes"
  },
  {
    scenario: "Radio field with Não value",
    fieldType: "radio",
    value: "Não", 
    expectedResult: "badge-sponsored-no"
  },
  {
    scenario: "Generic field with Sim value",
    fieldType: "text",
    value: "Sim",
    fieldLabel: "Artigo Patrocinado",
    expectedResult: "badge-sponsored-yes"
  },
  {
    scenario: "Generic field with Não value", 
    fieldType: "text",
    value: "Não",
    fieldLabel: "Artigo Patrocinado",
    expectedResult: "badge-sponsored-no"
  }
];

// Função para debugar o fluxo de renderização
export function debugRenderFlow(value: any, fieldType: string, fieldLabel?: string) {
  console.log('=== DEBUG RENDER FLOW ===');
  console.log('Value:', value, 'Type:', typeof value);
  console.log('Field Type:', fieldType);
  console.log('Field Label:', fieldLabel);
  
  // Simular o fluxo do MarketplaceValueFormatter
  console.log('\n--- MarketplaceValueFormatter Flow ---');
  
  // 1. Verifica se é null/undefined
  if (value === null || value === undefined) {
    console.log('→ Returns "-" (null/undefined)');
    return "-";
  }
  
  // 2. Verifica se é button_buy
  if (fieldType === "button_buy") {
    console.log('→ Returns null (button_buy)');
    return null;
  }
  
  // 3. Casos específicos (url, brand, niche, country)
  if (["url", "brand", "niche", "country"].includes(fieldType)) {
    console.log('→ Returns special renderer for', fieldType);
    return `Special renderer for ${fieldType}`;
  }
  
  // 4. Switch cases
  switch (fieldType) {
    case "toggle":
      console.log('→ TOGGLE case detected');
      const displayValue = value ? "Sim" : "Não";
      const toggleClass = value ? "badge-sponsored-yes" : "badge-sponsored-no";
      console.log('  Display value:', displayValue);
      console.log('  CSS class:', toggleClass);
      return `<span class="${toggleClass}">${displayValue}</span>`;
      
    case "radio":
      console.log('→ RADIO case detected');
      const isYes = value === "Sim";
      console.log('  Is "Sim"?', isYes);
      console.log('  Raw value comparison:', `"${value}" === "Sim"`, value === "Sim");
      
      if (value === "Sim" || value === "Não") {
        const radioClass = isYes ? "badge-sponsored-yes" : "badge-sponsored-no";
        console.log('  Is Sim/Não value, CSS class:', radioClass);
        return `<span class="${radioClass}">${value}</span>`;
      } else {
        console.log('  Not Sim/Não value, returning as text:', value);
        return value;
      }
      
    default:
      console.log('→ DEFAULT case - checking badge renderer');
      
      // Simular detectValueType
      console.log('\n--- Value Type Detection ---');
      
      // Check by field label first
      if (fieldLabel && typeof fieldLabel === 'string') {
        const labelLower = fieldLabel.toLowerCase();
        console.log('  Field label (lowercase):', labelLower);
        
        if (labelLower.includes('patrocinado') && typeof value === 'string' && (value === 'Sim' || value === 'Não')) {
          console.log('  → Detected as sponsored by label');
          const booleanValue = value === 'Sim';
          const badgeClass = booleanValue ? "badge-sponsored-yes" : "badge-sponsored-no";
          console.log('  Boolean value:', booleanValue);
          console.log('  Badge class:', badgeClass);
          return `<SponsoredBadge class="${badgeClass}">${value}</SponsoredBadge>`;
        }
      }
      
      // Check if is Sim/Não by value
      if (typeof value === 'string' && (value === 'Sim' || value === 'Não')) {
        console.log('  → Detected as sponsored by value');
        const booleanValue = value === 'Sim';
        const badgeClass = booleanValue ? "badge-sponsored-yes" : "badge-sponsored-no";
        console.log('  Boolean value:', booleanValue);
        console.log('  Badge class:', badgeClass);
        return `<SponsoredBadge class="${badgeClass}">${value}</SponsoredBadge>`;
      }
      
      console.log('  → No badge detected, returning as text');
      return value.toString();
  }
}
