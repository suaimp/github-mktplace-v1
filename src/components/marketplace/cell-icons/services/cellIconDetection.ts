/**
 * Serviço para detectar e gerenciar ícones em células da tabela marketplace
 */

export type CellIconType = 'traffic' | 'none';

/**
 * Detecta se um campo deve ter ícone baseado no tipo e nome
 */
export function shouldShowCellIcon(fieldType: string, fieldLabel?: string): boolean {
  // Campos de tráfego
  if (isTrafficField(fieldType, fieldLabel)) {
    return true;
  }
  
  return false;
}

/**
 * Detecta se é um campo de tráfego
 */
export function isTrafficField(fieldType: string, fieldLabel?: string): boolean {
  // Verifica por tipo de campo
  const trafficFieldTypes = [
    'ahrefs_traffic',
    'similarweb_traffic', 
    'google_traffic',
    'semrush_as'
  ];
  
  if (trafficFieldTypes.includes(fieldType)) {
    return true;
  }
  
  // Verifica por label/nome do campo
  if (fieldLabel) {
    const lowerLabel = fieldLabel.toLowerCase();
    const trafficKeywords = ['tráfego', 'traffic', 'visitantes', 'visitas'];
    return trafficKeywords.some(keyword => lowerLabel.includes(keyword));
  }
  
  return false;
}

/**
 * Determina o tipo de ícone a ser usado
 */
export function getCellIconType(fieldType: string, fieldLabel?: string): CellIconType {
  if (isTrafficField(fieldType, fieldLabel)) {
    return 'traffic';
  }
  
  return 'none';
}
