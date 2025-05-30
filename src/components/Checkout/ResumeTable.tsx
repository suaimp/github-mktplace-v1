import { useEffect, useState } from "react";
import { useCart } from "../../components/marketplace/ShoppingCartContext";
import { formatCurrency } from "../../components/marketplace/utils";
import Tooltip from "../ui/Tooltip";
import { getFormEntryValuesByEntryId } from "../../context/db-context/services/formEntryValueService";

export default function ResumeTable() {
  const { items } = useCart();
  const [redacaoEscolha, setRedacaoEscolha] = useState<{
    [key: string]: boolean;
  }>(() => Object.fromEntries(items.map((item) => [item.id, false])));
  const [entryValues, setEntryValues] = useState<{
    [entryId: string]: { niche?: string; price?: number };
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAllEntryValues() {
      setLoading(true);
      const valuesObj: {
        [entryId: string]: { niche?: string; price?: number };
      } = {};
      for (const item of items) {
        const entryId = item.entry_id || item.id;
        const values = await getFormEntryValuesByEntryId(entryId);
        const filteredValues = values.filter((v) => v.entry_id === entryId);

        // Pega todos os value_json não nulos
        const valueJsons = filteredValues
          .map((v) => v.value_json)
          .filter((v) => v !== null && v !== undefined);

        console.log("Todos os value_json para entryId", entryId, valueJsons);

        // Se quiser usar o primeiro value_json encontrado (caso queira só um campo niche)
        const firstValueJson = valueJsons[0];
        const nicheValue = firstValueJson?.niche;

        const priceValue = filteredValues.find(
          (v) => v.field_id === "price"
        )?.value;
        valuesObj[entryId] = {
          niche: nicheValue,
          price: priceValue ? Number(priceValue) : undefined
        };
      }
      setEntryValues(valuesObj);
      setLoading(false);
    }
    if (items.length > 0) fetchAllEntryValues();
  }, [items]);

  const handleRedacaoChange = (itemId: string) => {
    setRedacaoEscolha((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Soma total considerando o preço do nicho (se existir), senão usa o preço do produto
  const totalPrice = items.reduce((acc, item) => {
    const entryId = item.entry_id || item.id;
    const price = entryValues[entryId]?.price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Resumo do Pedido
      </h2>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Produto
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center gap-1 justify-center">
                  <span>Qtd</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                Nicho
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                <Tooltip content="Selecione sim, caso deseje comprar os conteúdos. Se você for enviar seus conteúdos, selecione não">
                  Redação
                </Tooltip>
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {items.map((item) => {
              const entryId = item.entry_id || item.id;
              const niche = entryValues[entryId]?.niche || "-";
              const price = entryValues[entryId]?.price ?? item.product.price;
              return (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-left">
                    <div className="flex items-center gap-2">
                      {item.product.url && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${item.product.url}&sz=32`}
                          alt="Site icon"
                          width={20}
                          height={20}
                          className="flex-shrink-0"
                        />
                      )}
                      <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                        {item.product.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      readOnly
                      className="w-16 text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 py-1 px-2"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                    {niche}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                    <label
                      className={
                        `flex items-center px-3 py-1 rounded-lg cursor-pointer transition-colors justify-center mx-auto` +
                        (redacaoEscolha[item.id]
                          ? " bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300")
                      }
                      style={{ width: "max-content", minWidth: 80 }}
                    >
                      <input
                        type="checkbox"
                        checked={redacaoEscolha[item.id]}
                        onChange={() => handleRedacaoChange(item.id)}
                        className={
                          (redacaoEscolha[item.id]
                            ? "accent-green-800 bg-green-800 dark:accent-green-400 dark:bg-green-700"
                            : "accent-red-600 bg-white dark:accent-red-400 dark:bg-gray-800") +
                          " mr-1 rounded-full border-none outline-none ring-0 focus:ring-0 focus:outline-none shadow-none appearance-none flex items-center justify-center relative"
                        }
                        style={{
                          position: "relative",
                          zIndex: 2,
                          width: 6,
                          height: 6
                        }}
                      />
                      <span
                        className={
                          "absolute left-[6px] top-[6px] w-1 h-1 rounded-full transition-colors duration-200 " +
                          (redacaoEscolha[item.id]
                            ? "bg-green-800 dark:bg-green-400 opacity-100"
                            : "bg-white dark:bg-gray-900 opacity-100 border border-gray-300 dark:border-gray-700")
                        }
                        style={{ pointerEvents: "none", zIndex: 1 }}
                      ></span>
                      {redacaoEscolha[item.id] ? "Sim" : "Não"}
                    </label>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 dark:text-white/90 text-right">
                    {formatCurrency(price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 mt-6">
        <div className="flex justify-between">
          <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(totalPrice)}
          </p>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-white/90">
            Total
          </p>
          <p className="font-semibold text-gray-800 dark:text-white/90">
            {formatCurrency(totalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
