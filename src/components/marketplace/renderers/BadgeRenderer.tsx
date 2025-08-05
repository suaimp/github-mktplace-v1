import { SponsoredBadge } from '../badges/SponsoredBadge';
import { LinkTypeBadge } from '../badges/LinkTypeBadge';
import { detectValueType } from '../services/valueTypeDetection';

/**
 * Renderiza badges coloridos baseado no tipo de valor
 */
export function renderValueBadge(value: any, fieldType: string, fieldLabel?: string) {
  const valueType = detectValueType(value, fieldType, fieldLabel);
  
  switch (valueType) {
    case 'linkType':
      return <LinkTypeBadge value={value} />;
      
    case 'sponsored':
      return <SponsoredBadge value={value} />;
      
    default:
      return null;
  }
}
