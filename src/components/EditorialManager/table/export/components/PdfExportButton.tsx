import { useState } from "react";
import { DownloadIcon } from "../../../../../icons";
import { usePdfExport } from "../hooks/usePdfExport";
import { PdfExportData } from "../types/exportTypes";
import { LogoService } from "../services/LogoService";

interface PdfExportButtonProps {
  entries: any[];
  fields: any[];
  formTitle: string;
  disabled?: boolean;
}

export default function PdfExportButton({
  entries,
  fields,
  formTitle,
  disabled = false
}: PdfExportButtonProps) {
  const { exportToPdf, loading, error } = usePdfExport();
  const [showError, setShowError] = useState(false);

  const handleExport = async () => {
    console.log('🔘 [PdfExportButton] Clique do botão de exportar');
    console.log('📊 [PdfExportButton] Estado inicial:', {
      entriesCount: entries.length,
      fieldsCount: fields.length,
      formTitle,
      disabled,
      loading
    });

    if (entries.length === 0) {
      console.warn('⚠️ [PdfExportButton] Sem dados para exportar');
      alert('Não há dados para exportar');
      return;
    }

    console.log('📦 [PdfExportButton] Preparando dados para exportação...');

    // Carregar logo da plataforma
    console.log('🎨 [PdfExportButton] Carregando logo...');
    const logoBase64 = await LogoService.getLogoForPdf(false); // Logo claro
    console.log('🎨 [PdfExportButton] Logo carregado:', !!logoBase64);

    const exportData: PdfExportData = {
      entries: entries.map(entry => ({
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
      totalEntries: entries.length,
      logoBase64: logoBase64 || undefined
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
        <DownloadIcon className="w-5 h-5 fill-current transform rotate-180" />
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
