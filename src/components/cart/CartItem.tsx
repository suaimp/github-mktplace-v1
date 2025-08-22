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

  // Função para converter formato americano para brasileiro e garantir 2 casas decimais
  const ensureDecimalFormat = (value: any): string => {
    let numericValue: number;
    
    // Se é número, usa direto
    if (typeof value === 'number') {
      numericValue = value;
    }
    // Se é string no formato americano (ex: "159.80"), converte para número
    else if (typeof value === 'string') {
      numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        return value; // Se não conseguir converter, retorna como está
      }
    }
    else {
      return '0,00';
    }
    
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

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
    <div className="flex flex-col gap-2 text-sm font-medium text-gray-800 dark:text-white/90 p-3 border border-gray-300 rounded-lg dark:border-gray-800 max-[400px]:p-2">
      {/* Layout para telas >= 400px */}
      <div className="hidden min-[400px]:flex items-center justify-between gap-4">
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
          R$ {ensureDecimalFormat(price)}
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

      {/* Layout para telas < 400px */}
      <div className="flex flex-col gap-2 min-[400px]:hidden">
        {/* Nome/URL do produto */}
        <div className="flex items-center gap-2">
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
            <span className="truncate">{productName}</span>
          )}
        </div>

        {/* Preço abaixo do nome/URL */}
        <p className="whitespace-nowrap font-bold">
          R$ {ensureDecimalFormat(price)}
        </p>

        {/* Quantidade e botão remover na mesma linha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isUpdating}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  if (newQuantity > 0) {
                    handleQuantityChange(newQuantity);
                  }
                }}
                disabled={isUpdating}
                className="w-12 text-center py-1 text-gray-700 dark:text-gray-300 bg-transparent border-0 focus:outline-none"
                min="1"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                +
              </button>
            </div>
          </div>

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
      </div>
    </div>
  );
}
