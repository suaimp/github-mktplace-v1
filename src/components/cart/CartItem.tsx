import { useState } from "react";
import { useCart } from "../marketplace/ShoppingCartContext";
import { getFaviconUrl } from "../form/utils/formatters";
import { TrashBinIcon } from "../../icons";

interface CartItemProps {
  entryId: string;
  productName: string;
  price: any; // Aceita qualquer tipo, sem formatação
  quantity: number;
  url?: string;
}

export default function CartItem({
  entryId,
  productName,
  price,
  quantity,
  url
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para formatar número para padrão brasileiro
  const formatBrazilianPrice = (value: any): string => {
    if (typeof value === 'number') {
      // Se o número tem mais de 3 dígitos na parte inteira, trata como milhares
      if (value >= 1000) {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        // Para números menores, multiplica por 1000 para converter 17.397 em 17397
        const adjustedValue = value * 1000;
        return `R$ ${adjustedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return value;
  };

  // Debug para ver o formato atual
  console.log("Price recebido:", price, "Tipo:", typeof price);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }

    try {
      setIsUpdating(true);
      await updateQuantity(entryId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUpdating(true);
      await removeItem(entryId);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Format URL to remove protocol and trailing slashes
  const formatUrl = (url: string): string => {
    if (!url) return "";
    return url
      .replace(/^https?:\/\//, "") // Remove http:// or https://
      .replace(/\/$/, ""); // Remove trailing slash
  };

  return (
    <div className="flex items-center justify-between gap-4 text-sm font-medium text-gray-800 dark:text-white/90 p-1 border border-gray-300 rounded-lg dark:border-gray-800">
      {/* URL */}
      <h3 className="flex items-center gap-2 truncate w-[130px] min-w-[130px]">
        {url ? (
          <>
            <img
              src={getFaviconUrl(url)}
              alt="Site icon"
              width="20"
              height="20"
              className="flex-shrink-0"
              onError={(e) => {
                // Fallback if favicon fails to load
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-500 hover:underline truncate"
              title={url}
            >
              {formatUrl(url)}
            </a>
          </>
        ) : (
          productName
        )}
      </h3>

      {/* Quantidade */}
      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isUpdating}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            -
          </button>
          <span className="px-2 py-1 text-gray-700 dark:text-gray-300">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Preço */}
      <p className="whitespace-nowrap font-bold min-w-[80px] text-right">
        {formatBrazilianPrice(price)}
      </p>

      {/* Botão Remover */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
        title="Remover"
      >
        <TrashBinIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
