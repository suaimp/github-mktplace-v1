/**
 * Utilitários para configuração de links
 */

export interface LinkConfig {
  nofollow?: boolean;
  noopener?: boolean;
  noreferrer?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

/**
 * Gera os atributos rel para um link baseado na configuração
 */
export const generateLinkRel = (config: LinkConfig = {}): string => {
  const {
    nofollow = true, // Por padrão, todos os links são nofollow
    noopener = true,
    noreferrer = true,
  } = config;

  const relAttributes: string[] = [];

  if (nofollow) relAttributes.push('nofollow');
  if (noopener) relAttributes.push('noopener');
  if (noreferrer) relAttributes.push('noreferrer');

  return relAttributes.join(' ');
};

/**
 * Gera props completas para um link baseado na configuração
 */
export const generateLinkProps = (href: string, config: LinkConfig = {}) => {
  const { target = '_blank', ...relConfig } = config;
  
  return {
    href,
    target,
    rel: generateLinkRel(relConfig),
  };
};

/**
 * Verifica se um URL é externo
 */
export const isExternalUrl = (url: string): boolean => {
  try {
    if (url.startsWith('/') || url.startsWith('#')) return false;
    if (!url.startsWith('http')) return false;
    
    const urlObj = new URL(url);
    return urlObj.hostname !== window.location.hostname;
  } catch {
    return false;
  }
};

/**
 * Configurações predefinidas para diferentes tipos de link
 */
export const LINK_PRESETS = {
  // Link externo padrão - nofollow
  external: {
    nofollow: true,
    noopener: true,
    noreferrer: true,
    target: '_blank' as const,
  },
  
  // Link externo com dofollow (para parceiros/afiliados autorizados)
  externalDofollow: {
    nofollow: false,
    noopener: true,
    noreferrer: true,
    target: '_blank' as const,
  },
  
  // Link interno na mesma aba
  internal: {
    nofollow: false,
    noopener: false,
    noreferrer: false,
    target: '_self' as const,
  },
  
  // Link interno em nova aba
  internalNewTab: {
    nofollow: false,
    noopener: true,
    noreferrer: false,
    target: '_blank' as const,
  },
} as const;

/**
 * Função helper para criar links com configuração automática
 */
export const createLinkConfig = (url: string, preset?: keyof typeof LINK_PRESETS) => {
  if (preset) {
    return generateLinkProps(url, LINK_PRESETS[preset]);
  }
  
  // Auto-detecta o tipo de link
  if (isExternalUrl(url)) {
    return generateLinkProps(url, LINK_PRESETS.external);
  } else {
    return generateLinkProps(url, LINK_PRESETS.internal);
  }
};
