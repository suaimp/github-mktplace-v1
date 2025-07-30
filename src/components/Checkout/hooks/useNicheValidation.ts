import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { NICHE_OPTIONS } from "../constants/options";

export function useNicheValidation() {
  const [areAllNichesSelected, setAreAllNichesSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('[useNicheValidation] Hook iniciado/re-renderizado');

  const checkNicheValidation = async () => {
    try {
      setLoading(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setAreAllNichesSelected(false);
        setLoading(false);
        return;
      }

      // Forçar busca de dados frescos do banco, ignorando cache
      const timestamp = Date.now();
      console.log('[useNicheValidation] Buscando dados frescos:', { timestamp });
      
      const { data: freshCheckoutItems, error: fetchError } = await supabase
        .from('cart_checkout_resume')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('[useNicheValidation] Dados frescos do banco:', {
        error: fetchError,
        itemsCount: freshCheckoutItems?.length || 0,
        items: freshCheckoutItems?.map(item => ({
          id: item.id,
          niche_selected: item.niche_selected,
          niche_type: typeof item.niche_selected
        }))
      });
      
      if (fetchError) {
        console.error('[useNicheValidation] Erro ao buscar dados:', fetchError);
        setAreAllNichesSelected(false);
        setLoading(false);
        return;
      }

      if (!freshCheckoutItems || freshCheckoutItems.length === 0) {
        setAreAllNichesSelected(true); // Se não há itens, considera válido
        setLoading(false);
        return;
      }

      // Função auxiliar simplificada para verificar se um valor é válido
      const isValidNicheValue = (value: any): boolean => {
        // Se é null, undefined ou string vazia, é inválido
        if (!value || value === null || value === undefined) {
          return false;
        }
        
        // Se é string, verifica se não é o placeholder
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed !== '' && 
                 trimmed !== NICHE_OPTIONS.PLACEHOLDER && 
                 trimmed !== 'null' && 
                 trimmed !== 'undefined';
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

      // Verificar se todos os itens têm nicho válido selecionado
      const allNichesValid = freshCheckoutItems.every((item) => {
        const extractedValue = extractNicheValue(item.niche_selected);
        const isValid = isValidNicheValue(extractedValue);
        
        // Log detalhado para debug
        console.log('[useNicheValidation] Validando item:', {
          itemId: item.id,
          raw_niche_selected: item.niche_selected,
          extractedValue,
          placeholder: NICHE_OPTIONS.PLACEHOLDER,
          isPlaceholder: extractedValue === NICHE_OPTIONS.PLACEHOLDER,
          isValid,
          type: typeof item.niche_selected
        });
        
        return isValid;
      });

      console.log('[useNicheValidation] Resultado da validação:', {
        allNichesValid,
        itemCount: freshCheckoutItems.length,
        placeholderConstant: NICHE_OPTIONS.PLACEHOLDER
      });

      setAreAllNichesSelected(allNichesValid);
    } catch (error) {
      console.error('Erro ao validar nichos:', error);
      setAreAllNichesSelected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useNicheValidation] useEffect executado - configurando listeners');
    checkNicheValidation();

    // Escutar evento de atualização da tabela de resumo
    const handleResumeTableUpdate = () => {
      console.log('[useNicheValidation] Evento recebido - revalidando nichos');
      checkNicheValidation();
    };

    window.addEventListener('resume-table-reload', handleResumeTableUpdate);
    window.addEventListener('niche-selection-changed', handleResumeTableUpdate);

    return () => {
      console.log('[useNicheValidation] Cleanup - removendo listeners');
      window.removeEventListener('resume-table-reload', handleResumeTableUpdate);
      window.removeEventListener('niche-selection-changed', handleResumeTableUpdate);
    };
  }, []);

  return {
    areAllNichesSelected,
    loading,
    revalidate: checkNicheValidation
  };
}
