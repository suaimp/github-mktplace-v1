import React from "react";
import CsvImportButton from "./CsvImportButton";
import { PdfExportButton } from "../export";

interface ActionButtonsProps {
  // CSV Import props
  formFields: any[];
  formId: string;
  userId: string | null;
  onCsvImportSuccess: () => void;
  showCsvImport?: boolean;
  // PDF Export props
  formTitle?: string;
  showPdfExport?: boolean;
  statusFilter?: string;
  searchTerm?: string;
  entries?: any[];
}

const ActionButtons = React.memo(({
  formFields,
  formId,
  userId,
  onCsvImportSuccess,
  showCsvImport = true,
  formTitle = "Formulário",
  showPdfExport = true,
  statusFilter = 'todos',
  searchTerm = '',
  entries = []
}: ActionButtonsProps) => {
  return (
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
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
