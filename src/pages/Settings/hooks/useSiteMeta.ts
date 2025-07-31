import { useState, useEffect } from 'react';
import { SiteSettingsService } from '../../../services/db-services/settings-services/siteSettingsService';
import { SiteMetaFormData, UseSiteMetaReturn } from '../types';

export const useSiteMeta = (): UseSiteMetaReturn => {
  const [metaData, setMetaData] = useState<SiteMetaFormData>({
    site_title: '',
    site_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carrega os dados iniciais
  useEffect(() => {
    loadSiteMetaData();
  }, []);

  const loadSiteMetaData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await SiteSettingsService.getSiteMetaData();
      if (data) {
        setMetaData({
          site_title: data.site_title || '',
          site_description: data.site_description || ''
        });
      } else {
        // Se não conseguir carregar, usar valores padrão
        setMetaData({
          site_title: '',
          site_description: ''
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar metadados:', err);
      setError('Erro ao carregar metadados do site');
      // Em caso de erro, usar valores padrão
      setMetaData({
        site_title: '',
        site_description: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetaData = async (newMetaData: SiteMetaFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validar dados
      const validationErrors = SiteSettingsService.validateSiteMetaData(newMetaData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Atualizar no banco de dados
      const result = await SiteSettingsService.updateSiteMetaData(newMetaData);
      
      if (result) {
        setMetaData(newMetaData);
        setSuccess(true);
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError('Erro ao salvar metadados do site');
      }
    } catch (err) {
      console.error('Erro ao atualizar metadados:', err);
      setError('Erro inesperado ao salvar metadados');
    } finally {
      setLoading(false);
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    metaData,
    loading,
    error,
    success,
    updateMetaData,
    resetStatus
  };
};
