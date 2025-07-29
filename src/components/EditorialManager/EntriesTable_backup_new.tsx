import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import { formatDate, extractDomain, getFaviconUrl } from "../form/utils/formatters";
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

// Sort icons component
const SortIcons = () => (
  <span className="flex flex-col gap-0.5 ml-1">
    <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""></path>
    </svg>
    <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""></path>
    </svg>
  </span>
);

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

  const handlePageReset = () => {
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-full mb-4 dark:bg-gray-800"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        Erro ao carregar entradas: {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm dark:bg-gray-900">
      {/* Controls */}
      <TableControls
        entriesPerPage={entriesPerPage}
        onEntriesPerPageChange={handleEntriesPerPageChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onPageReset={handlePageReset}
        formFields={fields}
        formId={selectedFormId}
        userId={userId}
        onCsvImportSuccess={handleCsvImportSuccess}
        showCsvImport={!!selectedFormId}
        entries={entries}
        formTitle={formTitle}
        showPdfExport={true}
        onStatusFilterChange={handleStatusFilter}
        statusFilter={statusFilter}
      />

      {/* Search Stats */}
      <SearchStats 
        total={statusCounts.todos}
        filtered={entries.length}
        searchTerm={searchTerm}
        hasFilter={statusFilter !== "todos"}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>Data</span>
                  <SortIcons />
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>Preço</span>
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>URL do Site</span>
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>DA</span>
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>Publisher</span>
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3">
                  <span>Status</span>
                </div>
              </th>
              <th className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="absolute inset-0 w-full h-full flex items-center gap-1 text-left select-none px-5 py-3">
                  <span>Ações</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  </div>
                </TableCell>
              ))}
              <TableCell className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <div 
                  className="flex items-center gap-1"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortField === "status" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <div 
                  className="flex items-center gap-1"
                  onClick={() => handleSort("created_at")}
                >
                  Data
                  {sortField === "created_at" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    {searchTerm || statusFilter !== "todos" 
                      ? "Nenhuma entrada encontrada com os filtros aplicados"
                      : "Nenhuma entrada encontrada"
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </TableCell>
                  {displayFields.map((field) => (
                    <TableCell key={field.id}>
                      {field.field_type === "product" && (
                        <PriceSimulationDisplay
                          commission={field.form_field_settings?.show_percentage || 15}
                          productData={entry.values[field.id]}
                        />
                      )}
                      {field.field_type !== "product" && (
                        <div className="max-w-xs truncate">
                          {renderFormattedValue(
                            entry.values[field.id],
                            field.field_type,
                            field
                          )}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>{formatDate(entry.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(entry)}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        title="Visualizar"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        title="Excluir"
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
