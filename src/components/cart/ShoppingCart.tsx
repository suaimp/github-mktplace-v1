import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "../../icons";
import { useCart } from "../marketplace/ShoppingCartContext";
import CartItem from "./CartItem";
import { formatCurrency } from "../marketplace/utils";
import Button from "../ui/button/Button";

export default function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalItems, totalPrice, loading, error } = useCart();
  const navigate = useNavigate();

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const cartElement = document.getElementById("shopping-cart-sidebar");
      const cartButton = document.querySelector(".cart-toggle-button");

      if (
        isOpen &&
        cartElement &&
        !cartElement.contains(event.target as Node) &&
        !cartButton?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  function toggleCart() {
    setIsOpen(!isOpen);
  }

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  console.log("Itens no carrinho:", items);
  console.log("Total items:", totalItems);
  if (items.length > 0) {
    console.log("Primeiro item:", items[0]);
  }

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full cart-toggle-button hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleCart}
      >
        {totalItems > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-5 w-5 rounded-full bg-brand-500 text-xs text-white flex items-center justify-center">
            {totalItems}
          </span>
        )}
        <ShoppingCartIcon className="text-current" width="24" height="24" />
      </button>

      {/* Cart Sidebar */}
      <div
        id="shopping-cart-sidebar"
        className={`fixed top-0 right-0 z-[99999] h-full w-full max-w-md bg-white shadow-xl dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Carrinho
            </h3>
            <button
              onClick={toggleCart}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 z-[99999]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 flex-1">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Carregando...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 flex-1">
                <p className="text-error-500 dark:text-error-400">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 flex-1">
                <svg
                  className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.83179 4.38657H3.34341C4.20256 4.38657 4.96125 4.94691 5.21392 5.76808L8.27786 15.7259C8.53053 16.547 9.28921 17.1074 10.1484 17.1074H17.1114C17.9373 17.1074 18.6743 16.5889 18.9534 15.8116L20.9925 10.1312C21.679 8.21867 20.2616 6.20383 18.2295 6.20383H10.66"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="10.1707"
                    cy="20.5322"
                    r="1.46779"
                    fill="currentColor"
                  />
                  <circle
                    cx="17.0204"
                    cy="20.5322"
                    r="1.46779"
                    fill="currentColor"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Seu carrinho está vazio
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    entryId={item.entry_id}
                    productName={item.product.name}
                    price={item.product.price}
                    quantity={item.quantity}
                    url={item.product.url}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between text-base mb-4">
              <p className="font-bold text-gray-800 dark:text-white/90">
                Subtotal
              </p>
              <p className="font-bold text-gray-800 dark:text-white/90">
                {formatCurrency(totalPrice)}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full"
              disabled={loading}
            >
              Finalizar Compra
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-[99998] transition-opacity duration-300 ease-in-out"
          onClick={toggleCart}
        ></div>
      )}
    </div>
  );
}
