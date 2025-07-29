import { useState } from "react";
import { usePdfExport } from "../hooks/usePdfExport";
import { useAllEntriesForExport } from "../../hooks";
import { PdfExportData } from "../types/exportTypes";
import { LogoService } from "../services/LogoService";

interface PdfExportButtonProps {
  entries: any[]; // Entries da página atual (usado apenas para verificar se há dados)
  fields: any[];
  formTitle: string;
  formId: string;
  statusFilter: string;
  searchTerm: string;
  disabled?: boolean;
}

export default function PdfExportButton({
  entries,
  fields,
  formTitle,
  formId,
  statusFilter,
  searchTerm,
  disabled = false
}: PdfExportButtonProps) {
  const { exportToPdf, loading, error } = usePdfExport();
  const { 
    getAllEntries, 
    getStatusDisplayName
  } = useAllEntriesForExport({
    formId,
    statusFilter,
    searchTerm
  });
  const [showError, setShowError] = useState(false);

  const handleExport = async () => {
    console.log('🔘 [PdfExportButton] Clique do botão de exportar');
    console.log('📊 [PdfExportButton] Estado inicial:', {
      entriesCount: entries.length,
      fieldsCount: fields.length,
      formTitle,
      statusFilter,
      searchTerm,
      disabled,
      loading
    });

    if (entries.length === 0) {
      console.warn('⚠️ [PdfExportButton] Sem dados para exportar');
      alert('Não há dados para exportar');
      return;
    }

    console.log('📦 [PdfExportButton] Buscando TODOS os entries da aba para exportação...');

    // Buscar todos os entries da aba atual
    const allEntries = await getAllEntries();
    
    if (allEntries.length === 0) {
      console.warn('⚠️ [PdfExportButton] Nenhum entry encontrado para a aba atual');
      alert('Não há dados para exportar na aba selecionada');
      return;
    }

    console.log('📊 [PdfExportButton] Dados carregados:', {
      allEntriesCount: allEntries.length,	
      statusFilter: getStatusDisplayName(statusFilter)
    });

    // Carregar logo da plataforma
    console.log('🎨 [PdfExportButton] Carregando logo...');
    const logoBase64 = await LogoService.getLogoForPdf(false); // Logo claro
    console.log('🎨 [PdfExportButton] Logo carregado:', !!logoBase64);

    // Preparar dados para exportação com informação da aba
    const exportData: PdfExportData = {
      entries: allEntries.map(entry => ({
        id: entry.id,
        status: entry.status,
        created_at: entry.created_at,
        values: entry.values || {},
        publisher: entry.publisher
      })),
      fields: fields.map(field => ({
        id: field.id,
        label: field.label,
        field_type: field.field_type,
        position: field.position
      })),
      formTitle,
      exportDate: new Date().toLocaleDateString('pt-BR'),
      totalEntries: allEntries.length,
      logoBase64: logoBase64 || undefined,
      // Adicionar informações da aba exportada
      statusFilter: statusFilter,
      statusDisplayName: getStatusDisplayName(statusFilter),
      searchTerm: searchTerm
    };

    console.log('📊 [PdfExportButton] Dados preparados:', {
      entriesProcessed: exportData.entries.length,
      fieldsProcessed: exportData.fields.length,
      formTitle: exportData.formTitle,
      exportDate: exportData.exportDate,
      totalEntries: exportData.totalEntries,
      hasLogo: !!exportData.logoBase64
    });

    console.log('🚀 [PdfExportButton] Chamando hook de exportação...');
    const success = await exportToPdf(exportData);
    
    if (!success && error) {
      console.error('❌ [PdfExportButton] Falha na exportação:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } else if (success) {
      console.log('🎉 [PdfExportButton] Exportação realizada com sucesso');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={disabled || loading || entries.length === 0}
        className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-[11px] text-sm font-medium text-gray-700 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={entries.length === 0 ? "Não há dados para exportar" : "Exportar dados para PDF"}
      >
        {loading ? 'Exportando...' : 'Exportar'}
        <svg className="fill-current w-5 h-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.0018 14.083C9.7866 14.083 9.59255 13.9924 9.45578 13.8472L5.61586 10.0097C5.32288 9.71688 5.32272 9.242 5.61552 8.94902C5.90832 8.65603 6.3832 8.65588 6.67618 8.94868L9.25182 11.5227L9.25182 3.33301C9.25182 2.91879 9.5876 2.58301 10.0018 2.58301C10.416 2.58301 10.7518 2.91879 10.7518 3.33301L10.7518 11.5193L13.3242 8.94866C13.6172 8.65587 14.0921 8.65604 14.3849 8.94903C14.6777 9.24203 14.6775 9.7169 14.3845 10.0097L10.5761 13.8154C10.4385 13.979 10.2323 14.083 10.0018 14.083ZM4.0835 13.333C4.0835 12.9188 3.74771 12.583 3.3335 12.583C2.91928 12.583 2.5835 12.9188 2.5835 13.333V15.1663C2.5835 16.409 3.59086 17.4163 4.8335 17.4163H15.1676C16.4102 17.4163 17.4176 16.409 17.4176 15.1663V13.333C17.4176 12.9188 17.0818 12.583 16.6676 12.583C16.2533 12.583 15.9176 12.9188 15.9176 13.333V15.1663C15.9176 15.5806 15.5818 15.9163 15.1676 15.9163H4.8335C4.41928 15.9163 4.0835 15.5806 4.0835 15.1663V13.333Z" fill=""></path>
        </svg>
      </button>

      {/* Mensagem de erro */}
      {showError && error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg shadow-lg z-50 min-w-max">
          {error}
        </div>
      )}
    </div>
  );
}
