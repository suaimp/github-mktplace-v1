import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Logos {
  light: string;
  dark: string;
  icon: string;
}

const defaultLogos = {
  light: "/images/logo/logo.svg",
  dark: "/images/logo/logo-dark.svg",
  icon: "/images/logo/logo-icon.svg"
};

export function useLogos() {
  const [logos, setLogos] = useState<Logos>(defaultLogos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 [useLogos] Initializing logo loading...');
    loadLogos();

    // Subscribe to settings changes
    const channel = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings'
        },
        () => {
          console.log('🔄 [useLogos] Settings changed, reloading logos...');
          loadLogos();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [useLogos] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadLogos() {
    try {
      console.log('📡 [useLogos] Loading logos from database...');
      setLoading(true);
      
      const { data: settings, error } = await supabase
        .from('settings')
        .select('light_logo, dark_logo, platform_icon')
        .single();

      console.log('📊 [useLogos] Database response:', { settings, error });

      if (error) {
        console.error('❌ [useLogos] Database error:', error);
        throw error;
      }

      if (settings) {
        console.log('⚙️ [useLogos] Processing settings:', settings);
        const newLogos = { ...defaultLogos };

        if (settings.light_logo) {
          console.log('🌞 [useLogos] Getting light logo URL for:', settings.light_logo);
          const { data: lightUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.light_logo);
          if (lightUrl) {
            newLogos.light = lightUrl.publicUrl;
            console.log('✅ [useLogos] Light logo URL:', lightUrl.publicUrl);
            // Debug adicional para produção
            console.log('🔍 [useLogos] Environment:', import.meta.env.MODE);
            console.log('🔍 [useLogos] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
          }
        }

        if (settings.dark_logo) {
          console.log('🌙 [useLogos] Getting dark logo URL for:', settings.dark_logo);
          const { data: darkUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.dark_logo);
          if (darkUrl) {
            newLogos.dark = darkUrl.publicUrl;
            console.log('✅ [useLogos] Dark logo URL:', darkUrl.publicUrl);
          }
        }

        if (settings.platform_icon) {
          console.log('🎯 [useLogos] Getting icon URL for:', settings.platform_icon);
          const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.platform_icon);
          if (iconUrl) {
            newLogos.icon = iconUrl.publicUrl;
            console.log('✅ [useLogos] Icon URL:', iconUrl.publicUrl);
          }
        }

        console.log('🖼️ [useLogos] Final logos object:', newLogos);
        
        // Verificação adicional para produção
        if (import.meta.env.MODE === 'production') {
          console.log('🚨 [useLogos] Production mode - checking for localhost URLs...');
          Object.entries(newLogos).forEach(([key, url]) => {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
              console.error(`❌ [useLogos] ${key} contains localhost URL in production:`, url);
            }
          });
        }
        
        setLogos(newLogos);
      } else {
        console.log('📋 [useLogos] No settings found, using default logos');
      }
    } catch (error) {
      console.error('❌ [useLogos] Error loading logos:', error);
    } finally {
      setLoading(false);
      console.log('✅ [useLogos] Logo loading completed');
    }
  }

  return { logos, loading };
}