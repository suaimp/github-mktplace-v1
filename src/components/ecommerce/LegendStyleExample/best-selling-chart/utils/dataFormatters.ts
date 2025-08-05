import { PriceData, FormEntryPrice } from '../types';

/**
 * Extrai o preço do valor JSON ou texto
 */
export function extractPrice(priceData: FormEntryPrice): string {
  // Primeiro tenta o value_json (formato estruturado)
  if (priceData.value_json) {
    const jsonData = priceData.value_json as PriceData;
    
    // Se tem promotional_price e não é "0", usa ele
    if (jsonData.promotional_price && jsonData.promotional_price !== "0") {
      return jsonData.promotional_price;
    }
    
    // Senão usa o price normal
    if (jsonData.price) {
      return jsonData.price;
    }
  }
  
  // Se não tem JSON, tenta o value (texto simples)
  if (priceData.value) {
    return priceData.value;
  }
  
  return "Preço não disponível";
}

/**
 * Extrai e formata o nome do site da URL
 * Exemplos:
 * - gizmodo.uol.com.br/ -> gizmodo.uol
 * - example.com -> example.com
 * - subdomain.site.net -> site.net
 */
export function formatSiteName(url: string): string {
  try {
    // Remove protocolo
    let domain = url.replace(/^https?:\/\//, '');
    
    // Remove www.
    domain = domain.replace(/^www\./, '');
    
    // Remove paths (tudo após a primeira barra)
    domain = domain.split('/')[0];
    
    // Remove port se existir
    domain = domain.split(':')[0];
    
    const parts = domain.split('.');
    
    if (parts.length >= 2) {
      // Casos especiais para domínios brasileiros (.com.br, .net.br, .org.br, etc)
      if (parts.length >= 3 && parts[parts.length - 1] === 'br') {
        // Para dominios como gizmodo.uol.com.br -> gizmodo.uol
        if (parts.length >= 4) {
          return parts.slice(-4, -2).join('.');
        }
        // Para dominios como site.com.br -> site.com
        return parts.slice(-3, -1).join('.');
      }
      
      // Para domínios padrão (.com, .net, .org, etc)
      // Se tem subdomínio, remove apenas o subdomínio mais à esquerda
      if (parts.length > 2) {
        return parts.slice(-2).join('.');
      }
      
      // Se tem apenas domínio + extensão, retorna como está
      return parts.join('.');
    }
    
    return domain;
  } catch (error) {
    console.error('Error formatting site name:', error);
    return url;
  }
}

/**
 * Gera a URL do favicon para um site
 */
export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error generating favicon URL:', error);
    return `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
  }
}
