import { useEffect, useState } from "react";
import Tooltip from "../ui/Tooltip";
import { TrashBinIcon } from "../../icons";

import { useResumeTableLogic } from "./useResumeTableLogic";
import WordCountInput from "./utils/WordCountInput";
import ResumeTableSkeleton from "./utils/ResumeTableSkeleton";
import { useCart } from "../marketplace/ShoppingCartContext";

import { getServicePackageArray } from "./utils/servicePackageSelectedUtils";
import { getTotalProductPrice } from "./utils/getTotalProductPrice";
import { getContentPrice } from "./utils/getContentPrice";
import { calculateTotal } from "./utils/calculateTotal";
import { SERVICE_OPTIONS, NICHE_OPTIONS } from "./constants/options";
import { syncItemTotalsToDb } from "./utils/syncItemTotalsToDb";
 

interface ResumeTableProps {
  onReload?: () => void;
  showCouponInput?: boolean;
}

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ResumeTable(props: ResumeTableProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [calculationTrigger, setCalculationTrigger] = useState(0);
  const [wordCountDebounceTimers, setWordCountDebounceTimers] = useState<{ [id: string]: number }>({});

  const logic = useResumeTableLogic();
  // Remover import e uso de useCouponInput, pois não é mais utilizado

  useEffect(() => {
    const handler = () => {
      setReloadKey((k) => k + 1); // força recarregar
      if (typeof props.onReload === "function") props.onReload();
    };
    window.addEventListener("resume-table-reload", handler);
    return () => window.removeEventListener("resume-table-reload", handler);
  }, [props]);

  useEffect(() => {
    if (reloadKey > 0) {
      logic.fetchResumeData();
    }
  }, [reloadKey]);

  // Cleanup dos timers de debounce quando o componente for desmontado
  useEffect(() => {
    return () => {
      Object.values(wordCountDebounceTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [wordCountDebounceTimers]);

  const {
    resumeData,
    loading,
    error,
    quantities,
    setQuantities,
    selectedNiches,
    setSelectedNiches,
    selectedService,
    setSelectedService,
    wordCounts,
    setWordCounts,
    loadingItem,
    handleQuantityChange,
    handleQuantityBlur,
    handleNicheChange,
    handleWordCountChange,
    serviceCardsByActiveService,
    getSelectedNicheName,
    getSelectedServiceTitle,
    getNichePrice
  } = logic;

  // Debounced trigger para cálculos - espera 500ms de inatividade
  const debouncedCalculationTrigger = useDebounce(calculationTrigger, 500);

  // Trigger de mudanças para atualizar o cálculo
  useEffect(() => {
    setCalculationTrigger((prev) => prev + 1);
  }, [
    resumeData,
    quantities,
    selectedNiches,
    selectedService,
    wordCounts,
    serviceCardsByActiveService
  ]);

  // Calcular e atualizar totais apenas após debounce
  useEffect(() => {
    if (debouncedCalculationTrigger > 0 && resumeData.length > 0) {
      // Calcular valores de produto (APENAS item.price × quantidade, sem nichos ou conteúdo)
      const totalProductPricesArray = resumeData.map((item: any) => {
        const quantity = quantities[item.id] ?? item.quantity ?? 1;
        const nichePrice = getNichePrice(item, selectedNiches);

        if (nichePrice > 0) {
          return nichePrice * quantity;
        }
        return Number(item.price) * quantity;
      });

      // Calcular valores de conteúdo separadamente
      const totalContentPricesArray = resumeData.map((item: any) =>
        getContentPrice({
          item,
          wordCounts,
          selectedService,
          serviceCardsByActiveService,
          getServicePackageArray
        })
      );

      // Calcular contagem total de palavras
      const totalWordCountArray = resumeData.map((item: any) => {
        const itemWordCount = wordCounts[item.id];
        return typeof itemWordCount === "number" ? itemWordCount : 0;
      });

      // Calcular total final (produto + conteúdo)
      const totalFinalPricesArray = resumeData.map((item: any) => {
        return getTotalProductPrice({
          item,
          quantities,
          selectedNiches,
          selectedService,
          wordCounts,
          serviceCardsByActiveService,
          getServicePackageArray,
          getNichePrice
        });
      });

      calculateTotal(
        totalFinalPricesArray,
        totalProductPricesArray,
        totalContentPricesArray,
        totalWordCountArray
      ).catch((error) => {
        console.error("Erro ao calcular totais:", error);
      });
    }
  }, [debouncedCalculationTrigger]);

  const { removeItem } = useCart();

  const handleRemove = async (id: string, entryId?: string) => {
    if (!window.confirm("Tem certeza que deseja remover este item?")) return;
    try {
      if (typeof window !== "undefined") {
        document.body.style.cursor = "wait";
      }
      const { deleteCartCheckoutResume } = await import(
        "../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService"
      );
      const success = await deleteCartCheckoutResume(id);
      if (success) {
        // Remove do carrinho também
        if (entryId) {
          await removeItem(entryId);
        }
        // Dispara evento para recarregar a tabela
        window.dispatchEvent(new Event("resume-table-reload"));
      } else {
        alert("Erro ao remover item do resumo.");
      }
    } finally {
      if (typeof window !== "undefined") {
        document.body.style.cursor = "default";
      }
    }
  };

  // Função local para calcular o total de uma linha, idêntica à renderização
  function getTotalForRow(item: any) {
    return getTotalProductPrice({
      item,
      quantities,
      selectedNiches,
      selectedService,
      wordCounts,
      serviceCardsByActiveService,
      getServicePackageArray,
      getNichePrice
    });
  }

  // State para armazenar o total de cada item por id
  const [totalsMap, setTotalsMap] = useState<{ [id: string]: number }>({});

  // Calcule todos os totais sempre que os dados relevantes mudarem
  useEffect(() => {
    const newTotals: { [id: string]: number } = {};
    resumeData.forEach((item: any) => {
      newTotals[item.id] = getTotalProductPrice({
        item,
        quantities,
        selectedNiches,
        selectedService,
        wordCounts,
        serviceCardsByActiveService,
        getServicePackageArray,
        getNichePrice
      });
    });
    setTotalsMap(newTotals);
    // Removido: syncItemTotalsToDb(newTotals);
  }, [
    resumeData,
    quantities,
    selectedNiches,
    selectedService,
    wordCounts,
    serviceCardsByActiveService,
    getServicePackageArray,
    getNichePrice
  ]);

  // Loga o objeto e envia para o banco sempre que for alterado
  useEffect(() => {
    if (Object.keys(totalsMap).length > 0) {
      syncItemTotalsToDb(totalsMap);
    }
  }, [totalsMap]);

  if (loading) {
    // O skeleton deve ter o mesmo número de linhas que resumeData teria
    // Se resumeData já está vazio, pode usar um valor padrão (ex: 3)
    const rowCount =
      resumeData && resumeData.length > 0 ? resumeData.length : 3;
    return <ResumeTableSkeleton rowCount={rowCount} />;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Função local para formatar moeda (BRL)
  function formatCurrency(value: any): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Revisão de pedido
      </h2>
      {/* Removido input de cupom de desconto para responsabilidade única */}
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm text-gray-700 dark:text-gray-200 font-normal">
                Produto (URL)
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal" style={{ display: 'none' }}>
                Qtd
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Nicho
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                <Tooltip content="Selecione um opção, caso deseje comprar os conteúdos.">
                  Pacote de Conteúdo
                </Tooltip>
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Palavras
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Total
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {resumeData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Nenhum item no resumo do pedido.
                </td>
              </tr>
            ) : (
              resumeData.map((item: any) => {
                let niches: any[] = [];
                try {
                  niches = item.niche ? JSON.parse(item.niche) : [];
                } catch {
                  niches = [];
                }
                // Opções de pacote de conteúdo (exemplo: pode ser customizado conforme sua regra)

                // Preço do nicho selecionado (se houver)
                // @ts-ignore
                let price = Number(item.price);
                if (niches.length > 0 && selectedNiches[item.id]) {
                  const found = niches.find(
                    (n: any) => n.niche === selectedNiches[item.id]
                  );
                  if (found && found.price) {
                    price = Number(
                      String(found.price)
                        .replace(/[^0-9,.-]+/g, "")
                        .replace(",", ".")
                    );
                  }
                }
                // Use o total calculado do totalsMap
                const totalValue = totalsMap[item.id] ?? 0;
                return (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-left">
                      <div className="flex items-center gap-2">
                        {item.product_url && (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${item.product_url}&sz=32`}
                            alt="Site icon"
                            width={20}
                            height={20}
                            className="flex-shrink-0"
                          />
                        )}
                        <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                          {item.product_url
                            ? item.product_url.replace(/^(https?:\/\/)?(www\.)?/, "")
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center" style={{ display: 'none' }}>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          min={1}
                          value={quantities[item.id] ?? item.quantity ?? 1}
                          onChange={async (e) => {
                            const value = Math.max(1, Number(e.target.value));
                            setQuantities((prev: { [id: string]: number }) => ({
                              ...prev,
                              [item.id]: value
                            }));
                            // Atualiza no backend imediatamente ao digitar
                            await handleQuantityChange(
                              item,
                              value,
                              (updater) => updater,
                              {
                                item,
                                quantities: { ...quantities, [item.id]: value },
                                selectedNiches,
                                selectedService,
                                wordCounts,
                                serviceCardsByActiveService,
                                getServicePackageArray,
                                getNichePrice,
                                getTotalForRow,
                                item_total: totalsMap[item.id] ?? 0
                              }
                            );
                          }}
                          onBlur={() =>
                            handleQuantityBlur(
                              item,
                              quantities[item.id] ?? item.quantity ?? 1,
                              {
                                item,
                                quantities,
                                selectedNiches,
                                selectedService,
                                wordCounts,
                                serviceCardsByActiveService,
                                getServicePackageArray,
                                getNichePrice,
                                getTotalForRow,
                                item_total: totalsMap[item.id] ?? 0
                              }
                            )
                          }
                          className="w-16 text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-300 py-0 h-7 px-2"
                          style={{ MozAppearance: "textfield" }}
                          disabled={!!loadingItem[item.id]}
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      <div className="relative">
                        <select
                          className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                            getSelectedNicheName(item, selectedNiches) === NICHE_OPTIONS.PLACEHOLDER
                              ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800 text-gray-800 dark:text-white/90"
                              : getSelectedNicheName(item, selectedNiches)
                              ? "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800 text-gray-800 dark:text-white/90"
                              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400"
                          } pl-4`}
                          value={getSelectedNicheName(item, selectedNiches) || NICHE_OPTIONS.PLACEHOLDER}
                          onChange={async (e) => {
                            const value = e.target.value;
                            
                            if (!value || value === NICHE_OPTIONS.PLACEHOLDER) {
                              setSelectedNiches(
                                (prev: { [id: string]: string }) => ({
                                  ...prev,
                                  [item.id]: NICHE_OPTIONS.PLACEHOLDER
                                })
                              );
                              
                              // Salvar o placeholder no banco para que o hook de validação possa detectá-lo
                              await handleNicheChange(
                                item,
                                [{ niche: NICHE_OPTIONS.PLACEHOLDER, price: "0" }],
                                setSelectedNiches,
                                {
                                  item,
                                  quantities,
                                  selectedNiches: { ...selectedNiches, [item.id]: NICHE_OPTIONS.PLACEHOLDER },
                                  selectedService,
                                  wordCounts,
                                  serviceCardsByActiveService,
                                  getServicePackageArray,
                                  getNichePrice
                                }
                              );
                              // Disparar evento para notificar mudança
                              window.dispatchEvent(new Event("niche-selection-changed"));
                              return;
                            }
                            if (value === NICHE_OPTIONS.DEFAULT) {
                              setSelectedNiches(
                                (prev: { [id: string]: string }) => ({
                                  ...prev,
                                  [item.id]: "Nenhum"
                                })
                              );
                              await handleNicheChange(
                                item,
                                [{ niche: "Nenhum", price: "0" }],
                                setSelectedNiches,
                                {
                                  item,
                                  quantities,
                                  selectedNiches: { ...selectedNiches, [item.id]: "Nenhum" },
                                  selectedService,
                                  wordCounts,
                                  serviceCardsByActiveService,
                                  getServicePackageArray,
                                  getNichePrice
                                }
                              );
                              // Disparar evento para notificar mudança
                              window.dispatchEvent(new Event("niche-selection-changed"));
                              return;
                            }
                            setSelectedNiches(
                              (prev: { [id: string]: string }) => ({
                                ...prev,
                                [item.id]: value
                              })
                            );
                            const foundNiche = niches.find(
                              (n: any) => n.niche === value
                            );
                            const priceString =
                              foundNiche && foundNiche.price
                                ? String(foundNiche.price)
                                : "";

                            await handleNicheChange(
                              item,
                              [{ niche: value, price: priceString }],
                              setSelectedNiches,
                              {
                                item,
                                quantities,
                                selectedNiches: { ...selectedNiches, [item.id]: value },
                                selectedService,
                                wordCounts,
                                serviceCardsByActiveService,
                                getServicePackageArray,
                                getNichePrice
                              }
                            );
                            // Disparar evento para notificar mudança
                            window.dispatchEvent(new Event("niche-selection-changed"));
                          }}
                        >
                          <option
                            value={NICHE_OPTIONS.PLACEHOLDER}
                            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                            disabled
                          >
                            {NICHE_OPTIONS.PLACEHOLDER}
                          </option>
                          <option
                            value={NICHE_OPTIONS.DEFAULT}
                            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                          >
                            {NICHE_OPTIONS.DEFAULT}
                          </option>
                          {niches.map((n: any, idx: number) => (
                            <option
                              key={idx}
                              value={n.niche}
                              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                            >
                              {n.niche} {n.price && `(${n.price})`}
                            </option>
                          ))}
                        </select>
                        {getSelectedNicheName(item, selectedNiches) === NICHE_OPTIONS.PLACEHOLDER ? (
                          <span className="absolute top-1/2 right-3.5 -translate-y-1/2">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M2.58325 7.99967C2.58325 5.00813 5.00838 2.58301 7.99992 2.58301C10.9915 2.58301 13.4166 5.00813 13.4166 7.99967C13.4166 10.9912 10.9915 13.4163 7.99992 13.4163C5.00838 13.4163 2.58325 10.9912 2.58325 7.99967ZM7.99992 1.08301C4.17995 1.08301 1.08325 4.17971 1.08325 7.99967C1.08325 11.8196 4.17995 14.9163 7.99992 14.9163C11.8199 14.9163 14.9166 11.8196 14.9166 7.99967C14.9166 4.17971 11.8199 1.08301 7.99992 1.08301ZM7.09932 5.01639C7.09932 5.51345 7.50227 5.91639 7.99932 5.91639H7.99999C8.49705 5.91639 8.89999 5.51345 8.89999 5.01639C8.89999 4.51933 8.49705 4.11639 7.99999 4.11639H7.99932C7.50227 4.11639 7.09932 4.51933 7.09932 5.01639ZM7.99998 11.8306C7.58576 11.8306 7.24998 11.4948 7.24998 11.0806V7.29627C7.24998 6.88206 7.58576 6.54627 7.99998 6.54627C8.41419 6.54627 8.74998 6.88206 8.74998 7.29627V11.0806C8.74998 11.4948 8.41419 11.8306 7.99998 11.8306Z" fill="#F04438"></path>
                            </svg>
                          </span>
                        ) : (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                              className="stroke-gray-500 dark:stroke-gray-400"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      <div className="relative">
                        <select
                          className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
                            getSelectedServiceTitle(item, selectedService)
                              ? "text-gray-800 dark:text-white/90"
                              : "text-gray-400 dark:text-gray-400"
                          } pl-4`}
                          value={getSelectedServiceTitle(item, selectedService)}
                          onChange={async (e) => {
                            const value = e.target.value;
                            setSelectedService((prev: { [id: string]: string }) => ({
                              ...prev,
                              [item.id]: value
                            }));

                            // Atualiza o word_count do pacote selecionado
                            const selectedPkg = serviceCardsByActiveService?.find(
                              (option: any) => option.title === value
                            );
                            setWordCounts((prev) => ({
                              ...prev,
                              [item.id]: selectedPkg?.word_count ?? ""
                            }));

                            // Atualiza no banco usando o value selecionado diretamente
                            if (item.id) {
                              const { updateCartCheckoutResume } = await import(
                                "../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService"
                              );
                              let serviceArray;
                              if (!value || value === SERVICE_OPTIONS.NONE || value === "") {
                                serviceArray = [
                                  {
                                    title: value || SERVICE_OPTIONS.NONE,
                                    price_per_word: 0,
                                    word_count: 0,
                                    is_free: true,
                                    price: 0,
                                    benefits: []
                                  }
                                ];
                              } else {
                                const baseServiceArray = getServicePackageArray(
                                  item,
                                  { ...selectedService, [item.id]: value },
                                  serviceCardsByActiveService ?? []
                                );
                                serviceArray = baseServiceArray.map((pkg: any) => ({
                                  ...pkg,
                                  price: selectedPkg?.price ?? 0,
                                  word_count: selectedPkg?.word_count ?? 0
                                }));
                              }
                              await updateCartCheckoutResume(item.id, {
                                service_selected: serviceArray
                              });
                            }
                          }}
                        >
                          <option
                            value={SERVICE_OPTIONS.NONE}
                            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                          >
                            {SERVICE_OPTIONS.NONE}
                          </option>
                          {serviceCardsByActiveService &&
                            serviceCardsByActiveService.length > 0 &&
                            serviceCardsByActiveService.map(
                              (option: any, idx: number) => (
                                <option
                                  key={option.id || idx}
                                  value={option.title}
                                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                                >
                                  {option.title}
                                </option>
                              )
                            )}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="stroke-gray-500 dark:stroke-gray-400"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </td>
                    {/* Coluna Palavras sempre visível, input só se houver option.title selecionado */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      {(() => {
                        const selected =
                          selectedService[item.id] ??
                          getSelectedServiceTitle(item, selectedService);
                        
                        if (
                          !selected ||
                          selected.trim().toLowerCase().startsWith("nenhum") ||
                          selected === SERVICE_OPTIONS.NONE
                        ) {
                          return null;
                        }
                        
                        const inputValue = wordCounts[item.id] ?? "";
                        
                        return (
                          <WordCountInput
                            value={inputValue}
                            onChange={async (value: number) => {
                              setWordCounts((prev: { [id: string]: number | "" }) => ({
                                ...prev,
                                [item.id]: value
                              }));

                              // Debounce para evitar muitas chamadas ao banco
                              if (wordCountDebounceTimers[item.id]) {
                                clearTimeout(wordCountDebounceTimers[item.id]);
                              }

                              const timer = setTimeout(async () => {
                                // Pegue o título do pacote selecionado no estado atual
                                const selectedTitle = selectedService[item.id] ?? getSelectedServiceTitle(item, selectedService);
                                const selectedPkg = serviceCardsByActiveService?.find(
                                  (option: any) => option.title === selectedTitle
                                );

                                // Monte o array correto para enviar ao banco
                                const serviceArray = selectedPkg
                                  ? [{
                                      title: selectedPkg.title,
                                      price: selectedPkg.price,
                                      price_per_word: selectedPkg.price_per_word,
                                      word_count: value,
                                      is_free: selectedPkg.is_free,
                                      benefits: selectedPkg.benefits
                                    }]
                                  : [{
                                      title: selectedTitle || "Nenhum",
                                      price: 0,
                                      price_per_word: 0,
                                      word_count: value,
                                      is_free: true,
                                      benefits: []
                                    }];

                                await handleWordCountChange(
                                  item,
                                  value,
                                  serviceArray,
                                  {
                                    item,
                                    quantities,
                                    selectedNiches,
                                    selectedService,
                                    wordCounts: { ...wordCounts, [item.id]: value },
                                    serviceCardsByActiveService,
                                    getServicePackageArray,
                                    getNichePrice
                                  }
                                );
                              }, 500);

                              setWordCountDebounceTimers(prev => ({
                                ...prev,
                                [item.id]: timer
                              }));
                            }}
                          />
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 dark:text-white/90 text-right">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <button
                        type="button"
                        aria-label="Remover item"
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded disabled:opacity-50"
                        onClick={() => handleRemove(item.id, item.entry_id)}
                        disabled={!!loadingItem[item.id]}
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
