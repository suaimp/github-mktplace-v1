import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../ui/table";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import { formatDate } from "../form/utils/formatters";
import { renderFormattedValue } from "./EntryValueFormatter";
import PriceSimulationDisplay from "./actions/PriceSimulationDisplay";
import { TableControls, SearchStats } from "./table/components";
import { useCachedPaginatedEntries } from "./pagination";
import { Pagination } from "./pagination/components";
import { useTableDataSync } from "./dataSync/hooks/useDataSync";
import { EntriesTableSkeleton } from "./table";
import { SortableHeader } from "./sorting/components/SortableHeader";

import { getStatusBadge } from "./utils/getStatusBadge";

interface EntriesTableProps {
  fields: any[];
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

const EntriesTable = ({
  fields,
  selectedFormId,
  onView,
  onEdit,
  onDelete,
  userId,
  onCsvImportSuccess,
  formTitle
}: EntriesTableProps) => {
  const {
    entries,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    entriesPerPage,
    setEntriesPerPage,
    searchTerm,
    statusFilter,
    setStatusFilter,
    statusCounts,
    sortField,
    sortDirection,
    handleSort,
    handlePageChange,
    handleSearch,
    refreshEntries,
    loading
  } = useCachedPaginatedEntries(selectedFormId);

  // Implementar sincronização de dados em tempo real
  useTableDataSync(
    selectedFormId,
    refreshEntries,
    {
      listenerId: `entries-table-${selectedFormId}`,
      priority: 1
    }
  );

  // Create stable callback references to prevent unnecessary re-renders
  const handlePageReset = () => {
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Display fields: prioritize price and commission fields, then first two other fields
  // Filter out admin-only and button_buy fields
  const priceField = fields.find((field) => field.field_type === "product");
  const commissionField = fields.find((field) => field.field_type === "commission");
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

  // Show skeleton only on initial load
  if (loading && !entries.length) {
    return <EntriesTableSkeleton rows={entriesPerPage} columns={displayFields.length + 5} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Barra de controles da tabela - sempre visível, fora do overflow */}
      <TableControls
        entriesPerPage={entriesPerPage}
        onEntriesPerPageChange={handleEntriesPerPageChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onPageReset={handlePageReset}
        formFields={fields}
        formId={selectedFormId}
        userId={userId}
        onCsvImportSuccess={onCsvImportSuccess}
        showCsvImport={!!selectedFormId}
        formTitle={formTitle}
        showPdfExport={true}
        onStatusFilterChange={handleStatusFilterChange}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        entries={entries}
      />
      
      {/* Container com overflow horizontal apenas para a tabela */}
      <div className="overflow-x-auto table-scrollbar">
        <div className="min-w-[1102px]">
          {/* Renderizar skeleton da tabela apenas ou conteúdo real */}
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2 dark:bg-gray-700"></div>
              <div className="space-y-2">
                {Array.from({ length: entriesPerPage }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Estatísticas de busca */}
              <SearchStats 
                total={totalItems}
                filtered={entries.length}
                hasFilter={searchTerm !== '' || statusFilter !== 'todos'}
                searchTerm={searchTerm}
              />
              {/* Tabela */}
              <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <SortableHeader
                    field="created_at"
                    label="Data"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    sortable={true}
                  />
                </TableCell>
                <TableCell
                  isHeader
                  className="h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <SortableHeader
                    field="updated_at"
                    label="Atualização"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    sortable={true}
                  />
                </TableCell>
                {displayFields.map((field) => (
                  <TableCell
                    key={field.id}
                    isHeader
                    className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    <SortableHeader
                      field={field.id}
                      label={field.label || field.name}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      sortable={true}
                    />
                  </TableCell>
                ))}
                <TableCell
                  isHeader
                  className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <SortableHeader
                    field="publisher"
                    label="Publisher"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    sortable={true}
                  />
                </TableCell>
                <TableCell
                  isHeader
                  className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <SortableHeader
                    field="status"
                    label="Status"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    sortable={true}
                  />
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  {/* Coluna Data */}
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.created_at)}
                    </span>
                  </TableCell>
                  {/* Coluna Atualização */}
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.updated_at)}
                    </span>
                  </TableCell>
                  {/* Display fields from the selected form */}
                  {displayFields.map((field) => {
                    const fieldValue = entry.values[field.id];
                    if (field.field_type === "product") {
                      const commissionValue = commissionField
                        ? parseFloat(entry.values[commissionField.id]) || 0
                        : 0;
                      return (
                        <TableCell
                          key={field.id}
                          className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                        >
                          <PriceSimulationDisplay
                            commission={commissionValue}
                            productData={fieldValue}
                            layout="inline"
                            showMarginBelow={false}
                            showOriginalPrice={true}
                          />
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell
                        key={field.id}
                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                      >
                        {renderFormattedValue(fieldValue, field.field_type, field)}
                      </TableCell>
                    );
                  })}
                  {/* Publisher */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {entry.publisher ? (
                      <div>
                        <div className="font-medium">
                          {entry.publisher.first_name} {entry.publisher.last_name}
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
                    colSpan={5 + displayFields.length}
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
          {/* Paginação com cache */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={entriesPerPage}
            onPageChange={handlePageChange}
            showInfo={true}
            itemLabel="registros"
          />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntriesTable;
