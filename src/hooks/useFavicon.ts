import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFavicon() {
  const [favicon, setFavicon] = useState<string>('/favicon.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavicon();

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
          loadFavicon();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadFavicon() {
    try {
      setLoading(true);
      
      const { data: settings, error } = await supabase
        .from('settings')
        .select('platform_icon')
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (settings?.platform_icon) {
        try {
          const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.platform_icon);
          
          if (iconUrl?.publicUrl) {
            // Verify the URL is accessible
            const response = await fetch(iconUrl.publicUrl, { method: 'HEAD' });
            if (response.ok) {
              setFavicon(iconUrl.publicUrl);
            }
          }
        } catch (storageError) {
          console.error('Error accessing storage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error loading favicon:', error);
    } finally {
      setLoading(false);
    }
  }

  return { favicon, loading };
}