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
import EntriesTableSkeleton from "./table/EntriesTableSkeleton";
import { SortableHeader } from "./sorting/components/SortableHeader";
import { useEffect, useRef, useCallback, useMemo } from "react";

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
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    entriesPerPage,
    setEntriesPerPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusCounts,
    sortField,
    sortDirection,
    handleSort,
    handlePageChange,
    refreshEntries
  } = useCachedPaginatedEntries(selectedFormId);

  // Log para debug de re-renderizações do EntriesTable
  const prevEntriesRef = useRef<any[]>([]);
  const prevStatusCountsRef = useRef<any>({});
  
  useEffect(() => {
    if (entries !== prevEntriesRef.current) {
      console.log('📊 [EntriesTable] Entries mudaram:', {
        previousLength: prevEntriesRef.current?.length || 0,
        currentLength: entries?.length || 0,
        searchTerm,
        statusFilter
      });
      prevEntriesRef.current = entries;
    }
  }, [entries, searchTerm, statusFilter]);
  
  useEffect(() => {
    if (JSON.stringify(statusCounts) !== JSON.stringify(prevStatusCountsRef.current)) {
      console.log('📈 [EntriesTable] StatusCounts mudaram:', {
        previous: prevStatusCountsRef.current,
        current: statusCounts
      });
      prevStatusCountsRef.current = statusCounts;
    }
  }, [statusCounts]);

  // Criar versões estáveis das funções para evitar re-renders desnecessários
  const stableOnPageReset = useCallback(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  const stableOnStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, [setStatusFilter, setCurrentPage]);

  const stableOnSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, [setSearchTerm]);

  const stableOnCsvImportSuccess = useCallback(() => {
    onCsvImportSuccess();
  }, [onCsvImportSuccess]);

  // Memoizar entries apenas quando o comprimento mudar (para otimizar TableControls)
  const memoizedEntriesForControls = useMemo(() => {
    // Para o TableControls, só precisamos da referência para export PDF
    // Memoizamos baseado apenas no comprimento para evitar re-renders desnecessários
    return entries;
  }, [entries.length]);

  // Memoizar statusCounts para evitar referências instáveis
  const memoizedStatusCounts = useMemo(() => statusCounts, [
    statusCounts.todos,
    statusCounts.em_analise,
    statusCounts.verificado,
    statusCounts.reprovado
  ]);

  // Memoizar fields para evitar re-renders quando a referência muda
  const memoizedFields = useMemo(() => fields, [JSON.stringify(fields)]);

  // Implementar sincronização de dados em tempo real
  useTableDataSync(
    selectedFormId,
    refreshEntries,
    {
      listenerId: `entries-table-${selectedFormId}`,
      priority: 1
    }
  );

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

  // Não substituir toda a interface durante loading de busca
  // Apenas mostrar skeleton se for um loading inicial (sem dados)
  const isInitialLoading = loading && entries.length === 0 && !searchTerm && statusFilter === 'todos';
  
  if (isInitialLoading) {
    return <EntriesTableSkeleton rows={entriesPerPage} columns={displayFields.length + 5} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Container com overflow horizontal para todo o conteúdo */}
      <div className="overflow-x-auto table-scrollbar">
        <div className="min-w-[1102px]">
          {/* Barra de controles da tabela */}
          <TableControls
            searchTerm={searchTerm}
            onSearchChange={stableOnSearchChange}
            onPageReset={stableOnPageReset}
            formFields={memoizedFields}
            formId={selectedFormId}
            userId={userId}
            onCsvImportSuccess={stableOnCsvImportSuccess}
            showCsvImport={!!selectedFormId}
            formTitle={formTitle}
            showPdfExport={true}
            onStatusFilterChange={stableOnStatusFilterChange}
            statusFilter={statusFilter}
            statusCounts={memoizedStatusCounts}
            entries={memoizedEntriesForControls}
          />
          {/* Estatísticas de busca */}
          <SearchStats 
            total={totalItems}
            filtered={entries.length}
            hasFilter={searchTerm !== '' || statusFilter !== 'todos'}
            searchTerm={searchTerm}
          />
          {/* Tabela */}
          <div className="relative">
            {loading && !isInitialLoading ? (
              // Skeleton apenas na área da tabela durante buscas
              <div className="border-t border-gray-100 dark:border-white/[0.05]">
                <EntriesTableSkeleton rows={entriesPerPage} columns={displayFields.length + 5} />
              </div>
            ) : (
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
            )}
          </div>
          {/* Paginação com cache */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={entriesPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={(value: number) => {
              setEntriesPerPage(value);
              setCurrentPage(1);
            }}
            showInfo={true}
            itemLabel="registros"
          />
        </div>
      </div>
    </div>
  );
};

export default EntriesTable;
