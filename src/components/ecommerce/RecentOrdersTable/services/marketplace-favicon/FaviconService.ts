/**
 * Serviço de Favicon baseado na implementação do Marketplace
 * Mantém consistência com a estratégia existente
 */

// Extract domain from URL (mesma implementação do formatters.ts)
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
    
    // Remove country extensions (.br, .uk, .au, etc) - keep only main domain + extension
    // Example: site.com.br -> site.com, site.org.uk -> site.org
    domain = domain.replace(/\.(br|uk|au|ca|de|fr|es|it|nl|se|no|dk|fi|pl|ru|jp|cn|in|mx|ar|cl|co|pe|ve|ec|uy|py|bo|cr|gt|hn|ni|pa|sv|do|cu|jm|ht|tt|bb|gd|lc|vc|ag|dm|kn|ms|ai|vg|vi|pr|bz|gf|sr|gy|fk|gs|sh|ac|tc|ky|bm|gl|fo|is|ie|mt|cy|bg|ro|hr|si|sk|cz|hu|at|ch|li|ad|mc|sm|va|lu|be|dk|se|no|fi|ee|lv|lt|by|ua|md|mk|al|ba|me|rs|xk|si|hr|bg|ro|tr|gr|ge|am|az|kz|kg|tj|tm|uz|af|pk|bd|bt|np|lk|mv|io|cc|cx|nf|pn|tk|nu|ck|as|fm|gu|ki|mh|mp|nr|pw|pg|ws|sb|to|tv|vu|wf|nz|fj|nc|pf|tf|yt|re|mu|sc|mg|mz|za|zw|zm|mw|ls|sz|bw|na|ao|st|gq|ga|cg|cd|cf|cm|td|ne|ng|bj|tg|gh|ci|lr|sl|gn|gw|cv|sn|gm|ml|bf|mr|dz|tn|ly|eg|sd|ss|et|er|dj|so|ke|ug|tz|rw|bi|mz|mg|km|sc|mu|re|yt|tf|mq|gp|bl|mf|pm|aw|an|cw|sx|bq|vc|lc|gd|dm|ag|ms|kn|ai|vg|vi|pr|do|ht|jm|cu|bs|tc|ky|bm|gl|fo|is|ie|gb|im|je|gg)$/i, '');
    
    return domain;
  } catch (e) {
    return url;
  }
}

// Get favicon URL for a domain (mesma implementação do formatters.ts)
export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

// Função para limpar URL para exibição
export function cleanUrlForDisplay(url: string): string {
  let displayUrl = url.replace(/^https?:\/\//, "");
  displayUrl = displayUrl.replace(/\/$/, "");
  displayUrl = displayUrl.replace(/^www\./, "");
  
  // Get only the domain (first part before any path)
  displayUrl = displayUrl.split('/')[0];
  
  // Remove country extensions (.br, .uk, .au, etc) - keep only main domain + extension
  // Example: site.com.br -> site.com, site.org.uk -> site.org
  displayUrl = displayUrl.replace(/\.(br|uk|au|ca|de|fr|es|it|nl|se|no|dk|fi|pl|ru|jp|cn|in|mx|ar|cl|co|pe|ve|ec|uy|py|bo|cr|gt|hn|ni|pa|sv|do|cu|jm|ht|tt|bb|gd|lc|vc|ag|dm|kn|ms|ai|vg|vi|pr|bz|gf|sr|gy|fk|gs|sh|ac|tc|ky|bm|gl|fo|is|ie|mt|cy|bg|ro|hr|si|sk|cz|hu|at|ch|li|ad|mc|sm|va|lu|be|dk|se|no|fi|ee|lv|lt|by|ua|md|mk|al|ba|me|rs|xk|si|hr|bg|ro|tr|gr|ge|am|az|kz|kg|tj|tm|uz|af|pk|bd|bt|np|lk|mv|io|cc|cx|nf|pn|tk|nu|ck|as|fm|gu|ki|mh|mp|nr|pw|pg|ws|sb|to|tv|vu|wf|nz|fj|nc|pf|tf|yt|re|mu|sc|mg|mz|za|zw|zm|mw|ls|sz|bw|na|ao|st|gq|ga|cg|cd|cf|cm|td|ne|ng|bj|tg|gh|ci|lr|sl|gn|gw|cv|sn|gm|ml|bf|mr|dz|tn|ly|eg|sd|ss|et|er|dj|so|ke|ug|tz|rw|bi|mz|mg|km|sc|mu|re|yt|tf|mq|gp|bl|mf|pm|aw|an|cw|sx|bq|vc|lc|gd|dm|ag|ms|kn|ai|vg|vi|pr|do|ht|jm|cu|bs|tc|ky|bm|gl|fo|is|ie|gb|im|je|gg)$/i, '');
  
  return displayUrl;
}
