import { useEffect, useState } from "react";
import {
  getFormFieldNicheByFormFieldId,
  parseNicheData,
  type NicheOption
} from "../../../services/db-services/form-services/formFieldNicheService";
import { FormField } from "./types";

interface NicheFieldProps {
  value: any;
  field: FormField;
  error?: string;
  onChange: (value: any) => void;
}

export default function NicheField({
  value,
  field,
  error,
  onChange
}: NicheFieldProps) {
  const [options, setOptions] = useState<NicheOption[]>([]);
  // Estado para nichos selecionados e preços
  const [selectedNiches, setSelectedNiches] = useState<
    { niche: string; price: string }[]
  >([]);

  useEffect(() => {
    async function fetchOptions() {
      if (!field?.id) return;

      console.log("[NicheField] Fetching options for field:", field.id);

      const data = await getFormFieldNicheByFormFieldId(field.id);
      if (data && data.options) {
        console.log("[NicheField] Raw options from DB:", data.options);

        // Usa parseNicheData para processar os dados corretamente
        const parsedOptions = parseNicheData(data.options);
        console.log("[NicheField] Parsed options:", parsedOptions);

        setOptions(parsedOptions);
      } else {
        console.log("[NicheField] No options found");
        setOptions([]);
      }
    }
    fetchOptions();
  }, [field?.id]);

  // Limpa nichos selecionados que não existem mais nas opções disponíveis
  useEffect(() => {
    if (options.length === 0) return;

    console.log("[NicheField] Checking for orphaned selected niches");
    console.log(
      "[NicheField] Available options:",
      options.map((opt) => opt.text)
    );
    console.log(
      "[NicheField] Current selected niches:",
      selectedNiches.map((item) => item.niche)
    );

    const availableNiches = options.map((opt) => opt.text);
    const filteredSelected = selectedNiches.filter((item) =>
      availableNiches.includes(item.niche)
    );

    // Se há diferença, atualiza os nichos selecionados
    if (filteredSelected.length !== selectedNiches.length) {
      console.log("[NicheField] Found orphaned niches, cleaning up");
      console.log(
        "[NicheField] Removed niches:",
        selectedNiches
          .filter((item) => !availableNiches.includes(item.niche))
          .map((item) => item.niche)
      );
      console.log("[NicheField] New selected niches:", filteredSelected);

      setSelectedNiches(filteredSelected);
      onChange(filteredSelected);
    }
  }, [options, selectedNiches, onChange]);

  // Atualiza seleção de nicho (checkbox)
  const handleNicheSelect = (niche: string, checked: boolean) => {
    console.log(
      `[NicheField] handleNicheSelect - niche: ${niche}, checked: ${checked}`
    );
    console.log(
      "[NicheField] handleNicheSelect - current selectedNiches:",
      selectedNiches
    );

    let updated = [...selectedNiches];
    if (checked) {
      if (!updated.find((item) => item.niche === niche)) {
        updated.push({ niche, price: "" });
        console.log(`[NicheField] handleNicheSelect - Added niche: ${niche}`);
      }
    } else {
      updated = updated.filter((item) => item.niche !== niche);
      console.log(`[NicheField] handleNicheSelect - Removed niche: ${niche}`);
    }

    console.log(
      "[NicheField] handleNicheSelect - new selectedNiches:",
      updated
    );
    setSelectedNiches(updated);
    onChange(updated);
    console.log(
      "[NicheField] handleNicheSelect - Called onChange with:",
      updated
    );
  };

  // Atualiza preço de um nicho
  const handlePriceChange = (niche: string, price: string) => {
    console.log(
      `[NicheField] handlePriceChange - niche: ${niche}, price: ${price}`
    );
    console.log(
      "[NicheField] handlePriceChange - current selectedNiches:",
      selectedNiches
    );

    const updated = selectedNiches.map((item) =>
      item.niche === niche ? { ...item, price } : item
    );

    console.log(
      "[NicheField] handlePriceChange - new selectedNiches:",
      updated
    );
    setSelectedNiches(updated);
    onChange(updated);
    console.log(
      "[NicheField] handlePriceChange - Called onChange with:",
      updated
    );
  };

  // Parse defensivo do valor recebido usando parseNicheData
  let parsedValue = value;
  console.log("[NicheField] Initial value received:", value);
  console.log("[NicheField] Value type:", typeof value);

  // Se é string, tenta fazer parse
  if (typeof parsedValue === "string") {
    try {
      parsedValue = JSON.parse(parsedValue);
      console.log("[NicheField] Parsed string to:", parsedValue);
    } catch {
      console.log("[NicheField] Failed to parse string, treating as array");
      parsedValue = [];
    }
  }

  let safeInitialValue: { niche: string; price: string }[] = [];

  if (Array.isArray(parsedValue)) {
    console.log("[NicheField] Processing array value:", parsedValue);

    // Processa cada item usando a lógica similar ao EntryEditModal
    safeInitialValue = parsedValue
      .map((item: any) => {
        console.log("[NicheField] Processing item:", item);

        if (typeof item === "string") {
          return { niche: item, price: "" };
        }

        if (typeof item === "object" && item !== null) {
          // Se tem propriedade 'niche' que é uma string JSON
          if (item.niche && typeof item.niche === "string") {
            if (item.niche.startsWith("{") && item.niche.includes("text")) {
              try {
                const parsedNiche = JSON.parse(item.niche);
                console.log("[NicheField] Parsed niche JSON:", parsedNiche);
                return {
                  niche: parsedNiche.text || item.niche,
                  price: item.price || ""
                };
              } catch {
                console.log("[NicheField] Failed to parse niche JSON");
                return {
                  niche: item.niche,
                  price: item.price || ""
                };
              }
            } else {
              return {
                niche: item.niche,
                price: item.price || ""
              };
            }
          }

          // Se tem propriedade 'text' (formato NicheOption)
          if (item.text) {
            return {
              niche: item.text,
              price: item.price || ""
            };
          }

          // Fallback: se tem outras propriedades
          if (!("price" in item)) {
            return { ...item, price: "" };
          }

          return item;
        }

        return { niche: "", price: "" };
      })
      .filter((item: any) => item.niche && item.niche.trim() !== "");
  } else if (typeof parsedValue === "object" && parsedValue !== null) {
    console.log("[NicheField] Processing single object:", parsedValue);

    if (parsedValue.niche || parsedValue.text) {
      const nicheText = parsedValue.text || parsedValue.niche || "";
      safeInitialValue = [
        {
          niche: nicheText,
          price: parsedValue.price || ""
        }
      ];
    }
  }

  console.log("[NicheField] Final safe initial value:", safeInitialValue);

  // Atualiza seleção inicial se vier do value recebido
  useEffect(() => {
    console.log("[NicheField] useEffect - safeInitialValue:", safeInitialValue);
    console.log(
      "[NicheField] useEffect - current selectedNiches:",
      selectedNiches
    );

    if (Array.isArray(safeInitialValue) && safeInitialValue.length > 0) {
      setSelectedNiches(safeInitialValue);
      console.log(
        "[NicheField] useEffect - Set selectedNiches to:",
        safeInitialValue
      );
    } else {
      setSelectedNiches([]);
      console.log(
        "[NicheField] useEffect - Reset selectedNiches to empty array"
      );
    }
  }, [value]);

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
                options.map((opt) => {
                  const checked = selectedNiches.some(
                    (item) => item.niche === opt.text
                  );
                  const price =
                    selectedNiches.find((item) => item.niche === opt.text)
                      ?.price || "";
                  return (
                    <tr key={opt.text}>
                      <td className="align-middle">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                            value={opt.text}
                            checked={checked}
                            onChange={(e) =>
                              handleNicheSelect(opt.text, e.target.checked)
                            }
                          />
                          <span>{opt.text}</span>
                        </label>
                      </td>
                      <td className="align-middle">
                        <div className="relative">
                          <input
                            type="text"
                            className={`w-full min-w-[120px] max-w-[180px] border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                              !checked ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={price}
                            disabled={!checked}
                            onChange={(e) => {
                              if (!checked) return; // Não permite digitar se não estiver selecionado
                              // Máscara de moeda BRL
                              let raw = e.target.value.replace(/\D/g, "");
                              if (!raw) raw = "0";
                              const masked = (Number(raw) / 100).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL"
                                }
                              );
                              handlePriceChange(opt.text, masked);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
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
