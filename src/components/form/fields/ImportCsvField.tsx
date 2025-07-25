import { useState } from "react";
import CsvMappingModal from "./components/CsvMappingModal";
import { useCsvColumns } from "./hooks/useCsvColumns";
import { FormField } from "./ImportCsv/types";

interface ImportCsvFieldProps {
  field: any;
  value: File | null;
  onChange: (value: File | null) => void;
  error?: string;
  onErrorClear?: () => void;
  settings?: any;
  formFields?: FormField[];
  formId?: string;
  userId?: string;
}

const INITIAL_MAPPING: Record<string, string> = {
  url: "",
  da: "",
  preco: "",
};

export default function ImportCsvField({
  onChange,
  error,
  formFields,
  formId,
  userId
}: ImportCsvFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>(INITIAL_MAPPING);
  const { csvData, error: csvError, parseCsvColumns } = useCsvColumns();

  const handleCsvUpload = (file: File) => {
    parseCsvColumns(file);
    onChange(file);
    setMapping(INITIAL_MAPPING); // Reset mapping on new file
  };

  const handleMappingChange = (newMapping: Record<string, string>) => {
    setMapping(newMapping);
    // Aqui você pode propagar o mapeamento para o parent se necessário
  };

  return (
    <div>
      <button
        type="button"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModalOpen(true)}
      >
        Importar CSV
      </button>
      <CsvMappingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCsvUpload={handleCsvUpload}
        csvData={csvData}
        mapping={mapping}
        onMappingChange={handleMappingChange}
        formFields={formFields}
        formId={formId}
        userId={userId}
        onSuccess={() => {
          setModalOpen(false);
          console.log("CSV importado com sucesso!");
        }}
      />
      {csvError && <div className="text-red-500 text-sm mt-2">{csvError}</div>}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
