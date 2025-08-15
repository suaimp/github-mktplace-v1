import { useState, useEffect } from 'react';
import { HeaderFooterScriptsService } from '../../../services/db-services/settings-services/headerFooterScriptsService';
import { SiteSettingsService } from '../../../services/db-services/settings-services/siteSettingsService';
import { 
  HeaderFooterFormState, 
  HeaderFooterValidationErrors,
  HeaderFooterUpdateData,
  HeaderFooterSaveResult 
} from '../types/headerFooterTypes';

/**
 * Hook personalizado para gerenciar scripts de header e footer
 * Segue o princípio de responsabilidade única
 */
export const useHeaderFooterScripts = () => {
  const [formState, setFormState] = useState<HeaderFooterFormState>({
    header_scripts: '',
    footer_scripts: '',
    loading: false,
    success: false,
    error: null,
  });

  const [validationErrors, setValidationErrors] = useState<HeaderFooterValidationErrors>({});

  /**
   * Carrega os scripts atuais do banco de dados
   */
  const loadScripts = async (): Promise<void> => {
    try {
      setFormState(prev => ({ ...prev, loading: true, error: null }));

      const scripts = await HeaderFooterScriptsService.getHeaderFooterScripts();
      
      if (scripts) {
        setFormState(prev => ({
          ...prev,
          header_scripts: scripts.header_scripts || '',
          footer_scripts: scripts.footer_scripts || '',
          loading: false,
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          header_scripts: '',
          footer_scripts: '',
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar scripts:', error);
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar configurações de scripts',
      }));
    }
  };

  /**
   * Atualiza um campo específico do formulário
   */
  const updateField = (field: keyof HeaderFooterUpdateData, value: string): void => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      success: false,
      error: null,
    }));

    // Remove erro de validação do campo específico
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Valida os dados do formulário
   */
  const validateForm = (): boolean => {
    const data: HeaderFooterUpdateData = {
      header_scripts: formState.header_scripts,
      footer_scripts: formState.footer_scripts,
    };

    const validation = HeaderFooterScriptsService.validateScripts(data);
    
    setValidationErrors(validation.errors);
    
    return validation.isValid;
  };

  /**
   * Salva os scripts no banco de dados
   */
  const saveScripts = async (): Promise<HeaderFooterSaveResult> => {
    try {
      // Validar antes de salvar
      if (!validateForm()) {
        return {
          success: false,
          message: 'Dados inválidos. Corrija os erros e tente novamente.',
        };
      }

      setFormState(prev => ({ ...prev, loading: true, error: null, success: false }));

      // Buscar configurações atuais para obter o ID
      const settings = await SiteSettingsService.getSiteSettings();
      
      if (!settings?.id) {
        throw new Error('ID das configurações não encontrado');
      }

      const updateData: HeaderFooterUpdateData = {
        header_scripts: HeaderFooterScriptsService.sanitizeScript(formState.header_scripts),
        footer_scripts: HeaderFooterScriptsService.sanitizeScript(formState.footer_scripts),
      };

      const success = await HeaderFooterScriptsService.updateHeaderFooterScripts(
        settings.id,
        updateData
      );

      if (success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          success: true,
          header_scripts: updateData.header_scripts,
          footer_scripts: updateData.footer_scripts,
        }));

        return {
          success: true,
          message: 'Scripts salvos com sucesso!',
          data: updateData,
        };
      } else {
        throw new Error('Falha ao salvar scripts');
      }
    } catch (error: any) {
      console.error('Erro ao salvar scripts:', error);
      
      const errorMessage = error.message || 'Erro inesperado ao salvar scripts';
      
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  /**
   * Reseta o formulário para o estado inicial
   */
  const resetForm = (): void => {
    setFormState({
      header_scripts: '',
      footer_scripts: '',
      loading: false,
      success: false,
      error: null,
    });
    setValidationErrors({});
  };

  /**
   * Limpa mensagens de status
   */
  const clearStatus = (): void => {
    setFormState(prev => ({
      ...prev,
      success: false,
      error: null,
    }));
  };

  // Carrega scripts na inicialização
  useEffect(() => {
    loadScripts();
  }, []);

  return {
    formState,
    validationErrors,
    updateField,
    saveScripts,
    resetForm,
    clearStatus,
    loadScripts,
  };
};
