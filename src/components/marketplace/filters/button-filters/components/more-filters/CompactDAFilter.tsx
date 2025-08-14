/**
 * Versão compacta do filtro de DA para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de DA sem o botão
 */

import React from 'react';
import { useDAFilter } from '../../hooks/useDAFilter';
import { BaseRangeFilterItem } from '../base/BaseRangeFilterItem';

interface CompactDAFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

export const CompactDAFilter: React.FC<CompactDAFilterProps> = ({
  fields,
  onFilterChange
}) => {
  const {
    state,
    tempCustomRange,
    options,
    hasSelectedItems,
    toggleRange,
    setCustomRange,
    applyCustomRange,
    clearFilters,
    isDAValueFiltered
  } = useDAFilter();

  // Estabilizar função de callback para evitar loops
  const stableOnFilterChange = React.useCallback(onFilterChange || (() => {}), []);

  // Detectar automaticamente o campo DA
  const daField = React.useMemo(() => {
    // Primeiro, tentar os tipos específicos de DA
    let foundField = fields.find(field => field.field_type === 'moz_da') || 
           fields.find(field => field.field_type === 'domain_authority');
    
    // Se não encontrou, procurar por labels que contenham DA
    if (!foundField) {
      foundField = fields.find(field => {
        const label = field.label?.toLowerCase() || '';
        return label.includes('da') || label.includes('domain authority') || label.includes('moz da') || label === 'da';
      });
    }
    
    // Se ainda não encontrou, procurar por qualquer campo que contenha "da" no ID
    if (!foundField) {
      foundField = fields.find(field => {
        const id = field.id?.toLowerCase() || '';
        return id.includes('da') || id.includes('domain') || id.includes('moz');
      });
    }
    
    return foundField;
  }, [fields]);

  // Função auxiliar para extrair valor de DA
  const extractDAValue = React.useCallback((value: any): number | null => {
    try {
      if (value === null || value === undefined) return null;
      
      if (typeof value === 'number') return value;
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/,/g, '');
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Efeito para notificar mudanças no filtro
  React.useEffect(() => {
    if (daField) {
      const filterFn = (entry: any) => {
        // Verificação básica de tipo
        if (typeof entry !== 'object' || entry === null) {
          return true; // Incluir por segurança
        }
        
        // Se não há filtros ativos, mostrar todos
        if (!hasSelectedItems) {
          return true;
        }
        
        // Verificar se tem campo DA
        const values = entry.values || entry;
        const rawDAValue = values?.[daField.id];
        
        // Se não tem valor DA, mostrar
        if (rawDAValue === null || rawDAValue === undefined) {
          return true;
        }
        
        // Extrair valor numérico
        const daValue = extractDAValue(rawDAValue);
        
        if (daValue === null) {
          return true;
        }
        
        // Aplicar filtro real
        return isDAValueFiltered(daValue);
      };
      
      stableOnFilterChange(filterFn);
    }
  }, [
    JSON.stringify(state.selectedRanges),
    state.customRange.min,
    state.customRange.max,
    daField?.id,
    hasSelectedItems,
    stableOnFilterChange,
    extractDAValue,
    isDAValueFiltered
  ]);

  // Se não há campo DA, mostrar mensagem
  if (!daField) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Campo Domain Authority não encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Lista de intervalos */}
      <div className="space-y-1">
        {options.map((option) => (
          <BaseRangeFilterItem
            key={option.id}
            option={option}
            isSelected={state.selectedRanges.includes(option.id)}
            onSelect={toggleRange}
            showInfo={true}
          />
        ))}
      </div>

      {/* Intervalo personalizado */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Intervalo personalizado
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="De"
            value={tempCustomRange.min || ''}
            onChange={(e) => setCustomRange({ 
              min: Number(e.target.value) || null, 
              max: tempCustomRange.max 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Até"
            value={tempCustomRange.max || ''}
            onChange={(e) => setCustomRange({ 
              min: tempCustomRange.min, 
              max: Number(e.target.value) || null 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={applyCustomRange}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Aplicar
        </button>
      </div>

      {/* Botão limpar filtros */}
      {hasSelectedItems && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
