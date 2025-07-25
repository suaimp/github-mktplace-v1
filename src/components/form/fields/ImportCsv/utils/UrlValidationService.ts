/**
 * Serviço responsável pela validação e formatação de URLs
 * Seguindo o princípio de responsabilidade única
 */
export class UrlValidationService {
  /**
   * Valida e formata uma URL para garantir o formato https://www
   */
  static formatUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return url;
    }

    // Remove espaços em branco
    let formattedUrl = url.trim();

    // Se a URL estiver vazia após trim, retorna original
    if (!formattedUrl) {
      return url;
    }

    // Verifica se já tem protocolo
    const hasProtocol = /^https?:\/\//i.test(formattedUrl);
    
    // Se não tem protocolo, adiciona https://
    if (!hasProtocol) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Verifica se tem www após o protocolo
    const hasWww = /^https?:\/\/www\./i.test(formattedUrl);
    
    // Se não tem www, adiciona após o protocolo
    if (!hasWww) {
      formattedUrl = formattedUrl.replace(/^(https?:\/\/)/i, '$1www.');
    }

    console.log(`🔗 [UrlValidationService] URL formatada: ${url} → ${formattedUrl}`);
    return formattedUrl;
  }

  /**
   * Valida se a URL está em formato válido
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Processa uma lista de URLs aplicando formatação
   */
  static formatUrlList(urls: string[]): string[] {
    return urls.map(url => this.formatUrl(url));
  }
}
