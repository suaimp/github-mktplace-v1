import { useCart } from "../../components/marketplace/ShoppingCartContext";
import { formatCurrency } from "../../components/marketplace/utils";
import { useState } from "react";
import Tooltip from "../ui/Tooltip";

export default function ResumeTable() {
  const { items, totalPrice } = useCart();

  // Estado para controlar a escolha de redação de cada item
  const [redacaoEscolha, setRedacaoEscolha] = useState<{
    [key: string]: boolean;
  }>(() => Object.fromEntries(items.map((item) => [item.id, false])));

  const handleRedacaoChange = (itemId: string) => {
    setRedacaoEscolha((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Resumo do Pedido
      </h2>

      <div className="mb-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase items-center h-[36px]">
          <span className="flex items-center h-full">Produto</span>
          <span className="flex items-center justify-center h-full">Qtd</span>
          <span className="text-center flex items-center justify-center gap-1 h-full">
            <Tooltip content="Selecione sim, caso deseje comprar os conteúdos. Se você for enviar seus conteúdos, selecione não">
              Redação
            </Tooltip>
          </span>
          <span className="text-right col-span-1 flex items-center justify-end h-full">
            Total
          </span>
        </div>
        <div>
          {items.map((item) => {
            return (
              <div
                key={item.id}
                className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center py-3 min-h-[36px] border-b border-gray-100 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {item.product.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <label
                    className={`flex items-center px-3 py-1 rounded-lg cursor-pointer transition-colors
                      ${
                        redacaoEscolha[item.id]
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }
                    `}
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
                </div>
                <div className="text-right font-medium text-gray-800 dark:text-white/90">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
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
