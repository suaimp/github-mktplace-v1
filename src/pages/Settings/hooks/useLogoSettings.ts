import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSettingsToast } from './useSettingsToast';

interface LogoSettings {
  id: string;
  light_logo: string | null;
  dark_logo: string | null;
  platform_icon: string | null;
}

interface CurrentLogos {
  light: string;
  dark: string;
  icon: string;
}

export interface UseLogoSettingsReturn {
  settings: LogoSettings | null;
  currentLogos: CurrentLogos;
  loading: boolean;
  loadSettings: () => Promise<void>;
}

export const useLogoSettings = (): UseLogoSettingsReturn => {
  const [settings, setSettings] = useState<LogoSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLogos, setCurrentLogos] = useState<CurrentLogos>({
    light: "/images/logo/logo.svg",
    dark: "/images/logo/logo-dark.svg",
    icon: "/images/logo/logo-icon.svg"
  });

  const { showErrorToast } = useSettingsToast();

  // Carrega as configurações iniciais
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // First check if settings table has any row
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (settingsError) {
        // If no settings exist, create initial row
        if (settingsError.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await supabase
            .from('settings')
            .insert([{}])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
        } else {
          throw settingsError;
        }
      } else {
        setSettings(settingsData);
        
        // Get public URLs for stored logos if they exist
        if (settingsData.light_logo) {
          const { data: lightUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.light_logo);
          if (lightUrl) {
            setCurrentLogos(prev => ({ ...prev, light: lightUrl.publicUrl }));
          }
        }
        
        if (settingsData.dark_logo) {
          const { data: darkUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.dark_logo);
          if (darkUrl) {
            setCurrentLogos(prev => ({ ...prev, dark: darkUrl.publicUrl }));
          }
        }
        
        if (settingsData.platform_icon) {
          const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settingsData.platform_icon);
          if (iconUrl) {
            setCurrentLogos(prev => ({ ...prev, icon: iconUrl.publicUrl }));
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      showErrorToast('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    currentLogos,
    loading,
    loadSettings
  };
};
