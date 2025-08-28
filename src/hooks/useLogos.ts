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
         loadLogos();
        }
      )
      .subscribe();

    return () => {
    supabase.removeChannel(channel);
    };
  }, []);

  async function loadLogos() {
    try {
     setLoading(true);
      
      const { data: settings, error } = await supabase
        .from('settings')
        .select('light_logo, dark_logo, platform_icon')
        .single();

 
      if (error) {
         throw error;
      }

      if (settings) {
    const newLogos = { ...defaultLogos };

        if (settings.light_logo) {
        const { data: lightUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.light_logo);
          if (lightUrl) {
            newLogos.light = lightUrl.publicUrl;
           }
        }

        if (settings.dark_logo) {
        const { data: darkUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.dark_logo);
          if (darkUrl) {
            newLogos.dark = darkUrl.publicUrl;
        }
        }

        if (settings.platform_icon) {
        const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.platform_icon);
          if (iconUrl) {
            newLogos.icon = iconUrl.publicUrl;
       }
        }

      
        // Verificação adicional para produção
        if (import.meta.env.MODE === 'production') {
          Object.entries(newLogos).forEach(([key, url]) => {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
              console.warn(`⚠️ URL local detectada em produção para ${key}:`, url);
              // Em produção, usar logos padrão se detectar URLs locais
              newLogos[key as keyof Logos] = defaultLogos[key as keyof Logos];
            }
          });
        }
        
        setLogos(newLogos);
      } else {
       }
    } catch (error) {
    } finally {
      setLoading(false);
   }
  }

  return { logos, loading };
}