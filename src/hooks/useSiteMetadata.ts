import { useState, useEffect } from 'react';
import { SiteSettingsService } from '../services/db-services/settings-services/siteSettingsService';

interface SiteMetadata {
  site_title: string;
  site_description: string;
}

export const useSiteMetadata = () => {
  const [metadata, setMetadata] = useState<SiteMetadata>({
    site_title: 'Marketplace',
    site_description: 'Marketplace de Serviços Digitais'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setIsLoading(true);
      const data = await SiteSettingsService.getSiteMetaData();
      
      if (data) {
        setMetadata({
          site_title: data.site_title || 'Marketplace',
          site_description: data.site_description || 'Marketplace de Serviços Digitais'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar metadados:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metadata,
    isLoading,
    reloadMetadata: loadMetadata
  };
};
