import { useEffect, useState } from "react";
import {
  getFormFieldNicheByFormFieldId,
  parseNicheData,
  type NicheOption
} from "../../../context/db-context/services/formFieldNicheService";
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

  // Atualiza seleção de nicho (checkbox)
  const handleNicheSelect = (niche: string, checked: boolean) => {
    let updated = [...selectedNiches];
    if (checked) {
      if (!updated.find((item) => item.niche === niche)) {
        updated.push({ niche, price: "" });
      }
    } else {
      updated = updated.filter((item) => item.niche !== niche);
    }
    setSelectedNiches(updated);
    onChange(updated);
  };

  // Atualiza preço de um nicho
  const handlePriceChange = (niche: string, price: string) => {
    const updated = selectedNiches.map((item) =>
      item.niche === niche ? { ...item, price } : item
    );
    setSelectedNiches(updated);
    onChange(updated);
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
    if (Array.isArray(safeInitialValue) && safeInitialValue.length > 0) {
      setSelectedNiches(safeInitialValue);
    } else {
      setSelectedNiches([]);
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
                            className="w-full min-w-[120px] max-w-[180px] border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={price}
                            // Sempre habilitado para permitir o clique
                            onClick={() => {
                              if (!checked) {
                                alert(
                                  "Selecione o nicho antes de digitar o preço."
                                );
                              }
                            }}
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
                          {!checked && (
                            <div
                              className="absolute left-0 top-0 h-full flex items-center justify-center cursor-not-allowed z-10 rounded"
                              style={{
                                pointerEvents: "none",
                                width: "100%",
                                minWidth: "120px",
                                maxWidth: "180px",
                                background: "rgba(255,255,255,0.35)", // cor mais clara
                                ...(window.matchMedia &&
                                window.matchMedia(
                                  "(prefers-color-scheme: dark)"
                                ).matches
                                  ? { background: "rgba(17,24,39,0.35)" } // dark mais claro
                                  : {})
                              }}
                            />
                          )}
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
