/**
 * Sistema de configuração global de links
 * 
 * Este módulo fornece:
 * 1. Hook para configuração automática de links no DOM
 * 2. Componente ExternalLink para links controlados
 * 3. Utilitários para configuração manual de links
 * 4. Presets para diferentes tipos de link
 */

export { ExternalLink } from './components/ui/link/ExternalLink';
export { useGlobalLinkConfig } from './hooks/useGlobalLinkConfig';
export { 
  generateLinkRel, 
  generateLinkProps, 
  isExternalUrl, 
  createLinkConfig,
  LINK_PRESETS,
  type LinkConfig 
} from './utils/linkConfig';

/**
 * Configuração recomendada:
 * 
 * 1. No App.tsx, adicione useGlobalLinkConfig() para configuração automática
 * 2. Use <ExternalLink> para links controlados manualmente
 * 3. Use createLinkConfig() para criar props de link dinamicamente
 * 
 * Exemplos:
 * 
 * // Link externo padrão (nofollow)
 * <ExternalLink href="https://example.com">Clique aqui</ExternalLink>
 * 
 * // Link externo com dofollow (para parceiros)
 * <ExternalLink href="https://partner.com" preset="externalDofollow">Parceiro</ExternalLink>
 * 
 * // Link dinâmico
 * const linkProps = createLinkConfig("https://example.com");
 * <a {...linkProps}>Link dinâmico</a>
 */
