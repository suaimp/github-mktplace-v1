import React, { useEffect, useRef, useCallback } from "react";
import SearchInput from "./SearchInput";
import StatusTabs from "./StatusTabs";
import ActionButtons from "./ActionButtons";
import { ItemsPerPageSelector } from "../../../common/pagination";

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
        'entriesPerPage', 'searchTerm', 'statusFilter', 'statusCounts', 'entries',
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
        'onEntriesPerPageChange', 'onSearchChange', 'onPageReset', 'onCsvImportSuccess', 'onStatusFilterChange'
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

  // Memoizar a função para evitar re-renders
  const handleEntriesPerPageChange = useCallback((value: number) => {
    onEntriesPerPageChange(value);
    onPageReset();
  }, [onEntriesPerPageChange, onPageReset]);

  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
      <ItemsPerPageSelector
        itemsPerPage={entriesPerPage}
        onItemsPerPageChange={handleEntriesPerPageChange}
        itemLabel="registros"
      />

      {/* Área direita: TabNavigation, Input de pesquisa e botões */}
      <div className="flex items-center gap-4">
        {/* StatusTabs - só re-renderiza quando statusCounts mudam */}
        {onStatusFilterChange && (
          <StatusTabs
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            onPageReset={onPageReset}
            statusCounts={statusCounts}
          />
        )}

        {/* SearchInput - só re-renderiza quando searchTerm muda */}
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onPageReset={onPageReset}
        />

        {/* ActionButtons - só re-renderiza quando entries/formFields mudam */}
        <ActionButtons
          formFields={formFields}
          formId={formId}
          userId={userId}
          onCsvImportSuccess={onCsvImportSuccess}
          showCsvImport={showCsvImport}
          formTitle={formTitle}
          showPdfExport={showPdfExport}
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          entries={entries}
        />
      </div>
    </div>
  );
};

// Função de comparação customizada para React.memo
const arePropsEqual = (prevProps: TableControlsProps, nextProps: TableControlsProps) => {
  // Comparar propriedades primitivas
  const primitiveProps: (keyof TableControlsProps)[] = [
    'entriesPerPage', 'searchTerm', 'statusFilter', 'formId', 'userId', 
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
