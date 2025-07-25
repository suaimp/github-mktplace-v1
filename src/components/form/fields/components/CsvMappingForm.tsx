import React from "react";
import Select from "../../Select";
import { useCsvMapping } from "../hooks/useCsvMapping";
import { useCsvImport } from "../ImportCsv/hooks/useCsvImport";
import { CsvData } from "../types/csvTypes";
import { FormField, CsvImportRequest } from "../ImportCsv/types";

const FIELD_LABELS = [
  { key: "url", label: "URL do Site" },
  { key: "da", label: "DA" },
  { key: "preco", label: "Preço" },
];

interface CsvMappingFormProps {
  csvData: CsvData;
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  formFields?: FormField[];
  formId?: string;
  userId?: string;
  onSuccess?: () => void;
  onSubmit?: (mappedData: any) => void;
}

const CsvMappingForm: React.FC<CsvMappingFormProps> = ({ 
  csvData, 
  mapping, 
  onMappingChange, 
  formFields = [],
  formId,
  userId,
  onSuccess,
  onSubmit 
}) => {
  const { mapCsvData } = useCsvMapping();
  const { importCsvData, loading, error } = useCsvImport();
  
  const handleSelectChange = (fieldKey: string, value: string) => {
    onMappingChange({ ...mapping, [fieldKey]: value });
  };

  const handleSubmit = async () => {
    const mappedData = mapCsvData(csvData, mapping);
    console.log("🔍 Dados mapeados do CSV:", mappedData);
    console.log("📋 FormFields recebidos:", formFields);
    
    // Se há campos do formulário, salvar no banco
    if (formFields.length > 0 && formId) {
      console.log("💾 Iniciando importação para o banco...");
      
      const request: CsvImportRequest = {
        csvData: mappedData,
        formFields,
        formId,
        userId
      };
      
      const entryIds = await importCsvData(request);
      
      if (entryIds) {
        console.log("✅ Sites importados com sucesso! Entry IDs:", entryIds);
        if (onSuccess) onSuccess();
        return;
      } else {
        console.log("❌ Falha na importação para o banco");
      }
    } else {
      console.log("⚠️ Nenhum formField ou formId fornecido, usando callback fallback");
    }
    
    // Fallback para callback anterior
    if (onSubmit) onSubmit(mappedData);
  };

  const selectOptions = [
    { value: "", label: "Selecione a coluna..." },
    ...csvData.headers.map(header => ({ value: header, label: header }))
  ];

  return (
    <div className="space-y-3">
      {FIELD_LABELS.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <Select
            options={selectOptions}
            value={mapping[field.key] || ""}
            onChange={value => handleSelectChange(field.key, value)}
            placeholder="Selecione a coluna..."
          />
        </div>
      ))}
      
      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Importando..." : "Salvar mapeamento"}
      </button>
    </div>
  );
};

export default CsvMappingForm;
