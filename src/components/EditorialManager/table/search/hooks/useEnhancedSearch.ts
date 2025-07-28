import { useMemo } from 'react';
import { FormEntry, FormField, SearchOptions } from '../types';
import { createSearchableFields, matchesSearchTerm } from '../utils/searchUtils';

interface UseEnhancedSearchProps {
  entries: FormEntry[];
  formFields: FormField[];
  searchTerm: string;
  options?: SearchOptions;
}

export const useEnhancedSearch = ({
  entries,
  formFields,
  searchTerm,
  options = {}
}: UseEnhancedSearchProps) => {
  const searchableFields = useMemo(
    () => createSearchableFields(formFields),
    [formFields]
  );

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;

    return entries.filter((entry) => {
      // Busca em todos os campos pesquisáveis
      return searchableFields.some((field) => {
        const fieldValue = field.accessor(entry);
        return matchesSearchTerm(
          fieldValue, 
          searchTerm, 
          options.exactMatch || false
        );
      });
    });
  }, [entries, searchTerm, searchableFields, options.exactMatch]);

  const searchStats = useMemo(() => {
    const total = entries.length;
    const filtered = filteredEntries.length;
    const hasFilter = searchTerm.trim().length > 0;
    
    return {
      total,
      filtered,
      hasFilter,
      hiddenCount: hasFilter ? total - filtered : 0
    };
  }, [entries.length, filteredEntries.length, searchTerm]);

  return {
    filteredEntries,
    searchableFields,
    searchStats
  };
};

export default useEnhancedSearch;
