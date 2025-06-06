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

interface ResumeTableProps {
  onReload?: () => void;
}

export default function ResumeTable(props: ResumeTableProps) {
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
      price: item.price,
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
                      <div className="relative">
                        <select
                          className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
                            getSelectedNicheName(item, selectedNiches)
                              ? "text-gray-800 dark:text-white/90"
                              : "text-gray-400 dark:text-gray-400"
                          } pl-4`}
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
                          <option
                            value="Artigo Padrão"
                            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                          >
                            Artigo Padrão
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
                            setSelectedService(
                              (prev: { [id: string]: string }) => ({
                                ...prev,
                                [item.id]: value
                              })
                            );

                            // Atualiza o word_count do pacote selecionado
                            const selectedPkg =
                              serviceCardsByActiveService?.find(
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
                              let serviceArray;
                              if (
                                !value ||
                                value ===
                                  "Nenhum - eu vou fornecer o conteúdo" ||
                                value === ""
                              ) {
                                serviceArray = [
                                  {
                                    title: "Nenhum",
                                    price_per_word: 0,
                                    word_count: 0,
                                    is_free: true,
                                    price: 0
                                  }
                                ];
                              } else {
                                serviceArray = getServicePackageArray(
                                  item,
                                  { ...selectedService, [item.id]: value },
                                  serviceCardsByActiveService ?? []
                                ).map((pkg: any) => ({
                                  ...pkg,
                                  price:
                                    selectedPkg &&
                                    selectedPkg.price !== undefined
                                      ? selectedPkg.price
                                      : 0
                                }));
                              }

                              console.log(
                                "serviceArray",
                                JSON.parse(JSON.stringify(serviceArray))
                              );
                              await updateCartCheckoutResume(item.id, {
                                service_selected: serviceArray
                              });
                            }
                          }}
                        >
                          <option
                            value="Nenhum - eu vou fornecer o conteúdo"
                            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                          >
                            Nenhum - eu vou fornecer o conteúdo
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
                          price: item.price,
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
