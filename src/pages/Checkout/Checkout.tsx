import { useState } from "react";
/* components */
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useCart } from "../../components/marketplace/ShoppingCartContext";
import { CouponProvider } from "../../components/Checkout/providers/CouponProvider";
import { useShopNavigation } from "./hooks/useShopNavigation";

import Button from "../../components/ui/button/Button";

import CheckoutCards from "../../components/ServicePackages/cards/CheckoutCards";
import ResumeTable from "../../components/Checkout/ResumeTable";
import FinishOrder from "../../components/Checkout/FinishOrder";
import { useCustomSticky } from "../../hooks/useCustomSticky";

export default function Checkout() {
  const { items } = useCart();
  //@ts-ignore
  const [orderCompleted, setOrderCompleted] = useState(false);
  const { goToShop } = useShopNavigation();

  // Hook para sticky positioning personalizado
  const stickyHook = useCustomSticky({ offsetTop: 80, onlyOnDesktop: true });

  if (orderCompleted) {
    return (
      <>
        <PageMeta
          title="Pedido Confirmado | Marketplace"
          description="Seu pedido foi confirmado com sucesso"
        />
        <PageBreadcrumb pageTitle="Pedido Confirmado" />

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Pedido Confirmado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seu pedido foi processado com sucesso. Você receberá um email com
              os detalhes do pedido em breve.
            </p>
            <Button onClick={goToShop}>Voltar para a Loja</Button>
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageMeta
          title="Checkout | Marketplace"
          description="Finalizar compra"
        />
        <PageBreadcrumb pageTitle="Checkout" />

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Adicione alguns produtos ao seu carrinho antes de finalizar a
              compra.
            </p>
            <Button onClick={goToShop}>Voltar para a Loja</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <CouponProvider>
      <PageMeta title="Checkout | Marketplace" description="Finalizar compra" />
      <PageBreadcrumb pageTitle="Checkout" />

      <div className="w-full mx-auto min-h-screen md:px-0">
        {/* Layout responsivo: empilhado no mobile, lado a lado no desktop */}
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Conteúdo principal - ocupa toda largura no mobile, flex-1 no desktop */}
          <div className="w-full md:flex-1 flex flex-col gap-6 md:gap-8 mb-6 md:mb-8">
            <CheckoutCards />
            <ResumeTable showCouponInput={true} />
          </div>
          
          {/* Resumo do pedido - aparece abaixo no mobile, lateral no desktop */}
          <div className="w-full md:w-72 lg:w-2/6 md:my-5 md:ml-2 lg:ml-4 order-last md:order-none">
            {/* Placeholder para manter o espaço quando sticky estiver ativo (apenas desktop) */}
            <div className="hidden md:block" ref={stickyHook.placeholderRef} style={stickyHook.placeholderStyle} />
            
            <div 
              ref={stickyHook.ref}
              style={stickyHook.style}
              className="w-full"
            >
              <FinishOrder />
            </div>
          </div>
        </div>
      </div>
    </CouponProvider>
  );
}
