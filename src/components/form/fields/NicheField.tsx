import React, { useEffect, useState } from "react";
import { getFormFieldNicheByFormFieldId } from "../../../context/db-context/services/formFieldNicheService";

interface NicheFieldProps {
  field: { id: string; label?: string };
  settings: {
    value: string | string[];
    options: { label: string; value: string }[];
    multiple?: boolean;
  };
  error?: string;
  onChange: (value: string | string[]) => void;
}

export default function NicheField({
  field,
  settings,
  error,
  onChange,
}: NicheFieldProps) {
  const { value: initialValue, multiple = false } = settings;
  const [selectValue, setSelectValue] = useState(initialValue || "");
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      if (!field?.id) return;
      const data = await getFormFieldNicheByFormFieldId(field.id);
      if (data && Array.isArray(data.options)) {
        setOptions(data.options.map((opt) => ({ label: opt, value: opt })));
      } else {
        setOptions([]);
      }
    }
    fetchOptions();
  }, [field?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newValue: string | string[];
    if (multiple) {
      newValue = Array.from(e.target.selectedOptions, (opt) => opt.value);
    } else {
      newValue = e.target.value;
    }
    setSelectValue(newValue);
    onChange(newValue);
  };

  return (
    <div>
      <div className="flex gap-4">
        {/* Primeiro select de nichos */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-400">Nichos</label>
          <select
            className="w-full min-w-[180px] max-w-full border rounded px-3 py-2 mb-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            value={selectValue}
            onChange={handleChange}
            multiple={multiple}
          >
            {options.length > 0 ? (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))
            ) : (
              <option value="">Nenhum nicho cadastrado</option>
            )}
          </select>
        </div>
        {/* Segundo input com máscara de moeda */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-400">Preço</label>
          <input
            type="text"
            className="w-full min-w-[180px] max-w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            inputMode="decimal"
            pattern="^\\R\$?\\s?\d{1,3}(\.\d{3})*(,\d{2})?$"
            placeholder="R$ 0,00"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // Máscara simples de moeda (R$)
              let v = e.target.value.replace(/\D/g, "");
              v = (Number(v) / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              e.target.value = v;
            }}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">{error}</p>
      )}
    </div>
  );
}