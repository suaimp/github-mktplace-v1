import React from "react";
import CsvMappingForm from "./CsvMappingForm";
import FileInput from "../../input/FileInput";
import { CsvData } from "../types/csvTypes";
import { FormField } from "../ImportCsv/types";

interface CsvMappingModalProps {
  open: boolean;
  onClose: () => void;
  onCsvUpload: (file: File) => void;
  csvData: CsvData;
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  formFields?: FormField[];
  formId?: string;
  userId?: string;
  onSuccess?: () => void;
}

const CsvMappingModal: React.FC<CsvMappingModalProps> = ({
  open,
  onClose,
  onCsvUpload,
  csvData,
  mapping,
  onMappingChange,
  formFields,
  formId,
  userId,
  onSuccess
}) => {
  if (!open) return null;
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCsvUpload(file);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[--background-blur] dark:text-white"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Importar e Mapear CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload do arquivo CSV</label>
          <FileInput onChange={handleFileChange} />
        </div>
        <CsvMappingForm
          csvData={csvData}
          mapping={mapping}
          onMappingChange={onMappingChange}
          formFields={formFields}
          formId={formId}
          userId={userId}
          onSubmit={(mappedData) => {
            // Loga os dados mapeados, não fecha o modal
            console.log("Dados mapeados do CSV:", mappedData);
            onSuccess?.();
          }}
        />
      </div>
    </div>
  );
};

export default CsvMappingModal;
