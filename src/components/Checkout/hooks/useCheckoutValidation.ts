import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { NICHE_OPTIONS, SERVICE_OPTIONS } from "../constants/options";

export function useCheckoutValidation() {
  const [areAllFieldsSelected, setAreAllFieldsSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('[useCheckoutValidation] Hook iniciado/re-renderizado');

  const checkValidation = async () => {
    try {
      setLoading(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setAreAllFieldsSelected(false);
        setLoading(false);
        return;
      }

      // Forçar busca de dados frescos do banco, ignorando cache
      const timestamp = Date.now();
      console.log('[useCheckoutValidation] Buscando dados frescos:', { timestamp });
      
      const { data: freshCheckoutItems, error: fetchError } = await supabase
        .from('cart_checkout_resume')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('[useCheckoutValidation] Dados frescos do banco:', {
        error: fetchError,
        itemsCount: freshCheckoutItems?.length || 0,
        items: freshCheckoutItems?.map(item => ({
          id: item.id,
          niche_selected: item.niche_selected,
          service_selected: item.service_selected,
          niche_type: typeof item.niche_selected,
          service_type: typeof item.service_selected
        }))
      });
      
      if (fetchError) {
        console.error('[useCheckoutValidation] Erro ao buscar dados:', fetchError);
        setAreAllFieldsSelected(false);
        setLoading(false);
        return;
      }

      if (!freshCheckoutItems || freshCheckoutItems.length === 0) {
        setAreAllFieldsSelected(true); // Se não há itens, considera válido
        setLoading(false);
        return;
      }

      // Função auxiliar para verificar se um valor de nicho é válido
      const isValidNicheValue = (value: any): boolean => {
        if (!value || value === null || value === undefined) {
          return false;
        }
        
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed !== '' && 
                 trimmed !== NICHE_OPTIONS.PLACEHOLDER && 
                 trimmed !== 'null' && 
                 trimmed !== 'undefined';
        }
        
        return false;
      };

      // Função auxiliar para verificar se um valor de service é válido
      const isValidServiceValue = (value: any): boolean => {
        if (!value || value === null || value === undefined) {
          return false; // Service deve ser selecionado
        }
        
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed !== '' && 
                 trimmed !== SERVICE_OPTIONS.PLACEHOLDER && 
                 trimmed !== SERVICE_OPTIONS.NONE &&
                 trimmed !== SERVICE_OPTIONS.LEGACY_NONE &&
                 trimmed !== 'null' && 
                 trimmed !== 'undefined';
        }
        
        // Se é array, verifica o primeiro elemento
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === 'object' && firstItem.title) {
            return firstItem.title !== SERVICE_OPTIONS.PLACEHOLDER &&
                   firstItem.title !== SERVICE_OPTIONS.NONE &&
                   firstItem.title !== SERVICE_OPTIONS.LEGACY_NONE;
          }
          if (typeof firstItem === 'string') {
            return firstItem !== SERVICE_OPTIONS.PLACEHOLDER && 
                   firstItem !== SERVICE_OPTIONS.NONE &&
                   firstItem !== SERVICE_OPTIONS.LEGACY_NONE &&
                   firstItem !== '';
          }
        }
        
        // Se é objeto, verifica a propriedade title
        if (typeof value === 'object' && value.title) {
          return value.title !== SERVICE_OPTIONS.PLACEHOLDER && 
                 value.title !== SERVICE_OPTIONS.NONE &&
                 value.title !== SERVICE_OPTIONS.LEGACY_NONE &&
                 value.title !== '';
        }
        
        return false;
      };

      // Função para extrair o valor do nicho de diferentes formatos
      const extractNicheValue = (nicheSelected: any): string | null => {
        if (!nicheSelected) return null;
        
        // Se é string, tenta fazer parse JSON primeiro
        if (typeof nicheSelected === 'string') {
          try {
            const parsed = JSON.parse(nicheSelected);
            // Se o parse deu certo e é um array
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              return typeof firstItem === 'object' && firstItem.niche 
                ? firstItem.niche 
                : typeof firstItem === 'string' ? firstItem : null;
            }
            // Se o parse deu certo e é um objeto
            if (typeof parsed === 'object' && parsed.niche) {
              return parsed.niche;
            }
            // Se não é JSON válido, retorna a string original
            return nicheSelected;
          } catch {
            // Se não é JSON válido, retorna a string original
            return nicheSelected;
          }
        }
        
        // Se é array
        if (Array.isArray(nicheSelected) && nicheSelected.length > 0) {
          const firstItem = nicheSelected[0];
          return typeof firstItem === 'object' && firstItem.niche 
            ? firstItem.niche 
            : typeof firstItem === 'string' ? firstItem : null;
        }
        
        // Se é objeto
        if (typeof nicheSelected === 'object' && nicheSelected.niche) {
          return nicheSelected.niche;
        }
        
        return null;
      };

      // Função para extrair o valor do service de diferentes formatos
      const extractServiceValue = (serviceSelected: any): string | null => {
        if (!serviceSelected) return null;
        
        // Se é string, tenta fazer parse JSON primeiro
        if (typeof serviceSelected === 'string') {
          try {
            const parsed = JSON.parse(serviceSelected);
            // Se o parse deu certo e é um array
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              return typeof firstItem === 'object' && firstItem.title 
                ? firstItem.title 
                : typeof firstItem === 'string' ? firstItem : null;
            }
            // Se o parse deu certo e é um objeto
            if (typeof parsed === 'object' && parsed.title) {
              return parsed.title;
            }
            // Se não é JSON válido, retorna a string original
            return serviceSelected;
          } catch {
            // Se não é JSON válido, retorna a string original
            return serviceSelected;
          }
        }
        
        // Se é array
        if (Array.isArray(serviceSelected) && serviceSelected.length > 0) {
          const firstItem = serviceSelected[0];
          return typeof firstItem === 'object' && firstItem.title 
            ? firstItem.title 
            : typeof firstItem === 'string' ? firstItem : null;
        }
        
        // Se é objeto
        if (typeof serviceSelected === 'object' && serviceSelected.title) {
          return serviceSelected.title;
        }
        
        return null;
      };

      // Verificar se todos os itens têm nicho e service válidos selecionados
      const allFieldsValid = freshCheckoutItems.every((item) => {
        const extractedNicheValue = extractNicheValue(item.niche_selected);
        const extractedServiceValue = extractServiceValue(item.service_selected);
        
        const isNicheValid = isValidNicheValue(extractedNicheValue);
        const isServiceValid = isValidServiceValue(extractedServiceValue);
        
        // Log detalhado para debug
        console.log('[useCheckoutValidation] Validando item:', {
          itemId: item.id,
          raw_niche_selected: item.niche_selected,
          raw_service_selected: item.service_selected,
          extractedNicheValue,
          extractedServiceValue,
          niche_placeholder: NICHE_OPTIONS.PLACEHOLDER,
          service_placeholder: SERVICE_OPTIONS.PLACEHOLDER,
          isNicheValid,
          isServiceValid,
          isItemValid: isNicheValid && isServiceValid
        });
        
        return isNicheValid && isServiceValid;
      });

      console.log('[useCheckoutValidation] Resultado da validação:', {
        allFieldsValid,
        itemCount: freshCheckoutItems.length,
        niche_placeholder: NICHE_OPTIONS.PLACEHOLDER,
        service_placeholder: SERVICE_OPTIONS.PLACEHOLDER
      });

      setAreAllFieldsSelected(allFieldsValid);
    } catch (error) {
      console.error('Erro ao validar campos:', error);
      setAreAllFieldsSelected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useCheckoutValidation] useEffect executado - configurando listeners');
    checkValidation();

    // Escutar evento de atualização da tabela de resumo
    const handleResumeTableUpdate = () => {
      console.log('[useCheckoutValidation] Evento recebido - revalidando campos');
      checkValidation();
    };

    window.addEventListener('resume-table-reload', handleResumeTableUpdate);
    window.addEventListener('niche-selection-changed', handleResumeTableUpdate);
    window.addEventListener('service-selection-changed', handleResumeTableUpdate);

    return () => {
      console.log('[useCheckoutValidation] Cleanup - removendo listeners');
      window.removeEventListener('resume-table-reload', handleResumeTableUpdate);
      window.removeEventListener('niche-selection-changed', handleResumeTableUpdate);
      window.removeEventListener('service-selection-changed', handleResumeTableUpdate);
    };
  }, []);

  return {
    areAllFieldsSelected,
    loading,
    revalidate: checkValidation
  };
}
