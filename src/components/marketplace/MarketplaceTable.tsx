import { useState, useEffect } from "react";
import { isSortableField } from "./table/isSortableField";
import { supabase } from "../../lib/supabase";
import "./styles/MarketplaceTableStyles.css";

import AddToCartButton from "./AddToCartButton";
import { useCart } from "./ShoppingCartContext";
import MarketplaceTableSkeleton from "./MarketplaceTableSkeleton";
import MarketplaceTableEmpty from "./MarketplaceTableEmpty";
import { formatMarketplaceValue } from "./MarketplaceValueFormatter";
import BulkSelectionBar from "./BulkSelectionBar";
import { FavoriteStar } from "./favorite_sites/FavoriteStar";
import { useFavorites } from "./favorite_sites/context/FavoritesContext";
import ApiMetricBadge from "./ApiMetricBadge";
import { extractProductPrice } from "./actions/priceCalculator";
import PriceSimulationDisplay from "../EditorialManager/actions/PriceSimulationDisplay";
import MarketplaceTableTooltip from "./Tooltip/MarketplaceTableTooltip";
import { useTableState } from "./Tooltip/hooks/useTableState";
import MarketplaceRowDetailsModal from "./MarketplaceRowDetailsModal";
import { useMarketplaceSorting, sortEntries } from "./sorting";
import { useTabNavigation } from "../tables/TabNavigation";
import { BoltIcon, FireIcon, StarIcon } from "../../icons";
import { CellWithIcon } from "./cell-icons/components";
// Importar componentes de paginação específicos do marketplace
import { 
  useMarketplacePagination, 
  MarketplaceTableControls, 
  MarketplacePagination 
} from "./pagination";
// Importar sistema de seleção do marketplace
import { useMarketplaceSelection } from "./selection";
// Importar sistema de filtros
import { generateMarketplaceFilterGroups } from "./filters";

interface MarketplaceTableProps {
  formId: string;
}

export default function MarketplaceTable({ formId }: MarketplaceTableProps) {
  const { favoriteEntryIds } = useFavorites();
  
  const { items } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  // Estado para filtros
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Hook de paginação específico para marketplace
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  } = useMarketplacePagination({
    totalItems: filteredEntries.length,
    initialItemsPerPage: 100
  });
   
  // Definir tabs para filtros do marketplace
  const tabs = [
    { 
      id: 'todos', 
      label: 'Todos',
      icon: <BoltIcon className="w-4 h-4" />
    },
    { 
      id: 'promocao', 
      label: 'Promoção',
      icon: <FireIcon className="w-4 h-4" />
    },
    { 
      id: 'favoritos', 
      label: 'Favoritos',
      icon: <StarIcon className="w-4 h-4" />
    }
  ];

  // Hook para gerenciar as tabs
  const { activeTabId, handleTabChange } = useTabNavigation(tabs);
  
  // Hook personalizado para gerenciar ordenação com ordenação padrão por DA
  const { sortState, handleSort } = useMarketplaceSorting({
    fields: fields.map(field => ({
      id: field.id,
      field_type: field.field_type,
      label: field.label
    }))
  });
  
  // Hook para gerenciar o estado da tabela e tooltips
  const { tableLoaded } = useTableState({ entriesCount: entries.length });

  // Calcular entradas paginadas antes dos hooks de seleção
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hook de seleção com escopo por página - deve ser chamado sempre na mesma ordem
  const {
    selectedEntries,
    isAllSelected,
    selectedCount,
    handleSelectEntry,
    handleSelectAll,
    handleClearSelection
  } = useMarketplaceSelection({
    currentPageEntries: paginatedEntries,
    scope: 'page'
  });

  // Funções para o modal de detalhes
  const openDetailsModal = (entry: any) => {
    setSelectedEntry(entry);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEntry(null);
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [formId]);

  // Função para aplicar filtros customizados
  const applyCustomFilters = (entries: any[], filters: Record<string, string[]>, fields: any[]) => {
    if (Object.keys(filters).length === 0) return entries;

    console.log('🔥 [applyCustomFilters] INÍCIO - Total entries para filtrar:', entries.length);
    console.log('🔥 [applyCustomFilters] Filtros aplicados:', JSON.stringify(filters, null, 2));

    let processedCount = 0;
    let matchedCount = 0;

    const result = entries.filter(entry => {
      processedCount++;
      
      for (const [filterGroupId, filterValues] of Object.entries(filters)) {
        if (filterValues.length === 0) continue;

        let matchesFilter = false;

        if (filterGroupId === 'category') {
          // Usar a mesma lógica de identificação do campo de categorias da tabela
          let categoryField = fields.find(field => 
            field.field_type === "categories" || 
            field.field_type === "category" ||
            (field.field_type === "multiselect" && field.label?.toLowerCase().includes('categoria')) ||
            field.label?.toLowerCase().includes('categoria') ||
            field.label?.toLowerCase().includes('category') ||
            field.label?.toLowerCase().includes('nicho') ||
            field.label?.toLowerCase().includes('niche')
          );

          if (categoryField) {
            const entryValue = entry.values[categoryField.id];
            
            if (entryValue) {
              // Tentar diferentes formatos de dados
              let categories: string[] = [];
              
              if (Array.isArray(entryValue)) {
                // Se é array, pode ser array de strings ou array de objetos
                categories = entryValue.map(item => {
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
              } else if (typeof entryValue === 'string') {
                if (entryValue.includes(',')) {
                  categories = entryValue.split(',').map(cat => cat.trim());
                } else if (entryValue.includes(';')) {
                  categories = entryValue.split(';').map(cat => cat.trim());
                } else if (entryValue.includes('|')) {
                  categories = entryValue.split('|').map(cat => cat.trim());
                } else {
                  categories = [entryValue.trim()];
                }
              } else if (typeof entryValue === 'object' && entryValue !== null) {
                if (entryValue.name) categories = [entryValue.name];
                else if (entryValue.label) categories = [entryValue.label];
                else if (entryValue.title) categories = [entryValue.title];
                else if (entryValue.value) categories = [entryValue.value];
                else categories = [entryValue.toString()];
              } else {
                categories = [entryValue.toString().trim()];
              }

              console.log('🔥 [applyCustomFilters] categories processadas:', categories);

              // Verificar se alguma categoria corresponde ao filtro (case-insensitive + normalizada)
              for (const filterValue of filterValues) {
                console.log('🔥 [applyCustomFilters] Testando filterValue:', JSON.stringify(filterValue), 'contra categories:', JSON.stringify(categories));
                
                const match = categories.some(cat => {
                  const lowerCat = cat.toLowerCase();
                  const lowerFilter = filterValue.toLowerCase();
                  console.log('🔥 [applyCustomFilters] Comparando:', JSON.stringify(lowerCat), '===', JSON.stringify(lowerFilter), '=', lowerCat === lowerFilter);
                  
                  // Comparação case-insensitive
                  if (lowerCat === lowerFilter) {
                    return true;
                  }
                  
                  // Comparação normalizada (sem acentos)
                  const normalizedCat = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                  const normalizedFilter = filterValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                  console.log('🔥 [applyCustomFilters] Normalized:', JSON.stringify(normalizedCat), '===', JSON.stringify(normalizedFilter), '=', normalizedCat === normalizedFilter);
                  return normalizedCat === normalizedFilter;
                });
                
                if (match) {
                  matchesFilter = true;
                  matchedCount++;
                  console.log(`🔥 [applyCustomFilters] ✅ MATCH ENCONTRADO! Entry ${processedCount} - filterValue:`, filterValue, 'categories:', categories);
                  break;
                } else {
                  console.log('🔥 [applyCustomFilters] ❌ NO MATCH for filterValue:', filterValue, 'categories:', categories);
                }
              }
            }
          }
        }

        // Se não encontrou match para este grupo de filtro, excluir entry
        if (!matchesFilter) {
          return false;
        }
      }

      return true;
    });

    console.log('🔥 [applyCustomFilters] FIM - Processadas:', processedCount, 'Matched:', matchedCount, 'Result length:', result.length);
    return result;
  };

  // Filter and sort entries when dependencies change
  useEffect(() => {
    let result = [...entries];

    // Apply tab filter first
    if (activeTabId === 'promocao') {
      result = result.filter((entry) => {
        const productField = fields.find(f => f.field_type === 'product');
        if (productField) {
          const productData = entry.values[productField.id];
          if (productData && typeof productData === 'object') {
            const promotionalPrice = productData.promotional_price || productData.price_promotional;
            return promotionalPrice && parseFloat(promotionalPrice) > 0;
          }
        }
        return false;
      });
    } else if (activeTabId === 'favoritos') {
      // Filtrar apenas os entries que estão nos favoritos do usuário logado
      result = result.filter((entry) => favoriteEntryIds.includes(entry.id));
    }

    // Apply custom filters
    result = applyCustomFilters(result, selectedFilters, fields);

    // Apply search filter if search term exists
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((entry) => {
        return Object.entries(entry.values).some(([fieldId, value]) => {
          const field = fields.find((f) => f.id === fieldId);
          if (!field) return false;

          if (["text", "textarea", "email", "url"].includes(field.field_type)) {
            return String(value).toLowerCase().includes(lowerSearchTerm);
          }
          return false;
        });
      });
    }

    // Apply sorting if sort field is set
    if (sortState.field) {
      const sortField = fields.find(f => f.id === sortState.field);
      if (sortField) {
        result = sortEntries(result, sortField, sortState.direction);
      }
    }

    setFilteredEntries(result);
  }, [entries, searchTerm, sortState.field, sortState.direction, fields, activeTabId, selectedFilters]);

  async function loadMarketplaceData() {
    try {
      setLoading(true);
      setError("");

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(`*, form_field_settings (*)`)
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (fieldsError) {
        console.error(`❌ [MarketplaceTable] Error loading fields:`, fieldsError);
        throw fieldsError;
      }

      // Filter fields to only show those that should be visible in marketplace
      const visibleFields = fieldsData.filter((field) => {
        const settings = field.form_field_settings;
        
        if (settings?.visibility === "hidden" || settings?.visibility === "admin") {
          return false;
        }
        return true;
      });

      setFields(visibleFields);

      // Load form entries - ONLY VERIFIED ENTRIES
      const { data: entriesData, error: entriesError } = await supabase
        .from("form_entries")
        .select(`
          id,
          created_at,
          status,
          form_entry_values (
            field_id,
            value,
            value_json
          )
        `)
        .eq("form_id", formId)
        .eq("status", "verificado"); // FILTER FOR VERIFIED ENTRIES ONLY

      if (entriesError) {
        console.error(`❌ [MarketplaceTable] Error loading entries:`, entriesError);
        throw entriesError;
      }

      // Process entries to map values to fields
      const processedEntries = (entriesData || []).map((entry: any) => {
        const values: Record<string, any> = {};

        entry.form_entry_values.forEach((value: any) => {
          if (value.value_json !== null) {
            values[value.field_id] = value.value_json;
          } else {
            try {
              const parsedValue = JSON.parse(value.value);
              if (parsedValue && typeof parsedValue === "object") {
                values[value.field_id] = parsedValue;
              } else {
                values[value.field_id] = value.value;
              }
            } catch {
              values[value.field_id] = value.value;
            }
          }
        });

        return {
          id: entry.id,
          created_at: entry.created_at,
          status: entry.status,
          values,
        };
      });

      setEntries(processedEntries);
    } catch (err) {
      console.error("❌ [MarketplaceTable] Error loading marketplace data:", err);
      setError("Erro ao carregar dados do marketplace");
    } finally {
      setLoading(false);
    }
  }

  // Find product name and price fields
  const productNameField = fields.find(
    (field) => field.form_field_settings?.is_product_name === true
  );
  const productUrlField = fields.find(
    (field) => field.form_field_settings?.is_site_url === true
  );
  const productPriceField = fields.find(
    (field) => field.field_type === "product"
  );
  const commissionField = fields.find(
    (field) => field.field_type === "commission"
  );

  // Find button buy field that should be positioned in last column
  const buttonBuyField = fields.find(
    (field) =>
      field.field_type === "button_buy" &&
      field.form_field_settings?.position_last_column === true
  );

  // Filter fields to exclude button_buy field if it's positioned in last column
  const tableFields = buttonBuyField
    ? fields.filter((field) => field.id !== buttonBuyField.id)
    : fields;

  // Encontrar campo de site/URL
  const siteField = tableFields.find(field => 
    field.field_type === "url" || field.field_type === "site_url"
  );

  // Encontrar campo de categorias - usar a lógica mais flexível baseada nos logs
  const categoryField = tableFields.find(field => 
    field.field_type === "categories" || 
    field.field_type === "category" ||
    (field.field_type === "multiselect" && field.label?.toLowerCase().includes('categoria')) ||
    field.label?.toLowerCase().includes('categoria') ||
    field.label?.toLowerCase().includes('category') ||
    field.label?.toLowerCase().includes('nicho') ||
    field.label?.toLowerCase().includes('niche')
  );

  // Encontrar campo de preço
  const priceField = tableFields.find(field => 
    field.field_type === "product"
  );

  // Filtro de campos para mobile: Site, Categorias, Preço
  const mobileFields = [siteField, categoryField, priceField].filter(Boolean);

  if (loading) {
    return <MarketplaceTableSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (entries.length === 0) {
    return <MarketplaceTableEmpty message="Nenhum produto encontrado" />;
  }

  return (
    <div className="w-full relative overflow-hidden">
      {selectedEntries.length > 0 && (
        <BulkSelectionBar
          selectedCount={selectedCount}
          onClear={handleClearSelection}
          selectedEntries={selectedEntries}
          productNameField={productNameField}
          productPriceField={productPriceField}
          productUrlField={productUrlField}
          entries={entries}
          fields={fields}
        />
      )}

      <div className="w-full bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Table Controls - Usando componentes modulares */}
        <MarketplaceTableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          filterGroups={generateMarketplaceFilterGroups(entries, fields)}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />

        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">            
          <table className="marketplace-table w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="w-10 text-left text-[13px] font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center justify-start gap-1">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="selectAll"
                        className="sr-only"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="selectAll" className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
                        isAllSelected
                          ? "border-brand-500 bg-brand-500"
                          : "bg-transparent border-gray-300 dark:border-gray-700"
                      }`}>
                        <span className={isAllSelected ? "" : "opacity-0"}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                    {/* StarIcon removido do cabeçalho */}
                  </div>
                </th>
                
                {/* Cabeçalhos para mobile (menor que xl) - apenas colunas essenciais */}
                {mobileFields.map((field) => {
                  if (!field) return null;
                  const settings = field.form_field_settings || {};
                  const displayName = settings.marketplace_label || field.label;
                  
                  return (
                    <th key={field.id} scope="col" className="xl:hidden text-left text-[13px] font-semibold text-gray-900 dark:text-white">
                      <span>{displayName}</span>
                    </th>
                  );
                })}

                {/* Cabeçalhos para desktop (xl e acima) - todas as colunas */}
                {tableFields.map((field) => {
                  const settings = field.form_field_settings || {};
                  const displayName = settings.marketplace_label || field.label;
                  const isSortable = isSortableField(field);

                  // Definições de tooltip por campo
                  let tooltipText = "";
                  let showTooltip = true;
                  
                  const helptext = settings.helptext || settings.help_text || field.helptext || field.help_text;
                  if (typeof helptext === 'string' && helptext.trim() !== '') {
                    tooltipText = helptext;
                  } else {
                    switch (field.field_type) {
                      case "brand":
                        tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        break;
                      case "country":
                        tooltipText = "País: País de origem ou audiência.";
                        break;
                      case "moz_da":
                        tooltipText = "DA: Pontuação de autoridade do domínio (Moz).";
                        break;
                      case "ahrefs_traffic":
                      case "similarweb_traffic":
                      case "google_traffic":
                      case "semrush_as":
                        tooltipText = "Tráfego: Número estimado de visitantes.";
                        break;
                      case "categories":
                      case "category":
                        tooltipText = "Categorias: Tópicos principais do site.";
                        break;
                      case "links":
                        tooltipText = "Quantidade de Links: Número de links (internos ou externos).";
                        break;
                      case "product":
                        tooltipText = "Preço do Artigo: Custo para publicar um artigo.";
                        break;
                      case "site_url":
                      case "url":
                        showTooltip = false;
                        break;
                      case "toggle":
                        tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        break;
                      default:
                        if (displayName && displayName.toLowerCase().includes("site")) {
                          showTooltip = false;
                        } else if (displayName && displayName.toLowerCase().includes("comprar")) {
                          showTooltip = false;
                        } else if (displayName && displayName.toLowerCase().includes("categoria")) {
                          tooltipText = "Categorias: Tópicos principais do site.";
                        } else if (displayName && displayName.toLowerCase().includes("marca")) {
                          tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        } else if (displayName && displayName.toLowerCase().includes("link")) {
                          tooltipText = "Quantidade de Links: Número de links (internos ou externos).";
                        }
                        break;
                    }
                  }

                  return (
                    <th
                      key={field.id}
                      scope="col"
                      className={`hidden xl:table-cell text-left text-[13px] font-semibold text-gray-900 dark:text-white ${
                        isSortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" : ""
                      }`}
                      onClick={isSortable ? () => handleSort(field.id) : undefined}
                    >
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex items-center justify-start">
                          <div className="flex items-center gap-1">
                            {field.field_type === "niche" ? (
                              <div className="flex items-center gap-1">
                                <span>{displayName}</span>
                                <MarketplaceTableTooltip 
                                  text={"O Site recusará ofertas para artigos relacionados a nichos diferentes dos itens destacados nesta coluna."} 
                                  tableLoaded={tableLoaded}
                                  entriesCount={entries.length}
                                />
                              </div>
                            ) : (
                              <>
                                <span>{displayName}</span>
                                {showTooltip && (
                                  <MarketplaceTableTooltip 
                                    text={tooltipText} 
                                    tableLoaded={tableLoaded}
                                    entriesCount={entries.length}
                                  />
                                )}
                              </>
                            )}
                          </div>
                          {isSortable && (
                            <span className="flex flex-col gap-0.5 ml-1">
                              <svg
                                className={`${
                                  sortState.field === field.id && sortState.direction === 'asc' 
                                    ? 'fill-brand-500 dark:fill-brand-400' 
                                    : 'fill-gray-300 dark:fill-gray-700'
                                }`}
                                width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""></path>
                              </svg>
                              <svg
                                className={`${
                                  sortState.field === field.id && sortState.direction === 'desc' 
                                    ? 'fill-brand-500 dark:fill-brand-400' 
                                    : 'fill-gray-300 dark:fill-gray-700'
                                }`}
                                width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""></path>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Botão de compra para mobile */}
                {buttonBuyField && (
                  <th scope="col" className="xl:hidden text-left text-[13px] font-semibold text-gray-900 dark:text-white">
                    <span>{buttonBuyField?.form_field_settings?.marketplace_label || buttonBuyField?.label}</span>
                  </th>
                )}

                {/* Botão de compra para desktop */}
                {buttonBuyField && (
                  <th
                    scope="col" 
                    className="hidden xl:table-cell sticky right-0 z-10 bg-gray-50 dark:bg-gray-800 text-left text-[13px] font-semibold text-gray-900 dark:text-white"
                    style={{ boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)' }}
                  >
                    <span>{buttonBuyField?.form_field_settings?.marketplace_label || buttonBuyField?.label}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {paginatedEntries.map((entry) => {
                const productName = productNameField ? entry.values[productNameField.id] : "Product";
                let productUrl = productUrlField ? entry.values[productUrlField.id] : "";
                if (typeof productUrl !== 'string') productUrl = "";
                const productPrice = extractProductPrice(entry, productPriceField);
                const isInCart = items.some((item) => item.entry_id === entry.id);
                const entryId = `checkbox-${entry.id}`;

                return (
                  <tr
                    key={entry.id}
                    className={`cursor-pointer xl:cursor-auto ${
                      selectedEntries.includes(entry.id) ? "bg-brand-50 dark:bg-brand-900/10" : ""
                    }`}
                    onClick={(e) => {
                      if (window.innerWidth < 1280) {
                        if (!(e.target as HTMLElement).closest('input, label')) {
                          openDetailsModal(entry);
                        }
                      }
                    }}
                  >
                    <td className="whitespace-nowrap text-[13px]">
                      <div className="flex items-center justify-start gap-1">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={entryId}
                            className="sr-only"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={(e) => handleSelectEntry(entry.id, e)}
                          />
                          <label htmlFor={entryId} className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
                            selectedEntries.includes(entry.id)
                              ? "border-brand-500 bg-brand-500"
                              : "bg-transparent border-gray-300 dark:border-gray-700"
                          }`}>
                            <span className={selectedEntries.includes(entry.id) ? "" : "opacity-0"}>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </span>
                          </label>
                        </div>
                        <FavoriteStar entryId={entry.id} />
                      </div>
                    </td>
                    
                    {/* Células para mobile (menor que xl) - apenas campos essenciais */}
                    {mobileFields.map((field) => {
                      if (!field) return null;
                      
                      return (
                        <td key={field.id} className="xl:hidden text-[13px] text-gray-700 dark:text-gray-300 xl:whitespace-nowrap">
                          <div className="flex items-center justify-start">
                            {(() => {
                              const fieldValue = entry.values[field.id];
                              if (field.field_type === "product") {
                                const commissionValue = commissionField ? parseFloat(entry.values[commissionField.id]) || 0 : 0;
                                return (
                                  <PriceSimulationDisplay
                                    commission={commissionValue}
                                    productData={fieldValue}
                                    layout="inline"
                                    showMarginBelow={false}
                                    showOriginalPrice={true}
                                  />
                                );
                              }
                              
                              // Verificação direta para valores "Sim" e "Não" - aplicar badge diretamente (MOBILE)
                              if (fieldValue === 'Sim' || fieldValue === 'Não') {
                                const badgeClass = fieldValue === 'Sim' ? 'badge-sponsored-yes' : 'badge-sponsored-no';
                                return (
                                  <CellWithIcon 
                                    fieldType={field.field_type} 
                                    fieldLabel={field.label}
                                  >
                                    <span className={badgeClass}>
                                      {fieldValue}
                                    </span>
                                  </CellWithIcon>
                                );
                              }
                              
                              const formattedValue = formatMarketplaceValue(fieldValue, field.field_type, true, field.label);
                              return (
                                <CellWithIcon 
                                  fieldType={field.field_type} 
                                  fieldLabel={field.label}
                                >
                                  {formattedValue}
                                </CellWithIcon>
                              );
                            })()}
                          </div>
                        </td>
                      );
                    })}

                    {/* Células para desktop (xl e acima) - todas as colunas */}
                    {tableFields.map((field) => {
                      return (
                        <td key={field.id} className="hidden xl:table-cell whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">
                          <div className="flex items-center justify-start">
                            {(() => {
                              const fieldValue = entry.values[field.id];
                              
                              // Verificação para valores "Sim" e "Não" - aplicar badge diretamente
                              const normalizedValue = fieldValue?.toString().trim();
                              if (normalizedValue === 'Sim' || normalizedValue === 'Não') {
                                const badgeClass = normalizedValue === 'Sim' ? 'badge-sponsored-yes' : 'badge-sponsored-no';
                                return (
                                  <CellWithIcon 
                                    fieldType={field.field_type} 
                                    fieldLabel={field.label}
                                  >
                                    <span className={badgeClass}>
                                      {normalizedValue}
                                    </span>
                                  </CellWithIcon>
                                );
                              }

                              if (fieldValue === 'Sim' || fieldValue === 'Não') {
                                const badgeClass = fieldValue === 'Sim' ? 'badge-sponsored-yes' : 'badge-sponsored-no';
                                return (
                                  <CellWithIcon 
                                    fieldType={field.field_type} 
                                    fieldLabel={field.label}
                                  >
                                    <span className={badgeClass}>
                                      {fieldValue}
                                    </span>
                                  </CellWithIcon>
                                );
                              }
                              
                              if (field.field_type === "product") {
                                const commissionValue = commissionField ? parseFloat(entry.values[commissionField.id]) || 0 : 0;
                                return (
                                  <PriceSimulationDisplay
                                    commission={commissionValue}
                                    productData={fieldValue}
                                    layout="inline"
                                    showMarginBelow={false}
                                    showOriginalPrice={true}
                                  />
                                );
                              }
                              
                              // Para campos com métricas API, mostrar badge de score
                              if (["moz_da", "semrush_as", "ahrefs_dr"].includes(field.field_type)) {
                                if (fieldValue === null || fieldValue === undefined) return "-";
                                const numValue = parseInt(fieldValue.toString().replace(/,/g, ""));
                                return (
                                  <CellWithIcon 
                                    fieldType={field.field_type} 
                                    fieldLabel={field.label}
                                  >
                                    <div className="flex items-center">
                                      <span>{fieldValue}</span>
                                      {!isNaN(numValue) && (
                                        <ApiMetricBadge value={numValue} fieldType={field.field_type} />
                                      )}
                                    </div>
                                  </CellWithIcon>
                                );
                              }
                              
                              const formattedValue = formatMarketplaceValue(fieldValue, field.field_type, true, field.label);
                              return (
                                <CellWithIcon 
                                  fieldType={field.field_type} 
                                  fieldLabel={field.label}
                                >
                                  {formattedValue}
                                </CellWithIcon>
                              );
                            })()}
                          </div>
                        </td>
                      );
                    })}

                    {/* Botão de compra para mobile */}
                    {buttonBuyField && (
                      <td className="xl:hidden text-[13px] xl:whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <AddToCartButton
                            entryId={entry.id}
                            productName={productName}
                            price={productPrice}
                            url={productUrl}
                            isInCart={isInCart}
                            buttonStyle="outline"
                          />
                        </div>
                      </td>
                    )}

                    {/* Botão de compra para desktop */}
                    {buttonBuyField && (
                      <td 
                        className="hidden xl:table-cell sticky right-0 z-10 whitespace-nowrap text-[13px]"
                        style={{ boxShadow: 'rgba(0, 0, 0, 0.05) -2px 0px 4px' }}
                      >
                        <div className="flex items-center justify-start">
                          <AddToCartButton
                            entryId={entry.id}
                            productName={productName}
                            price={productPrice}
                            url={productUrl}
                            isInCart={isInCart}
                            buttonStyle="outline"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - Usando componente modular */}
        <MarketplacePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEntries.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Modal de detalhes para mobile */}
      <MarketplaceRowDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        entry={selectedEntry}
        fields={tableFields}
        productNameField={productNameField}
      />
    </div>
  );
}
