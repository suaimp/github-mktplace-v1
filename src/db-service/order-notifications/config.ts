/**
 * Configuração de emails para notificações de pedidos
 */

import { SettingsService } from './SettingsService';

export const EMAIL_CONFIG = {
  ADMIN_EMAIL: 'contato@suaimprensa.com.br',
  FROM_EMAIL: 'noreply@cp.suaimprensa.com.br',
  FROM_NAME: 'Marketplace Sua Imprensa' // Fallback padrão
} as const;

/**
 * Busca o nome dinâmico da plataforma das configurações
 */
export async function getPlatformName(): Promise<string> {
  try {
    const settings = await SettingsService.getPlatformSettingsWithCache();
    return settings.site_title;
  } catch (error) {
    console.warn('⚠️ [EmailConfig] Erro ao buscar nome da plataforma, usando padrão:', error);
    return EMAIL_CONFIG.FROM_NAME;
  }
}

/**
 * Gera string "from" completa com nome dinâmico
 */
export async function getDynamicFromString(): Promise<string> {
  const platformName = await getPlatformName();
  return `${platformName} <${EMAIL_CONFIG.FROM_EMAIL}>`;
}
