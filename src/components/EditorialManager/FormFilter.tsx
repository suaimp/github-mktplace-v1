import { FilterIcon } from "../../icons";
import Button from "../ui/button/Button";
import Select from "../form/Select";

interface FormFilterProps {
  forms: Array<{ id: string; title: string }>;
  selectedFormId: string;
  onSelectForm: (formId: string) => void;
}

export default function FormFilter({ forms, selectedFormId, onSelectForm }: FormFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
          Filtrar Entradas
        </h3>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-full sm:w-64">
          <Select
            options={forms.map(form => ({
              value: form.id,
              label: form.title
            }))}
            value={selectedFormId}
            onChange={onSelectForm}
            placeholder="Selecione um formulário"
          />
        </div>
        
        {selectedFormId && (
          <Button
            variant="outline"
            onClick={() => onSelectForm("")}
            className="whitespace-nowrap"
          >
            Limpar Filtro
          </Button>
        )}
      </div>
    </div>
  );
}