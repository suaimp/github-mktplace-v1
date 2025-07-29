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
import { useCachedPaginatedEntries } from "./pagination";
import { Pagination } from "./pagination/components";
import { useTableDataSync } from "./dataSync/hooks/useDataSync";

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

  // Use the cached paginated entries hook
  const {
    entries,
    loading,
    currentPage,
    entriesPerPage,
    totalPages,
    totalItems,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    setCurrentPage,
    setEntriesPerPage,
    handlePageChange,
    refreshEntries
  } = useCachedPaginatedEntries(selectedFormId);

  // Configura data sync para atualizações automáticas da tabela
  useTableDataSync(
    selectedFormId,
    refreshEntries, // Função de refresh do hook de paginação
    { 
      listenerId: `entries-table-${selectedFormId}`,
      priority: 1 
    }
  );

  // Função para alternar ordenação (desabilitada por enquanto)
  const handleSort = (field: string) => {
    // Ordenação será implementada no backend futuramente
    console.log('Sort by:', field);
  };

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
            entries={entries}
            formTitle={formTitle}
            showPdfExport={true}
            onStatusFilterChange={setStatusFilter}
            statusFilter={statusFilter}
          />
          
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
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                    onClick={() => handleSort("created_at")}
                  >
                    <span>Data</span>
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
                  </div>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {entries.map((entry) => (
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
        </div>
      </div>
    </div>
  );
}
