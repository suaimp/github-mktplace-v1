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
// Importar componentes de paginação específicos do marketplace
import { 
  useMarketplacePagination, 
  MarketplaceTableControls, 
  MarketplacePagination 
} from "./pagination";

interface MarketplaceTableProps {
  formId: string;
}

export default function MarketplaceTable({ formId }: MarketplaceTableProps) {
  const { favoriteEntryIds } = useFavorites();
  console.log(`🛒 [MarketplaceTable] === COMPONENT START === formId: "${formId}"`);
  
  const { items } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

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
    { id: 'todos', label: 'Todos' },
    { id: 'promocao', label: 'Promoção' },
    { id: 'favoritos', label: 'Favoritos' }
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
  }, [entries, searchTerm, sortState.field, sortState.direction, fields, activeTabId]);

  async function loadMarketplaceData() {
    console.log(`🛒 [MarketplaceTable] === LOAD START === formId: "${formId}"`);
    
    try {
      setLoading(true);
      setError("");

      console.log(`📋 [MarketplaceTable] Loading form fields for formId: ${formId}`);
      
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

      console.log(`✅ [MarketplaceTable] Loaded ${fieldsData?.length || 0} fields`);

      // Filter fields to only show those that should be visible in marketplace
      const visibleFields = fieldsData.filter((field) => {
        const settings = field.form_field_settings;
        if (settings?.visibility === "hidden" || settings?.visibility === "admin") {
          return false;
        }
        return true;
      });

      setFields(visibleFields);

      console.log(`📊 [MarketplaceTable] Loading entries for formId: ${formId}`);

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

      console.log(`✅ [MarketplaceTable] Raw entries data:`, entriesData);
      console.log(`📊 [MarketplaceTable] Loaded ${entriesData?.length || 0} VERIFIED entries for formId: ${formId}`);

      // Show status distribution (should only show "verificado" now)
      if (entriesData && entriesData.length > 0) {
        const statusCounts = entriesData.reduce((acc: any, entry: any) => {
          acc[entry.status] = (acc[entry.status] || 0) + 1;
          return acc;
        }, {});
        console.log(`📊 [MarketplaceTable] Status distribution (verified only):`, statusCounts);
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

      console.log(`🔄 [MarketplaceTable] Processed ${processedEntries.length} entries`);
      console.log(`📄 [MarketplaceTable] First processed entry:`, processedEntries[0]);

      setEntries(processedEntries);
    } catch (err) {
      console.error("❌ [MarketplaceTable] Error loading marketplace data:", err);
      setError("Erro ao carregar dados do marketplace");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectEntry = (entryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setSelectedEntries((prev) => {
      if (prev.includes(entryId)) {
        return prev.filter((id) => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (selectedEntries.length === filteredEntries.length && filteredEntries.length > 0) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((entry) => entry.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedEntries([]);
  };

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

  // Encontrar campo de categorias
  const categoryField = tableFields.find(field => 
    field.field_type === "categories" || field.field_type === "category"
  );

  // Encontrar campo de preço
  const priceField = tableFields.find(field => 
    field.field_type === "product"
  );

  // Filtro de campos para mobile: Site, Categorias, Preço
  const mobileFields = [siteField, categoryField, priceField].filter(Boolean);

  console.log(`🎯 [MarketplaceTable] Component state:`, {
    loading,
    error,
    entriesCount: entries.length,
    filteredEntriesCount: filteredEntries.length,
    fieldsCount: fields.length
  });

  if (loading) {
    return <MarketplaceTableSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (entries.length === 0) {
    return <MarketplaceTableEmpty message="Nenhum produto encontrado" />;
  }

  // Pagination
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log(`📄 [MarketplaceTable] Rendering with ${paginatedEntries.length} paginated entries`);

  return (
    <div className="w-full relative overflow-hidden">
      {selectedEntries.length > 0 && (
        <BulkSelectionBar
          selectedCount={selectedEntries.length}
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
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
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
                        checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="selectAll" className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
                        selectedEntries.length === filteredEntries.length && filteredEntries.length > 0
                          ? "border-brand-500 bg-brand-500"
                          : "bg-transparent border-gray-300 dark:border-gray-700"
                      }`}>
                        <span className={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0 ? "" : "opacity-0"}>
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
                <div className="xl:hidden contents">
                  {mobileFields.map((field) => {
                    if (!field) return null;
                    const settings = field.form_field_settings || {};
                    const displayName = settings.marketplace_label || field.label;
                    
                    return (
                      <th key={field.id} scope="col" className="text-left text-[13px] font-semibold text-gray-900 dark:text-white">
                        <span>{displayName}</span>
                      </th>
                    );
                  })}
                </div>

                {/* Cabeçalhos para desktop (xl e acima) - todas as colunas */}
                <div className="hidden xl:contents">
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
                        className={`text-left text-[13px] font-semibold text-gray-900 dark:text-white ${
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
                </div>

                {/* Botão de compra para mobile */}
                <div className="xl:hidden contents">
                  {buttonBuyField && (
                    <th scope="col" className="text-left text-[13px] font-semibold text-gray-900 dark:text-white">
                      <span>{buttonBuyField?.form_field_settings?.marketplace_label || buttonBuyField?.label}</span>
                    </th>
                  )}
                </div>

                {/* Botão de compra para desktop */}
                <div className="hidden xl:contents">
                  {buttonBuyField && (
                    <th
                      scope="col" 
                      className="sticky right-0 z-10 bg-gray-50 dark:bg-gray-800 text-left text-[13px] font-semibold text-gray-900 dark:text-white"
                      style={{ boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)' }}
                    >
                      <span>{buttonBuyField?.form_field_settings?.marketplace_label || buttonBuyField?.label}</span>
                    </th>
                  )}
                </div>
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
                    <div className="xl:hidden contents">
                      {mobileFields.map((field) => {
                        if (!field) return null;
                        
                        return (
                          <td key={field.id} className="text-[13px] text-gray-700 dark:text-gray-300 xl:whitespace-nowrap">
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
                                return formatMarketplaceValue(fieldValue, field.field_type, true);
                              })()}
                            </div>
                          </td>
                        );
                      })}
                    </div>

                    {/* Células para desktop (xl e acima) - todas as colunas */}
                    <div className="hidden xl:contents">
                      {tableFields.map((field) => {
                        return (
                          <td key={field.id} className="whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">
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
                                
                                // Para campos com métricas API, mostrar badge de score
                                if (["moz_da", "semrush_as", "ahrefs_dr"].includes(field.field_type)) {
                                  if (fieldValue === null || fieldValue === undefined) return "-";
                                  const numValue = parseInt(fieldValue.toString().replace(/,/g, ""));
                                  return (
                                    <div className="flex items-center">
                                      <span>{fieldValue}</span>
                                      {!isNaN(numValue) && (
                                        <ApiMetricBadge value={numValue} fieldType={field.field_type} />
                                      )}
                                    </div>
                                  );
                                }
                                
                                return formatMarketplaceValue(fieldValue, field.field_type, true);
                              })()}
                            </div>
                          </td>
                        );
                      })}
                    </div>

                    {/* Botão de compra para mobile */}
                    <div className="xl:hidden contents">
                      {buttonBuyField && (
                        <td className="text-[13px] xl:whitespace-nowrap">
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
                    </div>

                    {/* Botão de compra para desktop */}
                    <div className="hidden xl:contents">
                      {buttonBuyField && (
                        <td 
                          className="sticky right-0 z-10 whitespace-nowrap text-[13px]"
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
                    </div>
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
