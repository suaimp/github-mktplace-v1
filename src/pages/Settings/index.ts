// Exportações centralizadas dos componentes de Settings
export { default as Settings } from './Settings';
export { default as LogoSettings } from './LogoSettings';
export { default as SiteMetaContainer } from './components/SiteMetaContainer';
export { default as SiteMetaForm } from './components/SiteMetaForm';
export { default as HeaderFooterSettings } from './components/HeaderFooterSettings';

// Exportações de hooks
export { useSiteMeta } from './hooks/useSiteMeta';
export { useSettingsToast } from './hooks/useSettingsToast';
export { useLogoSettings } from './hooks/useLogoSettings';
export { useHeaderFooterScripts } from './hooks/useHeaderFooterScripts';

// Exportações de tipos
export type {
  SiteMetaFormData,
  SiteMetaFormProps,
  UseSiteMetaReturn
} from './types';

export type {
  HeaderFooterSettingsProps,
  HeaderFooterFormState,
  HeaderFooterValidationErrors,
  HeaderFooterUpdateData,
  HeaderFooterSaveResult
} from './types/headerFooterTypes';

// Services (re-export para conveniência)
export { SiteSettingsService } from '../../services/db-services/settings-services/siteSettingsService';
export { LogoService } from '../../services/db-services/settings-services/logoService';
export { HeaderFooterScriptsService } from '../../services/db-services/settings-services/headerFooterScriptsService';
