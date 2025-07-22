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
import ApiMetricBadge from "./ApiMetricBadge";
import { extractProductPrice } from "./actions/priceCalculator";
import PriceSimulationDisplay from "../EditorialManager/actions/PriceSimulationDisplay";
import MarketplaceTableTooltip from "./Tooltip/MarketplaceTableTooltip";
import { useTableState } from "./Tooltip/hooks/useTableState";
import MarketplaceRowDetailsModal from "./MarketplaceRowDetailsModal";
import { useSorting, sortEntries } from "./sorting";

interface MarketplaceTableProps {
  formId: string;
}

export default function MarketplaceTable({ formId }: MarketplaceTableProps) {
  const { items } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // @ts-ignore
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Estado para o modal de detalhes
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  // Estado para detectar modo escuro
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Hook personalizado para gerenciar ordenação
  const { sortState, handleSort } = useSorting();
  
  // Hook para gerenciar o estado da tabela e tooltips
  const { tableLoaded } = useTableState({ entriesCount: entries.length });

  // Calculate total pages
  const totalPages = Math.ceil(filteredEntries.length / ordersPerPage);

  // Ensure current page is valid
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

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

  // Detectar mudanças no modo escuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Verificar inicialmente
    checkDarkMode();

    // Observar mudanças na classe dark do html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Filter and sort entries when dependencies change
  useEffect(() => {
    let result = [...entries];

    // Apply search filter if search term exists
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((entry) => {
        // Search in all text fields
        return Object.entries(entry.values).some(([fieldId, value]) => {
          const field = fields.find((f) => f.id === fieldId);
          if (!field) return false;

          // Only search in text-based fields
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
  }, [entries, searchTerm, sortState.field, sortState.direction, fields]);

  async function loadMarketplaceData() {
    try {
      setLoading(true);
      setError("");

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (*)
        `
        )
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (fieldsError) throw fieldsError;

      // Find sort field if any and initialize sorting
      const sortFieldData = fieldsData.find(
        (field) => field.form_field_settings?.sort_by_field === true
      );

      // Initialize sorting with the default field if found
      if (sortFieldData && !sortState.field) {
        // Usando um useEffect separado para não afetar este carregamento inicial
        setTimeout(() => {
          handleSort(sortFieldData.id);
        }, 0);
      }

      // Filter fields to only show those that should be visible in marketplace
      const visibleFields = fieldsData.filter((field) => {
        const settings = field.form_field_settings;

        // Skip fields with visibility = 'hidden' or 'admin'
        if (
          settings?.visibility === "hidden" ||
          settings?.visibility === "admin"
        ) {
          return false;
        }

        // Include fields with visibility = 'marketplace' or 'visible'
        return true;
      });

      setFields(visibleFields);

      // Load verified form entries
      const { data: entriesData, error: entriesError } = await supabase
        .from("form_entries")
        .select(
          `
          id,
          created_at,
          status,
          form_entry_values (
            field_id,
            value,
            value_json
          )
        `
        )
        .eq("form_id", formId)
        .eq("status", "verificado");

      if (entriesError) throw entriesError;

      // Process entries to map values to fields
      const processedEntries = (entriesData || []).map((entry: any) => {
        const values: Record<string, any> = {};

        entry.form_entry_values.forEach((value: any) => {
          if (value.value_json !== null) {
            values[value.field_id] = value.value_json;
          } else {
            // Verifica se value.value contém um objeto com promotional_price ou price
            try {
              const parsedValue = JSON.parse(value.value);

              if (parsedValue && typeof parsedValue === "object") {
                // Para campos do tipo product, preserva o objeto completo
                // Verifica se tem price ou promotional_price para ser um produto
                if (parsedValue.price || parsedValue.promotional_price) {
                  values[value.field_id] = parsedValue;
                } else {
                  values[value.field_id] = parsedValue;
                }
              } else {
                values[value.field_id] = value.value;
              }
            } catch {
              // Se não conseguir fazer parse, usa o valor original
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
      console.error("Error loading marketplace data:", err);
      setError("Error loading marketplace data");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectEntry = (
    entryId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    if (
      selectedEntries.length === filteredEntries.length &&
      filteredEntries.length > 0
    ) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((entry) => entry.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedEntries([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOrdersPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOrdersPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
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

  if (loading) {
    return <MarketplaceTableSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-error-500">{error}</div>;
  }

  if (entries.length === 0) {
    return <MarketplaceTableEmpty message="Nenhum produto encontrado" />;
  }

  // Pagination
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Render API metric with score badge
  const renderApiMetricWithBadge = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return "-";

    // Parse value to number if possible
    const numValue = parseInt(value.toString().replace(/,/g, ""));

    return (
      <div className="flex items-center">
        <span>{value}</span>
        {!isNaN(numValue) &&
          ["moz_da", "semrush_as", "ahrefs_dr"].includes(fieldType) && (
            <ApiMetricBadge value={numValue} fieldType={fieldType} />
          )}
      </div>
    );
  };

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
        />
      )}

      <div className="w-full bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Table Controls */}
        <div className="w-full flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400 text-[8px]">Mostrar</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-[8px] text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={ordersPerPage}
                onChange={handleOrdersPerPageChange}
              >
                <option
                  value="10"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  10
                </option>
                <option
                  value="25"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  25
                </option>
                <option
                  value="50"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  50
                </option>
                <option
                  value="100"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  100
                </option>
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-[8px]">entradas</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  ></path>
                </svg>
              </button>
              <input
                placeholder="Pesquisar..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-[8px] text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div 
          className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar" 
          style={{ 
            maxWidth: '100%',
            overflowY: 'hidden'
          }}
        >            <table 
              className="marketplace-table w-full divide-y divide-gray-200 dark:divide-gray-800"
            >
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="w-10 text-left text-[8px] font-semibold text-gray-900 dark:text-white"
                >
                  <div className="flex items-center justify-start">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="selectAll"
                        className="sr-only"
                        checked={
                          selectedEntries.length === filteredEntries.length &&
                          filteredEntries.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                      <label
                        htmlFor="selectAll"
                        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
                          selectedEntries.length === filteredEntries.length &&
                          filteredEntries.length > 0
                            ? "border-brand-500 bg-brand-500"
                            : "bg-transparent border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <span
                          className={
                            selectedEntries.length === filteredEntries.length &&
                            filteredEntries.length > 0
                              ? ""
                              : "opacity-0"
                          }
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                              stroke="white"
                              strokeWidth="1.94437"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                  </div>
                </th>
                
                {/* Cabeçalhos para mobile (menor que xl) - apenas colunas essenciais */}
                <div className="xl:hidden contents">
                  {mobileFields.map((field) => {
                    if (!field) return null;
                    const settings = field.form_field_settings || {};
                    const displayName = settings.marketplace_label || field.label;
                    
                    return (
                      <th
                        key={field.id}
                        scope="col"
                        className="text-left text-[8px] font-semibold text-gray-900 dark:text-white cursor-pointer"
                      >
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
                  // Só usa o helptext se for string não vazia
                  const helptext = settings.helptext || settings.help_text || field.helptext || field.help_text;
                  if (typeof helptext === 'string' && helptext.trim() !== '') {
                    tooltipText = helptext;
                  } else {
                    switch (field.field_type) {
                      case "brand":
                        tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        break;
                      case "niche":
                        // Mantém a descrição atual via renderNicheHeader
                        break;
                      case "country":
                        tooltipText = "País: País de origem ou audiência.";
                        break;
                      case "moz_da":
                        tooltipText =
                          "DA: Pontuação de autoridade do domínio (Moz).";
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
                        tooltipText =
                          "Quantidade de Links: Número de links (internos ou externos).";
                        break;
                      case "product":
                        tooltipText =
                          "Preço do Artigo: Custo para publicar um artigo.";
                        break;
                      case "site_url":
                      case "url":
                        showTooltip = false;
                        break;
                      case "toggle":
                        tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        break;
                      default:
                        if (
                          displayName &&
                          displayName.toLowerCase().includes("site")
                        ) {
                          showTooltip = false;
                        } else if (
                          displayName &&
                          displayName.toLowerCase().includes("comprar")
                        ) {
                          showTooltip = false;
                        } else if (
                          displayName &&
                          displayName.toLowerCase().includes("categoria")
                        ) {
                          tooltipText = "Categorias: Tópicos principais do site.";
                        } else if (
                          displayName &&
                          displayName.toLowerCase().includes("marca")
                        ) {
                          tooltipText =
                            "Artigo Patrocinado: será em forma de publicidade.";
                        } else if (
                          displayName &&
                          displayName.toLowerCase().includes("link")
                        ) {
                          tooltipText =
                            "Quantidade de Links: Número de links (internos ou externos).";
                        }
                        break;
                    }
                  }

                  // Garante que o tooltip nunca fique vazio
                  if (showTooltip && (!tooltipText || tooltipText.trim() === "")) {
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
                      case "toggle":
                        tooltipText = "Artigo Patrocinado: será em forma de publicidade.";
                        break;
                    }
                  }

                  return (
                    <th
                      key={field.id}
                      scope="col"
                      className={`text-left text-[8px] font-semibold text-gray-900 dark:text-white ${
                        isSortable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          : ""
                      }`}
                      onClick={
                        isSortable ? () => handleSort(field.id) : undefined
                      }
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
                              {/* Seta para cima (ASC) */}
                              <svg
                                className={`
                                  ${sortState.field === field.id && sortState.direction === 'asc' 
                                    ? 'fill-brand-500 dark:fill-brand-400' 
                                    : 'fill-gray-300 dark:fill-gray-700'
                                  }
                                `}
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                                  fill=""
                                ></path>
                              </svg>

                              {/* Seta para baixo (DESC) */}
                              <svg
                                className={`
                                  ${sortState.field === field.id && sortState.direction === 'desc' 
                                    ? 'fill-brand-500 dark:fill-brand-400' 
                                    : 'fill-gray-300 dark:fill-gray-700'
                                  }
                                `}
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                                  fill=""
                                ></path>
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
                    <th
                      scope="col"
                      className="text-left text-[8px] font-semibold text-gray-900 dark:text-white"
                    >
                      <span>
                        {buttonBuyField.form_field_settings?.marketplace_label ||
                          buttonBuyField.label}
                      </span>
                    </th>
                  )}
                </div>

                {/* Botão de compra para desktop */}
                <div className="hidden xl:contents">
                  {buttonBuyField && (
                    <th
                      scope="col" 
                      className="sticky right-0 z-10 bg-gray-50 dark:bg-gray-800 text-left text-[8px] font-semibold text-gray-900 dark:text-white"
                      style={{ 
                        boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>
                        {buttonBuyField.form_field_settings?.marketplace_label ||
                          buttonBuyField.label}
                      </span>
                    </th>
                  )}
                </div>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {paginatedEntries.map((entry) => {
                // Get product name, URL and price for the entry
                const productName = productNameField
                  ? entry.values[productNameField.id]
                  : "Product";
                let productUrl = productUrlField
                  ? entry.values[productUrlField.id]
                  : "";

                // Usar a nova função para calcular o preço
                const productPrice = extractProductPrice(
                  entry,
                  productPriceField
                );

                // Check if item is in cart
                const isInCart = items.some(
                  (item) => item.entry_id === entry.id
                );
                const entryId = `checkbox-${entry.id}`;

                return (
                  <tr
                    key={entry.id}
                    className={`cursor-pointer xl:cursor-auto ${
                      selectedEntries.includes(entry.id)
                        ? "bg-brand-50 dark:bg-brand-900/10"
                        : ""
                    }`}
                    onClick={(e) => {
                      // Só ativa o modal em telas menores que xl
                      if (window.innerWidth < 1280) {
                        // Previne que o clique no checkbox ative o modal
                        if (!(e.target as HTMLElement).closest('input, label')) {
                          openDetailsModal(entry);
                        }
                      }
                    }}
                  >
                    <td className="whitespace-nowrap text-[8px]">
                      <div className="flex items-center justify-start">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={entryId}
                            className="sr-only"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={(e) => handleSelectEntry(entry.id, e)}
                          />
                          <label
                            htmlFor={entryId}
                            className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 ${
                              selectedEntries.includes(entry.id)
                                ? "border-brand-500 bg-brand-500"
                                : "bg-transparent border-gray-300 dark:border-gray-700"
                            }`}
                          >
                            <span
                              className={
                                selectedEntries.includes(entry.id)
                                  ? ""
                                  : "opacity-0"
                              }
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                  stroke="white"
                                  strokeWidth="1.94437"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </span>
                          </label>
                        </div>
                      </div>
                    </td>
                    
                    {/* Células para mobile (menor que xl) - apenas campos essenciais */}
                    <div className="xl:hidden contents">
                      {mobileFields.map((field) => {
                        if (!field) return null;
                        
                        return (
                          <td
                            key={field.id}
                            className="text-[8px] text-gray-700 dark:text-gray-300 xl:whitespace-nowrap"
                          >
                            <div className="flex items-center justify-start">
                              {(() => {
                                const fieldValue = entry.values[field.id];
                                if (field.field_type === "product") {
                                  const commissionValue = commissionField
                                    ? parseFloat(entry.values[commissionField.id]) || 0
                                    : 0;
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
                                return formatMarketplaceValue(
                                  fieldValue,
                                  field.field_type,
                                  true
                                );
                              })()}
                            </div>
                          </td>
                        );
                      })}
                    </div>

                    {/* Células para desktop (xl e acima) - todos os campos */}
                    <div className="hidden xl:contents">
                      {tableFields.map((field) => {
                        // Special handling for API metric fields with score badges
                        if (
                          ["moz_da", "semrush_as", "ahrefs_dr"].includes(
                            field.field_type
                          )
                        ) {
                          return (
                            <td
                              key={field.id}
                              className="whitespace-nowrap text-[8px] text-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center justify-start">
                                {renderApiMetricWithBadge(
                                  entry.values[field.id],
                                  field.field_type
                                )}
                              </div>
                            </td>
                          );
                        }

                        // Regular field rendering
                        if (field.field_type === "niche") {
                          return (
                            <td
                              key={field.id}
                              className="whitespace-nowrap text-[8px] text-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center justify-start">
                                {formatMarketplaceValue(entry.values[field.id], field.field_type, true)}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={field.id}
                            className="whitespace-nowrap text-[8px] text-gray-700 dark:text-gray-300"
                          >
                            <div className="flex items-center justify-start">
                              {(() => {
                                const fieldValue = entry.values[field.id];
                                if (field.field_type === "product") {
                                  const commissionValue = commissionField
                                    ? parseFloat(entry.values[commissionField.id]) || 0
                                    : 0;
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
                                return formatMarketplaceValue(
                                  fieldValue,
                                  field.field_type,
                                  true
                                );
                              })()}
                            </div>
                          </td>
                        );
                      })}
                    </div>

                    {/* Botão de compra para mobile */}
                    <div className="xl:hidden contents">
                      {buttonBuyField && (
                        <td className="text-[8px] xl:whitespace-nowrap">
                          <div className="flex items-center justify-start">
                            <AddToCartButton
                              entryId={entry.id}
                              productName={productName}
                              price={productPrice}
                              url={productUrl}
                              buttonStyle={
                                buttonBuyField.form_field_settings?.button_style ||
                                "primary"
                              }
                              buttonText={
                                buttonBuyField.form_field_settings
                                  ?.custom_button_text
                                  ? buttonBuyField.form_field_settings?.button_text
                                  : buttonBuyField.label
                              }
                              isInCart={isInCart}
                            />
                          </div>
                        </td>
                      )}
                    </div>

                    {/* Botão de compra para desktop */}
                    <div className="hidden xl:contents">
                      {buttonBuyField && (
                        <td 
                          className="sticky right-0 z-10 whitespace-nowrap text-[8px]"
                          style={{ 
                            backgroundColor: isDarkMode ? 'rgb(17, 24, 39)' : 'rgb(252, 252, 253)', /* ainda mais sutil */
                            boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <div className="flex items-center justify-start">
                            <AddToCartButton
                              entryId={entry.id}
                              productName={productName}
                              price={productPrice}
                              url={productUrl}
                              buttonStyle={
                                buttonBuyField.form_field_settings?.button_style ||
                                "primary"
                              }
                              buttonText={
                                buttonBuyField.form_field_settings
                                  ?.custom_button_text
                                  ? buttonBuyField.form_field_settings?.button_text
                                  : buttonBuyField.label
                              }
                              isInCart={isInCart}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
            <div className="flex items-center">
              <p className="text-[8px] text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * ordersPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * ordersPerPage,
                    filteredEntries.length
                  )}
                </span>{" "}
                of <span className="font-medium">{filteredEntries.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-theme-2xs xl:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Anterior
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-theme-2xs xl:text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-brand-500 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 text-theme-2xs xl:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
