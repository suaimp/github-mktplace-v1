import { useEffect, useState } from "react";
import Tooltip from "../ui/Tooltip";
import { TrashBinIcon } from "../../icons";

import { useResumeTableLogic } from "./useResumeTableLogic";
import WordCountInput from "./utils/WordCountInput";
import ResumeTableSkeleton from "./utils/ResumeTableSkeleton";
import { useCart } from "../marketplace/ShoppingCartContext";

import { getServicePackageArray } from "./utils/servicePackageSelectedUtils";
import { getTotalProductPrice } from "./utils/getTotalProductPrice";
import { calculateTotal } from "./utils/calculateTotal";

export default function ResumeTable(props: any) {
  const [reloadKey, setReloadKey] = useState(0);

  const logic = useResumeTableLogic();

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
    serviceCardsByActiveService,
    getSelectedNicheName,
    getSelectedServiceTitle,
    getNichePrice
  } = logic;

  const { removeItem } = useCart();

  const handleRemove = async (id: string, entryId?: string) => {
    if (!window.confirm("Tem certeza que deseja remover este item?")) return;
    try {
      if (typeof window !== "undefined") {
        document.body.style.cursor = "wait";
      }
      const { deleteCartCheckoutResume } = await import(
        "../../context/db-context/services/CartCheckoutResumeService"
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

  // Calcular todos os totais dos produtos
  const totalProductPricesArray = resumeData.map((item: any) =>
    getTotalProductPrice({
      item,
      quantities,
      selectedNiches,
      selectedService,
      wordCounts,
      serviceCardsByActiveService,
      getServicePackageArray,
      getNichePrice
    })
  );

  calculateTotal(totalProductPricesArray);

  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Revisão de pedido
      </h2>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm text-gray-700 dark:text-gray-200 font-normal">
                Produto (URL)
              </th>
              <th className="px-3 py-3.5 text-center text-sm text-gray-700 dark:text-gray-200 font-normal">
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
                          {item.product_url || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
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
                              (updater) => {
                                // Atualiza resumeData localmente para refletir o valor no input
                                // (updater é uma função que recebe o estado anterior do resumeData)
                                // Aqui, só chamamos updater para manter compatibilidade, mas o estado é controlado por useState
                                return updater;
                              }
                            );
                          }}
                          onBlur={() =>
                            handleQuantityBlur(
                              item,
                              quantities[item.id] ?? item.quantity ?? 1
                            )
                          }
                          className="w-16 text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 py-1 px-2"
                          style={{ MozAppearance: "textfield" }}
                          disabled={!!loadingItem[item.id]}
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      {niches.length > 0 ? (
                        <select
                          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm px-3 py-2 w-full min-w-[120px] max-w-[180px] appearance-none"
                          style={{
                            background:
                              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.79175 7.396L10.0001 12.6043L15.2084 7.396' stroke='rgba(107,114,128,1)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") no-repeat right 0.75rem center/1.25rem 1.25rem, white",
                            paddingRight: "2.5rem",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none"
                          }}
                          value={getSelectedNicheName(item, selectedNiches)}
                          onChange={async (e) => {
                            const value = e.target.value;
                            if (!value) {
                              setSelectedNiches(
                                (prev: { [id: string]: string }) => ({
                                  ...prev,
                                  [item.id]: "Nenhum"
                                })
                              );
                              await handleNicheChange(
                                item,
                                [{ niche: "Nenhum", price: "0" }],
                                setSelectedNiches
                              );
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
                              setSelectedNiches
                            );
                          }}
                        >
                          <option value="">Nenhum</option>
                          {niches.map((n: any, idx: number) => (
                            <option key={idx} value={n.niche}>
                              {n.niche} {n.price && `(${n.price})`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 italic">
                          Nicho não cadastrado
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      <select
                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm px-3 py-2 w-full min-w-[120px] max-w-[180px] appearance-none"
                        style={{
                          background:
                            "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.79175 7.396L10.0001 12.6043L15.2084 7.396' stroke='rgba(107,114,128,1)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E') no-repeat right 0.75rem center/1.25rem 1.25rem, white",
                          paddingRight: "2.5rem",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none"
                        }}
                        value={getSelectedServiceTitle(item, selectedService)}
                        onChange={async (e) => {
                          const value = e.target.value;
                          setSelectedService(
                            (prev: { [id: string]: string }) => ({
                              ...prev,
                              [item.id]: value
                            })
                          );
                          // Atualiza o word_count do pacote selecionado
                          const selectedPkg = serviceCardsByActiveService?.find(
                            (option: any) => option.title === value
                          );
                          setWordCounts((prev) => ({
                            ...prev,
                            [item.id]:
                              selectedPkg &&
                              selectedPkg.word_count !== undefined
                                ? selectedPkg.word_count
                                : ""
                          }));
                          // Atualiza no backend em background
                          if (item.id) {
                            const { updateCartCheckoutResume } = await import(
                              "../../context/db-context/services/CartCheckoutResumeService"
                            );
                            // Se "Nenhum" ou vazio, envia array padrão
                            const serviceArray =
                              !value || value === "Nenhum" || value === ""
                                ? [
                                    {
                                      title: "Nenhum",
                                      price_per_word: 0,
                                      word_count: 0,
                                      is_free: true
                                    }
                                  ]
                                : getServicePackageArray(
                                    item,
                                    { ...selectedService, [item.id]: value },
                                    serviceCardsByActiveService ?? []
                                  );
                            await updateCartCheckoutResume(item.id, {
                              service_selected: serviceArray
                            });
                          }
                        }}
                      >
                        <option value="">
                          Nenhum - Eu vou fornecer o conteúdo
                        </option>
                        {serviceCardsByActiveService &&
                          serviceCardsByActiveService.length > 0 &&
                          serviceCardsByActiveService.map(
                            (option: any, idx: number) => (
                              <option
                                key={option.id || idx}
                                value={option.title}
                              >
                                {option.title}
                              </option>
                            )
                          )}
                      </select>
                    </td>
                    {/* Coluna Palavras sempre visível, input só se houver option.title selecionado */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                      {(() => {
                        const selected =
                          selectedService[item.id] ??
                          getSelectedServiceTitle(item, selectedService);
                        if (
                          !selected ||
                          selected.trim().toLowerCase().startsWith("nenhum")
                        ) {
                          return null;
                        }
                        return (
                          <WordCountInput
                            value={wordCounts[item.id] ?? ""}
                            onChange={(value: number) => {
                              setWordCounts(
                                (prev: { [id: string]: number | "" }) => ({
                                  ...prev,
                                  [item.id]: value
                                })
                              );
                            }}
                          />
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 dark:text-white/90 text-right">
                      {formatCurrency(
                        getTotalProductPrice({
                          item,
                          quantities,
                          selectedNiches,
                          selectedService,
                          wordCounts,
                          serviceCardsByActiveService,
                          getServicePackageArray,
                          getNichePrice
                        })
                      )}
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
