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
  entries: any[];
  fields: any[];
  loading: boolean;
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

  // Fields are loaded separately in the parent component, we need to load them here too
  // For now, we'll assume fields are empty array. This should be refactored to load fields here too.
  const fields: any[] = [];

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
        onCsvImportSuccess={() => {
          onCsvImportSuccess();
          refreshEntries();
        }}
        showCsvImport={!!selectedFormId}
        entries={entries}
        formTitle={formTitle}
        showPdfExport={true}
        onStatusFilterChange={handleStatusFilter}
        statusFilter={statusFilter}
      />

      {/* Search Stats */}
      <SearchStats 
        total={statusCounts[statusFilter as keyof typeof statusCounts] || 0}
        filtered={entries.length}
        searchTerm={searchTerm}
        hasFilter={searchTerm !== "" || statusFilter !== "todos"}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="w-10">#</TableCell>
              {displayFields.map((field) => (
                <TableCell
                  key={field.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort(field.id)}
                >
                  <div className="flex items-center gap-1">
                    {field.label}
                    {sortField === field.id && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
              <TableCell
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === "status" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-1">
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
                <TableCell colSpan={displayFields.length + 4} className="text-center py-8">
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
                          commission={
                            field.form_field_settings?.commission || 15
                          }
                          productData={entry.values[field.id]}
                          layout="inline"
                          showMarginBelow={false}
                          showOriginalPrice={true}
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
                        onClick={() => onDelete(entry.id)}
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
