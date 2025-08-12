import React, { useEffect, useRef, useMemo, useCallback } from "react";
import CsvImportButton from "./CsvImportButton";
import { PdfExportButton } from "../export";
import { TabNavigation, useTabNavigation } from "../../../tables/TabNavigation";
import { useTableSearch } from "../hooks";

interface TableControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageReset: () => void;
  // CSV Import props
  formFields: any[];
  formId: string;
  userId: string | null;
  onCsvImportSuccess: () => void;
  showCsvImport?: boolean;
  formTitle?: string;
  showPdfExport?: boolean;
  // Tab Navigation props
  onStatusFilterChange?: (statusFilter: string) => void;
  statusFilter?: string;
  // Novo prop para contagem total por status
  statusCounts?: {
    todos: number;
    em_analise: number;
    verificado: number;
    reprovado: number;
  };
  // Dados para exportação PDF
  entries?: any[];
}

const TableControls = (props: TableControlsProps) => {
  const {
    searchTerm,
    onSearchChange,
    onPageReset,
    formFields,
    formId,
    userId,
    onCsvImportSuccess,
    showCsvImport = true,
    formTitle = "Formulário",
    showPdfExport = true,
    onStatusFilterChange,
    statusFilter = 'todos',
    statusCounts = { todos: 0, em_analise: 0, verificado: 0, reprovado: 0 },
    entries = []
  } = props;

  // Log para debug de re-renderizações
  const prevPropsRef = useRef<TableControlsProps | null>(null);
  
  // Log a cada renderização
  console.log('🎨 [TableControls] Renderizando componente');
  
  useEffect(() => {
    const prevProps = prevPropsRef.current;
    if (prevProps) {
      console.log('🔄 [TableControls] Re-renderização detectada:');
      
      // Verificar quais props mudaram
      const propsToCheck: (keyof TableControlsProps)[] = [
        'searchTerm', 'statusFilter', 'statusCounts', 'entries',
        'formFields', 'formId', 'userId', 'formTitle'
      ];
      
      propsToCheck.forEach(prop => {
        const current = props[prop];
        const previous = prevProps[prop];
        
        if (current !== previous) {
          if (prop === 'entries') {
            console.log(`  📝 ${prop}: array mudou (length: ${(previous as any)?.length || 0} → ${(current as any)?.length || 0})`);
          } else if (prop === 'statusCounts') {
            console.log(`  📊 ${prop}:`, JSON.stringify(previous), '→', JSON.stringify(current));
          } else {
            console.log(`  🔸 ${prop}:`, previous, '→', current);
          }
        }
      });
      
      // Verificar se as funções mudaram (referências)
      const functionsToCheck: (keyof TableControlsProps)[] = [
        'onSearchChange', 'onPageReset', 'onCsvImportSuccess', 'onStatusFilterChange'
      ];
      
      functionsToCheck.forEach(prop => {
        const current = props[prop];
        const previous = prevProps[prop];
        
        if (current !== previous) {
          console.log(`  🔧 ${prop}: função mudou de referência`);
        }
      });
    }
    
    // Salvar props atuais para próxima comparação
    prevPropsRef.current = props;
  });

  const { searchInput, setSearchInput, handleSearchSubmit } = useTableSearch({
    searchTerm,
    onSearchChange,
    onPageReset
  });

  // Memoizar tabs para evitar recriação a cada render
  const tabs = useMemo(() => [
    { id: 'todos', label: 'Todos', count: statusCounts.todos },
    { id: 'em_analise', label: 'Em Análise', count: statusCounts.em_analise },
    { id: 'verificado', label: 'Verificado', count: statusCounts.verificado },
    { id: 'reprovado', label: 'Reprovado', count: statusCounts.reprovado }
  ], [statusCounts.todos, statusCounts.em_analise, statusCounts.verificado, statusCounts.reprovado]);

  // Hook para gerenciar as tabs
  const { activeTabId, handleTabChange } = useTabNavigation(tabs, statusFilter);

  // Handler personalizado para mudança de tab que também notifica o componente pai
  const handleTabChangeWithCallback = useCallback((tabId: string) => {
    handleTabChange(tabId);
    onStatusFilterChange?.(tabId);
    onPageReset(); // Reset pagination when filter changes
  }, [handleTabChange, onStatusFilterChange, onPageReset]);

  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-end">
      {/* Área direita: TabNavigation, Input de pesquisa e botões */}
      <div className="flex items-center gap-4">
        {/* TabNavigation */}
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChangeWithCallback}
          compact
          buttonMinWidth="120px"
          className="h-11 items-center"
        />


        {/* Input de pesquisa */}
        <div className="relative">
          <button
            type="button"
            className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400 transition-colors hover:text-black focus:text-black"
            onClick={handleSearchSubmit}
            tabIndex={0}
            aria-label="Buscar"
          >
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
                fill="currentColor"
              />
            </svg>
          </button>
          <input
            placeholder="Pesquisar..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
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
              formId={formId}
              statusFilter={statusFilter}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Função de comparação customizada para React.memo
const arePropsEqual = (prevProps: TableControlsProps, nextProps: TableControlsProps) => {
  // Comparar propriedades primitivas
  const primitiveProps: (keyof TableControlsProps)[] = [
    'searchTerm', 'statusFilter', 'formId', 'userId', 
    'showCsvImport', 'formTitle', 'showPdfExport'
  ];
  
  for (const prop of primitiveProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      console.log(`🔄 [TableControls] ${prop} mudou:`, prevProps[prop], '→', nextProps[prop]);
      return false;
    }
  }
  
  // Comparar statusCounts profundamente
  const prevCounts = prevProps.statusCounts || { todos: 0, em_analise: 0, verificado: 0, reprovado: 0 };
  const nextCounts = nextProps.statusCounts || { todos: 0, em_analise: 0, verificado: 0, reprovado: 0 };
  
  if (prevCounts.todos !== nextCounts.todos ||
      prevCounts.em_analise !== nextCounts.em_analise ||
      prevCounts.verificado !== nextCounts.verificado ||
      prevCounts.reprovado !== nextCounts.reprovado) {
    console.log('🔄 [TableControls] statusCounts mudou:', prevCounts, '→', nextCounts);
    return false;
  }
  
  // Comparar entries apenas por comprimento (para performance)
  const prevEntriesLength = prevProps.entries?.length || 0;
  const nextEntriesLength = nextProps.entries?.length || 0;
  
  if (prevEntriesLength !== nextEntriesLength) {
    console.log(`🔄 [TableControls] entries length mudou: ${prevEntriesLength} → ${nextEntriesLength}`);
    return false;
  }
  
  // Comparar arrays de referência (formFields)
  if (prevProps.formFields !== nextProps.formFields) {
    console.log('🔄 [TableControls] formFields mudou');
    return false;
  }
  
  // Se chegou até aqui, as props são consideradas iguais
  console.log('✅ [TableControls] Props iguais - evitando re-render');
  return true;
};

export default React.memo(TableControls, arePropsEqual);
