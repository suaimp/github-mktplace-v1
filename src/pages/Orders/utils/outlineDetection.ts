/**
 * Utilitários para verificar status da pauta
 */

interface OrderItem {
  id: string;
  outline?: any;
  [key: string]: any;
}

/**
 * Verifica se um item já possui pauta enviada
 * @param item Item do pedido
 * @returns true se já tem pauta, false caso contrário
 */
export function hasOutlineData(item: OrderItem): boolean {
  if (!item.outline) {
    return false;
  }

  try {
    // Se é string, tenta fazer parse
    if (typeof item.outline === 'string') {
      const parsed = JSON.parse(item.outline);
      return Boolean(parsed && Object.keys(parsed).length > 0);
    }
    
    // Se é objeto, verifica se tem dados
    if (typeof item.outline === 'object') {
      return Boolean(item.outline && Object.keys(item.outline).length > 0);
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar dados da pauta:', error);
    return false;
  }
}

/**
 * Extrai os dados da pauta para exibição
 * @param item Item do pedido
 * @returns Dados da pauta ou null
 */
export function getOutlineData(item: OrderItem): any | null {
  if (!hasOutlineData(item)) {
    return null;
  }

  try {
    if (typeof item.outline === 'string') {
      return JSON.parse(item.outline);
    }
    
    if (typeof item.outline === 'object') {
      return item.outline;
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair dados da pauta:', error);
    return null;
  }
}
