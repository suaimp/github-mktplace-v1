/**
 * Serviço para obter favicons com múltiplas estratégias de fallback
 */

export function extractDomain(url: string): string {
  try {
    // Remove protocol (http:// or https://)
    let domain = url.replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    domain = domain.replace(/\/$/, '');
    
    // Remove www. prefix
    domain = domain.replace(/^www\./, '');
    
    // Get only the domain (first part before any path)
    domain = domain.split('/')[0];
    
    return domain;
  } catch {
    return '';
  }
}

export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  
  // Estratégia principal: Google Favicon Service (mais confiável)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function getFaviconFallbackUrls(url: string): string[] {
  const domain = extractDomain(url);
  if (!domain) return [];
  
  return [
    // Estratégia 1: Google Favicon Service (tamanho maior)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    // Estratégia 2: Google Favicon Service (tamanho padrão)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=16`,
    // Estratégia 3: Favicon.ico direto do domínio
    `https://${domain}/favicon.ico`,
    // Estratégia 4: Clearbit (alternativa)
    `https://logo.clearbit.com/${domain}?size=32`,
    // Estratégia 5: DuckDuckGo
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];
}