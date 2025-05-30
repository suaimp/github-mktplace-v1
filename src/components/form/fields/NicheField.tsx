import React, { useEffect, useState } from "react";
import { getFormFieldNicheByFormFieldId } from "../../../context/db-context/services/formFieldNicheService";

interface NicheFieldProps {
  field: { id: string; label?: string };
  settings: {
    value: string | string[] | { niche: string; price: string }[];
    options: { label: string; value: string }[];
    multiple?: boolean;
  };
  error?: string;
  onChange: (
    value: string | string[] | { niche: string; price: string }[]
  ) => void;
}

export default function NicheField({
  value,
  field,
  settings,
  error,
  onChange
}: any) {
  // Log para depuração do value recebido
  console.log("[NicheField] value recebido:", value);

  const { value: initialValue } = settings;
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  // Estado para nichos selecionados e preços
  const [selectedNiches, setSelectedNiches] = useState<
    { niche: string; price: string }[]
  >([]);

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

  // Parse defensivo do valor recebido (igual ou melhor que BrazilianStatesField)
  let parsedValue = value;
  if (typeof parsedValue === "string") {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      parsedValue = [];
    }
  }

  let safeInitialValue: { niche: string; price: string }[] = [];
  if (Array.isArray(parsedValue)) {
    safeInitialValue = parsedValue.map((n: any) => {
      if (typeof n === "string") return { niche: n, price: "" };
      if (typeof n === "object" && n !== null && !("price" in n))
        return { ...n, price: "" };
      return n;
    });
  } else if (
    typeof parsedValue === "object" &&
    parsedValue !== null &&
    Object.prototype.hasOwnProperty.call(parsedValue, "niche")
  ) {
    safeInitialValue = [{ ...(parsedValue as any) }];
  } else {
    safeInitialValue = [];
  }

  // Log detalhado para depuração
  console.log("[NicheField] value recebido:", value);
  console.log("[NicheField] Valor parseado final:", safeInitialValue);

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
                    (item) => item.niche === opt.value
                  );
                  const price =
                    selectedNiches.find((item) => item.niche === opt.value)
                      ?.price || "";
                  return (
                    <tr key={opt.value}>
                      <td className="align-middle">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                            value={opt.value}
                            checked={checked}
                            onChange={(e) =>
                              handleNicheSelect(opt.value, e.target.checked)
                            }
                          />
                          <span>{opt.label}</span>
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
                              handlePriceChange(opt.value, masked);
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
