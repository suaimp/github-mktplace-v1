// src/pages/auth/types/settings.ts

export interface SiteSettings {
  site_description: string;
  site_title?: string;
  site_logo?: string;
  theme_color?: string;
  [key: string]: any; // Para outros campos de configuração
}

export interface SettingsState {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
}
