import { useState, useEffect } from "react";
import { useCart } from "./ShoppingCartContext";
import { ShoppingCartIcon } from "../../icons";
import { showToast } from "../../utils/toast";

interface AddToCartButtonProps {
  entryId: string;
  productName: string;
  price: number;
  buttonStyle?: "primary" | "outline";
  buttonText?: string;
  image?: string;
  url?: string;
  isInCart?: boolean;
}

export default function AddToCartButton({
  entryId,
  productName,
  price,
  buttonStyle = "primary",
  buttonText = "Comprar",
  image,
  url,
  isInCart = false
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [loading, setLoading] = useState(false);

  const [inCart, setInCart] = useState(isInCart);

  // Check if item is in cart
  useEffect(() => {
    const itemInCart = items.some((item) => item.entry_id === entryId);
    setInCart(itemInCart);
  }, [items, entryId]);

  const handleAddToCart = async () => {
    if (inCart) return;

    try {
      setLoading(true);
      console.log("Adding to cart with price:", price);
      console.log("Dados enviados para addItem:", {
        entryId,
        productName,
        price,
        quantity: 1,
        image,
        url
      });
      await addItem(entryId, productName, price, 1, image, url);

      // Mostrar toast de sucesso
      showToast("Item adicionado ao carrinho!", "success");

      // Reset success state after 2 seconds
      setTimeout(() => {}, 2000);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showToast("Erro ao adicionar item ao carrinho", "error");
    } finally {
      setLoading(false);
    }
  };

  // Define button classes based on style
  const buttonClasses =
    buttonStyle === "primary"
      ? "inline-flex items-center justify-center w-full gap-1 px-2 py-1.5 text-[10px] font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
      : "inline-flex items-center justify-center w-full gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-medium text-gray-700 shadow-theme-xs ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]";

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={e => {
        e.stopPropagation();
        handleAddToCart();
      }}
      disabled={loading || inCart}
    >
      {loading ? (
        <span className="animate-spin stroke-brand-500 text-gray-200 dark:text-gray-800">
          <svg
            width="10"
            height="10"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10"
              cy="10"
              r="8.75"
              stroke="currentColor"
              strokeWidth="2.5"
            ></circle>
            <mask id="path-2-inside-1_3755_26477" fill="white">
              <path d="M18.2372 12.9506C18.8873 13.1835 19.6113 12.846 19.7613 12.1719C20.0138 11.0369 20.0672 9.86319 19.9156 8.70384C19.7099 7.12996 19.1325 5.62766 18.2311 4.32117C17.3297 3.01467 16.1303 1.94151 14.7319 1.19042C13.7019 0.637155 12.5858 0.270357 11.435 0.103491C10.7516 0.00440265 10.179 0.561473 10.1659 1.25187C10.1528 1.94226 10.7059 2.50202 11.3845 2.6295C12.1384 2.77112 12.8686 3.02803 13.5487 3.39333C14.5973 3.95661 15.4968 4.76141 16.1728 5.74121C16.8488 6.721 17.2819 7.84764 17.4361 9.02796C17.5362 9.79345 17.5172 10.5673 17.3819 11.3223C17.2602 12.002 17.5871 12.7178 18.2372 12.9506Z"></path>
            </mask>
            <path
              d="M18.2372 12.9506C18.8873 13.1835 19.6113 12.846 19.7613 12.1719C20.0138 11.0369 20.0672 9.86319 19.9156 8.70384C19.7099 7.12996 19.1325 5.62766 18.2311 4.32117C17.3297 3.01467 16.1303 1.94151 14.7319 1.19042C13.7019 0.637155 12.5858 0.270357 11.435 0.103491C10.7516 0.00440265 10.179 0.561473 10.1659 1.25187C10.1528 1.94226 10.7059 2.50202 11.3845 2.6295C12.1384 2.77112 12.8686 3.02803 13.5487 3.39333C14.5973 3.95661 15.4968 4.76141 16.1728 5.74121C16.8488 6.721 17.2819 7.84764 17.4361 9.02796C17.5362 9.79345 17.5172 10.5673 17.3819 11.3223C17.2602 12.002 17.5871 12.7178 18.2372 12.9506Z"
              stroke="currentColor"
              strokeWidth="4"
              mask="url(#path-2-inside-1_3755_26477)"
            ></path>
          </svg>
        </span>
      ) : inCart ? (
        <svg
          className="w-[10px] h-[10px] text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.70186 12.0001C3.70186 7.41711 7.41711 3.70186 12.0001 3.70186C16.5831 3.70186 20.2984 7.41711 20.2984 12.0001C20.2984 16.5831 16.5831 20.2984 12.0001 20.2984C7.41711 20.2984 3.70186 16.5831 3.70186 12.0001ZM12.0001 1.90186C6.423 1.90186 1.90186 6.423 1.90186 12.0001C1.90186 17.5772 6.423 22.0984 12.0001 22.0984C17.5772 22.0984 22.0984 17.5772 22.0984 12.0001C22.0984 6.423 17.5772 1.90186 12.0001 1.90186ZM15.6197 10.7395C15.9712 10.388 15.9712 9.81819 15.6197 9.46672C15.2683 9.11525 14.6984 9.11525 14.347 9.46672L11.1894 12.6243L9.6533 11.0883C9.30183 10.7368 8.73198 10.7368 8.38051 11.0883C8.02904 11.4397 8.02904 12.0096 8.38051 12.3611L10.553 14.5335C10.7217 14.7023 10.9507 14.7971 11.1894 14.7971C11.428 14.7971 11.657 14.7023 11.8257 14.5335L15.6197 10.7395Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <>
          <ShoppingCartIcon className="w-[10px] h-[10px]" />
          {buttonText}
        </>
      )}
    </button>
  );
}
