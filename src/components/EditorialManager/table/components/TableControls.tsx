import CsvImportButton from "./CsvImportButton";
import { PdfExportButton } from "../export";
import { TabNavigation, useTabNavigation } from "../../../tables/TabNavigation";

interface TableControlsProps {
  entriesPerPage: number;
  onEntriesPerPageChange: (value: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageReset: () => void;
  // CSV Import props
  formFields: any[];
  formId: string;
  userId: string | null;
  onCsvImportSuccess: () => void;
  showCsvImport?: boolean;
  // PDF Export props
  entries?: any[];
  formTitle?: string;
  showPdfExport?: boolean;
  // Tab Navigation props
  onStatusFilterChange?: (statusFilter: string) => void;
  statusFilter?: string;
}

export default function TableControls({
  entriesPerPage,
  onEntriesPerPageChange,
  searchTerm,
  onSearchChange,
  onPageReset,
  formFields,
  formId,
  userId,
  onCsvImportSuccess,
  showCsvImport = true,
  entries = [],
  formTitle = "Formulário",
  showPdfExport = true,
  onStatusFilterChange,
  statusFilter = 'todos'
}: TableControlsProps) {
  const handleEntriesPerPageChange = (value: number) => {
    onEntriesPerPageChange(value);
    onPageReset();
  };

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    onPageReset();
  };

  // Calcular contadores para cada status
  const getStatusCount = (status: string) => {
    if (status === 'todos') return entries.length;
    
    return entries.filter(entry => {
      const entryStatus = entry.status || entry.values?.status || 'em_analise';
      return entryStatus === status;
    }).length;
  };

  // Definir tabs para filtro por status dos sites com contadores
  const tabs = [
    { id: 'todos', label: 'Todos os sites', count: getStatusCount('todos') },
    { id: 'em_analise', label: 'Em Análise', count: getStatusCount('em_analise') },
    { id: 'verificado', label: 'Verificado', count: getStatusCount('verificado') },
    { id: 'reprovado', label: 'Reprovado', count: getStatusCount('reprovado') }
  ];

  // Hook para gerenciar as tabs
  const { activeTabId, handleTabChange } = useTabNavigation(tabs, statusFilter);

  // Handler personalizado para mudança de tab que também notifica o componente pai
  const handleTabChangeWithCallback = (tabId: string) => {
    handleTabChange(tabId);
    onStatusFilterChange?.(tabId);
    onPageReset(); // Reset pagination when filter changes
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">Mostrar</span>
        <div className="relative z-20 bg-transparent">
          <select
            className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            value={entriesPerPage}
            onChange={e => handleEntriesPerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
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
              />
            </svg>
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">registros</span>
      </div>

      {/* Área direita: TabNavigation, Input de pesquisa e botões */}
      <div className="flex items-center gap-4">
        {/* TabNavigation */}
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChangeWithCallback}
          compact
          buttonMinWidth="120px"
        />

        {/* Input de pesquisa */}
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
              />
            </svg>
          </button>
          <input
            placeholder="Pesquisar..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          {/* Botão de importação CSV */}
          {showCsvImport && formId && (
            <CsvImportButton
              formFields={formFields}
              formId={formId}
              userId={userId}
              onSuccess={onCsvImportSuccess}
            />
          )}

          {/* Botão de exportação PDF */}
          {showPdfExport && (
            <PdfExportButton
              entries={entries}
              fields={formFields}
              formTitle={formTitle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
