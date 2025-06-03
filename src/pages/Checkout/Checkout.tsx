import { useState } from "react";
import { useNavigate } from "react-router-dom";
/* components */
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useCart } from "../../components/marketplace/ShoppingCartContext";

import Button from "../../components/ui/button/Button";

import CheckoutCards from "../../components/ServicePackages/cards/CheckoutCards";
import ResumeTable from "../../components/Checkout/ResumeTable";
import CheckoutForm from "../../components/Checkout/CheckoutForm";
import FinishOrder from "../../components/Checkout/FinishOrder";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "credit_card"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart after successful checkout
      await clearCart();

      // Show success message
      setSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error processing checkout:", error);
      console.log(CheckoutForm);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            <Button onClick={() => navigate("/")}>Voltar para a Loja</Button>
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
            <Button onClick={() => navigate("/")}>Voltar para a Loja</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Checkout | Marketplace" description="Finalizar compra" />
      <PageBreadcrumb pageTitle="Checkout" />

      <div className="w-full flex mx-auto">
        <div className="w-full flex flex-col md:flex-row mx-auto gap-8">
          <div className="flex-1 flex flex-col gap-8 mb-8">
            <CheckoutCards />
            <ResumeTable />
          </div>

          <div className="w-[450px] mx-auto       ">
            {/*     <CheckoutForm
              formData={formData}
              loading={loading}
              totalPrice={totalPrice}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmit}
            /> */}

            <FinishOrder
              formData={formData}
              loading={loading}
              totalPrice={totalPrice}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
