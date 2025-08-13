import { FilterGroup } from '../types';

// Ícone para categoria
export const FilterIcons = {
  category: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
};

export const generateMarketplaceFilterGroups = (entries: any[], fields: any[]): FilterGroup[] => {
  const filterGroups: FilterGroup[] = [];

  // Filtro de Categoria
  const categories = getCategoriesFromEntries(entries, fields);
  if (categories.length > 0) {
    filterGroups.push({
      id: 'category',
      label: 'Categoria',
      options: categories.map(category => ({
        id: category.id,
        label: category.label,
        value: category.value,
        icon: FilterIcons.category,
        count: category.count
      }))
    });
  }

  return filterGroups;
};

const getCategoriesFromEntries = (entries: any[], fields: any[]) => {
  // Usar exatamente a mesma lógica da tabela para identificar o campo de categorias
  const categoryField = fields.find(field => 
    field.field_type === "categories" || 
    field.field_type === "category" ||
    (field.field_type === "multiselect" && field.label?.toLowerCase().includes('categoria')) ||
    field.label?.toLowerCase().includes('categoria') ||
    field.label?.toLowerCase().includes('category') ||
    field.label?.toLowerCase().includes('nicho') ||
    field.label?.toLowerCase().includes('niche')
  );

  // Se não encontrar o campo de categorias, retornar vazio
  if (!categoryField) {
    return [];
  }

  const categoryCounts = new Map<string, number>();

  entries.forEach((entry) => {
    const value = entry.values[categoryField.id];
    
    if (value) {
      // Tentar diferentes formatos de dados
      let categories: string[] = [];
      
      if (Array.isArray(value)) {
        // Se é array, pode ser array de strings ou array de objetos
        categories = value.map(item => {
          if (typeof item === 'string') {
            return item.trim();
          } else if (typeof item === 'object' && item !== null) {
            // Se é objeto, tentar extrair propriedades comuns
            if (item.name) return item.name;
            else if (item.label) return item.label;
            else if (item.title) return item.title;
            else if (item.value) return item.value;
            else return item.toString();
          } else {
            return item.toString().trim();
          }
        });
      } else if (typeof value === 'string') {
        // Se é string, pode ser separada por vírgula, ponto e vírgula, ou pipe
        if (value.includes(',')) {
          categories = value.split(',').map(cat => cat.trim());
        } else if (value.includes(';')) {
          categories = value.split(';').map(cat => cat.trim());
        } else if (value.includes('|')) {
          categories = value.split('|').map(cat => cat.trim());
        } else {
          categories = [value.trim()];
        }
      } else if (typeof value === 'object' && value !== null) {
        // Se é objeto, tentar extrair propriedades comuns
        if (value.name) categories = [value.name];
        else if (value.label) categories = [value.label];
        else if (value.title) categories = [value.title];
        else if (value.value) categories = [value.value];
        else categories = [value.toString()];
      } else {
        categories = [value.toString().trim()];
      }

      // Contar cada categoria
      categories.forEach(category => {
        if (category && category.length > 0) {
          const cleanCategory = category.trim();
          if (cleanCategory) {
            categoryCounts.set(cleanCategory, (categoryCounts.get(cleanCategory) || 0) + 1);
          }
        }
      });
    }
  });

  const result = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      id: category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      label: category,
      value: category,
      count
    }))
    .sort((a, b) => b.count - a.count) // Ordenar por quantidade, descendente
    .slice(0, 15); // Limitar a 15 categorias principais

  return result;
};
