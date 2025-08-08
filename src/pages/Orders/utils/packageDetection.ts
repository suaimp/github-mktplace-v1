/**
 * Utilitários para detectar se um item de pedido possui pacote selecionado
 */

import { SERVICE_OPTIONS } from "../../../components/Checkout/constants/options";

interface OrderItem {
  id: string;
  service_content?: any;
  [key: string]: any;
}

/**
 * Verifica se um item de pedido possui pacote selecionado
 * @param item Item do pedido
 * @returns true se há pacote selecionado, false caso contrário
 */
export function hasPackageSelected(item: OrderItem): boolean {
  if (!item.service_content) {
    return false;
  }

  try {
    let serviceData: any = null;

    // Formato esperado: ["{\"title\":\"Business\",\"price\":60,...}"]
    if (Array.isArray(item.service_content) && item.service_content.length > 0) {
      const jsonString = item.service_content[0];
      
      if (typeof jsonString === "string") {
        serviceData = JSON.parse(jsonString);
      } else if (typeof jsonString === "object") {
        serviceData = jsonString;
      }
    }
    // Fallback para outros formatos
    else if (typeof item.service_content === "string") {
      serviceData = JSON.parse(item.service_content);
    } else if (typeof item.service_content === "object") {
      serviceData = item.service_content;
    }

    // Se não conseguiu extrair dados válidos
    if (!serviceData) {
      return false;
    }

    // Verifica se é uma das opções "Nenhum" - isso significa que NÃO há pacote
    if (
      serviceData.title === SERVICE_OPTIONS.LEGACY_NONE ||
      serviceData.title === SERVICE_OPTIONS.NONE
    ) {
      return false;
    }

    // Verifica se serviceData é válido e tem título (e não é "nenhum")
    return serviceData && (serviceData.title || serviceData.name);
  } catch (error) {
    console.error("Erro ao verificar pacote selecionado:", error);
    return false;
  }
}

/**
 * Obtém o título do pacote selecionado
 * @param item Item do pedido
 * @returns Título do pacote ou null se não houver
 */
export function getPackageTitle(item: OrderItem): string | null {
  if (!hasPackageSelected(item)) {
    return null;
  }

  try {
    let serviceData: any = null;

    if (Array.isArray(item.service_content) && item.service_content.length > 0) {
      const jsonString = item.service_content[0];
      
      if (typeof jsonString === "string") {
        serviceData = JSON.parse(jsonString);
      } else if (typeof jsonString === "object") {
        serviceData = jsonString;
      }
    }
    else if (typeof item.service_content === "string") {
      serviceData = JSON.parse(item.service_content);
    } else if (typeof item.service_content === "object") {
      serviceData = item.service_content;
    }

    return serviceData?.title || serviceData?.name || null;
  } catch (error) {
    console.error("Erro ao obter título do pacote:", error);
    return null;
  }
}
