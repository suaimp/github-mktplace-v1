import { useState } from "react";
import { UploadIcon } from "../../../../icons";
import CsvMappingModal from "../../../form/fields/components/CsvMappingModal";
import { useCsvColumns } from "../../../form/fields/hooks/useCsvColumns";

interface CsvImportButtonProps {
  formFields: any[];
  formId: string;
  userId: string | null;
  onSuccess: () => void;
}

const INITIAL_MAPPING: Record<string, string> = {
  url: "",
  da: "",
  preco: "",
};

export default function CsvImportButton({
  formFields,
  formId,
  userId,
  onSuccess
}: CsvImportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>(INITIAL_MAPPING);
  const { csvData, error: csvError, parseCsvColumns } = useCsvColumns();

  const handleCsvUpload = (file: File) => {
    parseCsvColumns(file);
    setMapping(INITIAL_MAPPING); // Reset mapping on new file
  };

  const handleMappingChange = (newMapping: Record<string, string>) => {
    setMapping(newMapping);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-[11px] text-sm font-medium text-gray-700 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      >
        Importar
        <UploadIcon className="w-5 h-5 fill-current" />
      </button>

      <CsvMappingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCsvUpload={handleCsvUpload}
        csvData={csvData}
        mapping={mapping}
        onMappingChange={handleMappingChange}
        formFields={formFields}
        formId={formId}
        userId={userId || undefined}
        onSuccess={handleSuccess}
      />
      
      {csvError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <div className="text-red-600 text-sm">{csvError}</div>
        </div>
      )}
    </>
  );
}
