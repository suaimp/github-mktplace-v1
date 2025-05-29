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
  onChange
}: NicheFieldProps) {
  const { value: initialValue } = settings;
  const [selectValue, setSelectValue] = useState(initialValue || "");
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

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

  return (
    <div>
      <div className="flex gap-4">
        {/* Primeiro select de nichos */}
        <div className="flex-1">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-gray-700 dark:text-gray-400 pb-1">
                  Nichos
                </th>
                <th className="text-left text-sm font-semibold text-gray-700 dark:text-gray-400 pb-1">
                  Preço
                </th>
              </tr>
            </thead>
            <tbody>
              {options.length > 0 ? (
                options.map((opt) => (
                  <tr key={opt.value}>
                    <td className="align-middle">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                          value={opt.value}
                          checked={
                            Array.isArray(selectValue)
                              ? selectValue.includes(opt.value)
                              : false
                          }
                          onChange={(e) => {
                            let newValue: string[] = Array.isArray(selectValue)
                              ? [...selectValue]
                              : [];
                            if (e.target.checked) {
                              if (!newValue.includes(opt.value))
                                newValue.push(opt.value);
                            } else {
                              newValue = newValue.filter(
                                (v) => v !== opt.value
                              );
                            }
                            setSelectValue(newValue);
                            onChange(newValue);
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    </td>
                    <td className="align-middle">
                      <input
                        type="text"
                        className="w-full min-w-[120px] max-w-[180px] border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        inputMode="decimal"
                        pattern="^\\R\$?\\s?\d{1,3}(\.\d{3})*(,\d{2})?$"
                        placeholder="R$ 0,00"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let v = e.target.value.replace(/\D/g, "");
                          v = (Number(v) / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          });
                          e.target.value = v;
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-gray-400">
                    Nenhum nicho cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
}
