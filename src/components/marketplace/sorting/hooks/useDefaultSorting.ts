/**
 * Hook para gerenciar ordenação padrão baseada em tipos de campo específicos
 * Responsabilidade: Determinar e aplicar ordenação padrão (DA em desc por padrão)
 */

import { useEffect, useCallback } from "react";
import { SortableField, SortDirection } from "../types";
import { FieldDetectionService } from "../services/FieldDetectionService";

export interface UseDefaultSortingProps {
  fields: SortableField[];
  onSortChange: (fieldId: string | null, direction: SortDirection) => void;
  currentSortField: string | null;
}

export function useDefaultSorting({
  fields,
  onSortChange,
  currentSortField
}: UseDefaultSortingProps) {
  
  /**
   * Aplica ordenação padrão baseada nos campos disponíveis
   * Prioridade: DA (desc) > Tráfego (desc) > Criação (desc)
   */
  const applyDefaultSorting = useCallback(() => {
    // Se já existe uma ordenação aplicada, não sobrescrever
    if (currentSortField) {
      return;
    }

    // 1. Tentar ordenar por DA (Domain Authority)
    const daField = FieldDetectionService.findDAField(fields);
    if (daField) {
      onSortChange(daField.id, "desc");
      return;
    }

    // 2. Fallback: tentar ordenar por campo de tráfego
    const trafficFields = FieldDetectionService.findTrafficFields(fields);
    if (trafficFields.length > 0) {
      // Usar o primeiro campo de tráfego encontrado
      onSortChange(trafficFields[0].id, "desc");
      return;
    }

    // 3. Fallback final: ordenar por data de criação (padrão)
    onSortChange("created_at", "desc");
  }, [fields, onSortChange, currentSortField]);

  /**
   * Aplica ordenação padrão quando os campos são carregados
   */
  useEffect(() => {
    if (fields.length > 0) {
      applyDefaultSorting();
    }
  }, [fields, applyDefaultSorting]);

  /**
   * Força reaplicação da ordenação padrão
   * Útil para reset manual ou mudanças de contexto
   */
  const resetToDefaultSorting = useCallback(() => {
    const daField = FieldDetectionService.findDAField(fields);
    if (daField) {
      onSortChange(daField.id, "desc");
    } else {
      onSortChange("created_at", "desc");
    }
  }, [fields, onSortChange]);

  return {
    resetToDefaultSorting,
    applyDefaultSorting
  };
}
