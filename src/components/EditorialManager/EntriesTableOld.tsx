import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import { formatDate } from "../form/utils/formatters";
import { renderFormattedValue } from "./EntryValueFormatter";
import PriceSimulationDisplay from "./actions/PriceSimulationDisplay";
import { TableControls, SearchStats } from "./table/components";
import { usePaginatedEntries, PaginationControls } from "./pagination";

interface EntriesTableProps {
  entries?: any[]; // Deprecated - now loaded by hook
  fields: any[];
  loading?: boolean; // Deprecated - now from hook
  selectedFormId: string;
  onView: (entry: any) => void;
  onEdit: (entry: any) => void;
  onDelete: (entryId: string) => void;
  show?: boolean;
  // CSV Import props
  userId: string | null;
  onCsvImportSuccess: () => void;
  // Form title for PDF export
  formTitle?: string;
}

export default function EntriesTable({
  fields,
  selectedFormId,
  onView,
  onEdit,
  onDelete,
  show = true,
  userId,
  onCsvImportSuccess,
  formTitle = "Formulário",
}: EntriesTableProps) {
  if (!show) return null;

  // Use the pagination hook instead of local state
  const {
    entries,
    loading,
    error,
    statusCounts,
    currentPage,
    entriesPerPage,
    totalPages,
    searchTerm,
    statusFilter,
    sortField,
    sortDirection,
    handleSearch,
    handleStatusFilter,
    handleEntriesPerPageChange,
    handlePageChange,
    handleSort,
    refreshEntries,
    setCurrentPage
  } = usePaginatedEntries(selectedFormId);

  // Handle CSV import success with refresh
  const handleCsvImportSuccess = () => {
    onCsvImportSuccess();
    refreshEntries();
  };

  // Handle delete with refresh
  const handleDeleteEntry = async (entryId: string) => {
    await onDelete(entryId);
    refreshEntries();
  };

  // PAGINAÇÃO - agora vem do hook
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
 

  if (currentPage > totalPages) setCurrentPage(totalPages);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verificado":
        return <Badge color="success">Verificado</Badge>;
      case "reprovado":
        return <Badge color="error">Reprovado</Badge>;
      case "em_analise":
      default:
        return <Badge color="warning">Em Análise</Badge>;
    }
  };

  // Display fields: prioritize price and commission fields, then first two other fields
  // Filter out admin-only and button_buy fields
  const priceField = fields.find((field) => field.field_type === "product");
  const commissionField = fields.find(
    (field) => field.field_type === "commission"
  );

  const otherFields = fields
    .filter((field) => {
      return (
        field.field_type !== "button_buy" &&
        field.field_type !== "product" &&
        field.field_type !== "commission"
      );
    })
    .slice(0, 2);

  // Combine priority fields with other fields
  const displayFields = [
    ...(priceField ? [priceField] : []),
    ...(commissionField ? [commissionField] : []),
    ...otherFields
  ];

  // Estados para ordenação
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Função para alternar ordenação
  const handleSort = (field: string) => {
    // Não permite ordenar por 'acoes'
    if (field === "acoes") return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // BUSCA APRIMORADA
  const { filteredEntries: searchResults, searchStats } = useEnhancedSearch({
    entries,
    formFields: fields,
    searchTerm,
    options: {
      caseSensitive: false,
      exactMatch: false
    }
  });

  // FILTRO POR STATUS
  const statusFilteredEntries = searchResults.filter(entry => {
    if (statusFilter === 'todos') return true;
    
    // Buscar o status no entry - pode estar em diferentes lugares
    const status = entry.status || entry.values?.status || 'em_analise';
    return status === statusFilter;
  });

  console.log(`🔍 [EntriesTable] Filtro de status aplicado:`);
  console.log(`   Status selecionado: ${statusFilter}`);
  console.log(`   Registros antes: ${searchResults.length}`);
  console.log(`   Registros depois: ${statusFilteredEntries.length}`);

  // Ordenar os dados filtrados
  const sortedEntries = [...statusFilteredEntries].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    // Para campos dinâmicos (displayFields)
    if (displayFields.some(f => f.id === sortField)) {
      aValue = a.values?.[sortField];
      bValue = b.values?.[sortField];
    }
    // Para string
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // Para número
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    // Para undefined/null
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return 0;
  });

  // PAGINAÇÃO
  const totalPagesFiltered = Math.ceil(sortedEntries.length / entriesPerPage) || 1;
  const paginatedEntriesFiltered = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (currentPage > totalPagesFiltered) setCurrentPage(totalPagesFiltered);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-full mb-4 dark:bg-gray-800"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-lg dark:bg-gray-800"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Container com overflow horizontal para todo o conteúdo */}
      <div className="overflow-x-auto table-scrollbar">
        <div className="min-w-[1102px]">
          {/* Barra de controles da tabela */}
          <TableControls
            entriesPerPage={entriesPerPage}
            onEntriesPerPageChange={setEntriesPerPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPageReset={() => setCurrentPage(1)}
            formFields={fields}
            formId={selectedFormId}
            userId={userId}
            onCsvImportSuccess={onCsvImportSuccess}
            showCsvImport={!!selectedFormId}
            entries={statusFilteredEntries}
            formTitle={formTitle}
            showPdfExport={true}
            onStatusFilterChange={setStatusFilter}
            statusFilter={statusFilter}
          />
          
          {/* Estatísticas de busca */}
          <SearchStats 
            total={searchStats.total}
            filtered={statusFilteredEntries.length}
            hasFilter={searchStats.hasFilter || statusFilter !== 'todos'}
            searchTerm={searchTerm}
          />
          
          {/* Tabela */}
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                    onClick={() => handleSort("created_at")}
                  >
                    <span>Data</span>
                    {sortField === "created_at" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Show first two fields from the selected form */}
                {displayFields.map((field) => (
                  <TableCell
                    key={field.id}
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort(field.id)}
                    >
                      <span>{field.label}</span>
                      {sortField === field.id && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                ))}

                <TableCell
                  isHeader
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                    onClick={() => handleSort("publisher")}
                  >
                    <span>Publisher</span>
                    {sortField === "publisher" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                    onClick={() => handleSort("status")}
                  >
                    <span>Status</span>
                    {sortField === "status" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left select-none px-5 py-3"
                  >
                    <span>Ações</span>
                    {sortField === "acoes" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedEntriesFiltered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.created_at)}
                    </span>
                  </TableCell>

                  {/* Display fields from the selected form */}
                  {displayFields.map((field) => {
                    return (
                      <TableCell
                        key={field.id}
                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                      >
                        {(() => {
                          const fieldValue = entry.values[field.id];

                          // Use PriceSimulationDisplay for product fields
                          if (field.field_type === "product") {
                            const commissionValue = commissionField
                              ? parseFloat(entry.values[commissionField.id]) ||
                                0
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

                          return renderFormattedValue(
                            fieldValue,
                            field.field_type,
                            field
                          );
                        })()}
                      </TableCell>
                    );
                  })}

                  {/* Publisher */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {entry.publisher ? (
                      <div>
                        <div className="font-medium">
                          {entry.publisher.first_name}{" "}
                          {entry.publisher.last_name}
                        </div>
                        <div className="text-xs">{entry.publisher.email}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {getStatusBadge(entry.status || "em_analise")}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(entry)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Visualizar"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                        title="Excluir"
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Corrigir uso de colSpan: usar <td colSpan={...}> diretamente para linha de vazio */}
              {entries.length === 0 && (
                <TableRow>
                  <td
                    colSpan={3 + displayFields.length}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {selectedFormId
                      ? "Nenhum registro encontrado para este formulário"
                      : "Selecione um formulário para ver as entradas"}
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Paginação no padrão da OrderList */}
          {totalPagesFiltered > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
              <div className="flex items-center">
                <p className="text-[13px] text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * entriesPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * entriesPerPage, sortedEntries.length)}
                  </span>{" "}
                  of <span className="font-medium">{sortedEntries.length}</span>{" "}
                  results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex items-center space-x-1">
                  {(() => {
                    // Calcular janela de páginas (máximo 5 números)
                    const maxPages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                    let endPage = Math.min(totalPagesFiltered, startPage + maxPages - 1);
                    
                    // Ajustar se estamos no final
                    if (endPage - startPage + 1 < maxPages) {
                      startPage = Math.max(1, endPage - maxPages + 1);
                    }

                    const pages: number[] = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return (
                      <>
                        {/* Primeira página se não estiver visível */}
                        {startPage > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentPage(1)}
                              className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                            >
                              1
                            </button>
                            {startPage > 2 && (
                              <span className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                ...
                              </span>
                            )}
                          </>
                        )}

                        {/* Páginas da janela atual */}
                        {pages.map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-3 py-2 text-[13px] font-medium rounded-md ${
                              currentPage === page
                                ? "bg-brand-500 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        {/* Última página se não estiver visível */}
                        {endPage < totalPagesFiltered && (
                          <>
                            {endPage < totalPagesFiltered - 1 && (
                              <span className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(totalPagesFiltered)}
                              className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                            >
                              {totalPagesFiltered}
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPagesFiltered, p + 1))}
                  disabled={currentPage === totalPagesFiltered}
                  className="relative inline-flex items-center px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
