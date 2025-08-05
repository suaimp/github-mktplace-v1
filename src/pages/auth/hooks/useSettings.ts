// src/pages/auth/hooks/useSettings.ts

import { useState, useEffect } from 'react';
import { SettingsService } from '../db-service/settingsService';
import { SiteSettings } from '../types/settings';

export const useSiteDescription = () => {
  const [siteDescription, setSiteDescription] = useState<string>('Sistema de Gestão Administrativa');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteDescription = async () => {
      try {
        setLoading(true);
        const description = await SettingsService.getSiteDescription();
        setSiteDescription(description);
      } catch (err) {
        setError('Erro ao carregar descrição do site');
        console.error('Erro no hook useSiteDescription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDescription();
  }, []);

  return { siteDescription, loading, error };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await SettingsService.getAllSettings();
        setSettings(data);
      } catch (err) {
        setError('Erro ao carregar configurações');
        console.error('Erro no hook useSettings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};
