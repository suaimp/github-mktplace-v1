import { PriceData, FormEntryPrice } from '../types';

/**
 * Formata um valor numérico para o formato de moeda brasileira
 */
function formatToBrazilianCurrency(value: string | number): string {
  // Remove caracteres não numéricos e converte para número
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'))
    : value;
    
  if (isNaN(numericValue)) {
    return "Preço não disponível";
  }
  
  // Formata para moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

/**
 * Extrai informações completas de preço incluindo preços promocionais
 */
export function extractPriceInfo(priceData: FormEntryPrice): {
  price: string;
  promotionalPrice?: string;
  oldPrice?: string;
  hasPromotion: boolean;
} {
  let price = "Preço não disponível";
  let promotionalPrice: string | undefined;
  let oldPrice: string | undefined;
  let hasPromotion = false;

  let jsonData: PriceData | null = null;

  // Primeiro tenta o value_json (formato estruturado)
  if (priceData.value_json) {
    jsonData = priceData.value_json as PriceData;
  }
  // Se não tem value_json, tenta parsear o value como JSON
  else if (priceData.value) {
    try {
      // Tenta fazer parse do value como JSON
      const parsed = JSON.parse(priceData.value);
      if (parsed && typeof parsed === 'object' && 'price' in parsed) {
        jsonData = parsed as PriceData;
      }
    } catch (error) {
      // Se não conseguir fazer parse, trata como string simples
      console.log('Value não é JSON válido, tratando como string simples:', priceData.value);
    }
  }

  // Se conseguiu extrair dados JSON
  if (jsonData) {
    // Preço principal
    if (jsonData.price) {
      price = jsonData.price.includes('R$') 
        ? jsonData.price 
        : formatToBrazilianCurrency(jsonData.price);
    }
    
    // Preço promocional
    if (jsonData.promotional_price && 
        jsonData.promotional_price !== "0" && 
        jsonData.promotional_price.trim() !== "") {
      promotionalPrice = jsonData.promotional_price.includes('R$') 
        ? jsonData.promotional_price 
        : formatToBrazilianCurrency(jsonData.promotional_price);
      hasPromotion = true;
    }
    
    // Preço antigo
    if (jsonData.old_price) {
      oldPrice = jsonData.old_price.includes('R$') 
        ? jsonData.old_price 
        : formatToBrazilianCurrency(jsonData.old_price);
    }
  }
  // Se não tem JSON e ainda não tem preço, tenta o value como string simples
  else if (price === "Preço não disponível" && priceData.value) {
    price = priceData.value.includes('R$') 
      ? priceData.value 
      : formatToBrazilianCurrency(priceData.value);
  }
  
  return {
    price,
    promotionalPrice,
    oldPrice,
    hasPromotion
  };
}

/**
 * Extrai o preço do valor JSON ou texto (versão legada mantida para compatibilidade)
 */
export function extractPrice(priceData: FormEntryPrice): string {
  const priceInfo = extractPriceInfo(priceData);
  
  // Se há promoção, retorna o preço promocional
  if (priceInfo.hasPromotion && priceInfo.promotionalPrice) {
    return priceInfo.promotionalPrice;
  }
  
  // Senão retorna o preço normal
  return priceInfo.price;
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
