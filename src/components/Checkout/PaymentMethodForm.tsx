import { useState, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm, { StripePaymentFormRef } from "./StripePaymentForm";
import { formatCurrency } from "../marketplace/utils";
import InputMask from "react-input-mask";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";

interface PaymentMethodFormProps {
  paymentMethod: string;
  stripePromise?: any;
  totalAmount: number;
  pixQrCodeUrl: string | null;
  pixCopiaECola: string | null;
  total: number;
  processing: boolean;
  error: string | null;
  termsAccepted: boolean;
  availablePaymentMethods?: string[];
  onPaymentMethodChange: (method: string) => void;
  onTermsAcceptedChange: (accepted: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  /**
   * Callback chamado sempre que os dados do cartão mudam.
   * Recebe o objeto cardData atualizado.
   */
  onCardDataChange?: (cardData: any) => void;
}

export default function PaymentMethodForm({
  paymentMethod,
  stripePromise,
  totalAmount,
  pixQrCodeUrl,
  pixCopiaECola,
  total,
  processing,
  error,
  termsAccepted,
  availablePaymentMethods = ["card", "pix", "boleto"],
  onPaymentMethodChange,
  onTermsAcceptedChange,
  onSubmit,
  onPaymentSuccess,
  onPaymentError,
  onCardDataChange
}: PaymentMethodFormProps) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardholderName: "",
    country: "BR"
  });
  const [pixCopied, setPixCopied] = useState(false);
  const stripePaymentRef = useRef<StripePaymentFormRef>(null);

  // Filter payment methods based on available methods from settings
  const filteredPaymentMethods = [
    { id: "card", label: "Cartão de Crédito", icon: "credit-card" },
    { id: "pix", label: "PIX", icon: "pix" },
    { id: "boleto", label: "Boleto", icon: "barcode" }
  ].filter((method) => availablePaymentMethods.includes(method.id));

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...cardData, [name]: value };
    setCardData(updated);
    if (onCardDataChange) onCardDataChange(updated);
  };
  const handleCopyPixCode = () => {
    if (pixCopiaECola) {
      navigator.clipboard
        .writeText(pixCopiaECola)
        .then(() => {
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 3000);
        })
        .catch((err) => {
          console.error("Erro ao copiar código PIX:", err);
        });
    }
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod === "card" && stripePaymentRef.current) {
      console.log("HANDLING CARD PAYMENT:", {
        paymentMethod: paymentMethod,
        stripeRefExists: !!stripePaymentRef.current,
        timestamp: new Date().toISOString()
      });
      // For Stripe payments, use the ref to trigger payment
      await stripePaymentRef.current.submitPayment();
    } else {
      console.log("HANDLING NON-CARD PAYMENT:", {
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
      });
      // For other payment methods, use the original onSubmit
      onSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center mb-4">
        <svg
          className="w-6 h-6 mr-2 text-gray-800 dark:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Método de pagamento
        </h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Selecione seu método de pagamento preferido
      </p>
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {filteredPaymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                paymentMethod === method.id
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-400"
                  : "border-gray-200 hover:border-brand-500 dark:border-gray-700 dark:hover:border-brand-400"
              }`}
            >
              {method.id === "card" && (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2\"
                    y="5\"
                    width="20\"
                    height="14\"
                    rx="2\"
                    stroke="currentColor\"
                    strokeWidth="2"
                  />
                  <path d="M2 10H22\" stroke="currentColor\" strokeWidth="2" />
                  <path
                    d="M6 15H10\"
                    stroke="currentColor\"
                    strokeWidth="2\"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {method.id === "pix" && (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 8L12 12L20 8L12 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 16L12 20L20 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 12L12 16L20 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {method.id === "boleto" && (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 10H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 14H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 18H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span>{method.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            {" "}
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  ref={stripePaymentRef}
                  amount={totalAmount}
                  currency="brl"
                  onSuccess={onPaymentSuccess}
                  onError={onPaymentError}
                />
              </Elements>
            ) : (
              <form className="space-y-4">
                <div>
                  <Label>Nome no cartão</Label>
                  <Input
                    type="text"
                    name="cardholderName"
                    value={cardData.cardholderName}
                    onChange={handleCardInputChange}
                    placeholder="Nome como aparece no cartão"
                    required
                  />
                </div>

                <div>
                  <Label>Número do cartão</Label>
                  <InputMask
                    mask="9999 9999 9999 9999"
                    value={cardData.cardNumber}
                    onChange={handleCardInputChange}
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de expiração</Label>
                    <InputMask
                      mask="99/99"
                      value={cardData.cardExpiry}
                      onChange={handleCardInputChange}
                      name="cardExpiry"
                      placeholder="MM/AA"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      required
                    />
                  </div>

                  <div>
                    <Label>Código de segurança</Label>
                    <InputMask
                      mask="999"
                      value={cardData.cardCvc}
                      onChange={handleCardInputChange}
                      name="cardCvc"
                      placeholder="CVC"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>País</Label>
                  <Select
                    options={[
                      { value: "BR", label: "Brasil" },
                      { value: "US", label: "Estados Unidos" },
                      { value: "CA", label: "Canadá" },
                      { value: "MX", label: "México" },
                      { value: "AR", label: "Argentina" },
                      { value: "CL", label: "Chile" },
                      { value: "CO", label: "Colômbia" },
                      { value: "PE", label: "Peru" },
                      { value: "UY", label: "Uruguai" }
                    ]}
                    value={cardData.country}
                    onChange={(value) =>
                      setCardData((prev) => ({ ...prev, country: value }))
                    }
                  />
                </div>
              </form>
            )}
          </div>
        )}

        {paymentMethod === "pix" && (
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 text-center">
              Pagamento via PIX
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Escaneie o QR Code abaixo com o aplicativo do seu banco para pagar
            </p>

            <div className="flex justify-center mb-6">
              {pixQrCodeUrl ? (
                <img
                  src={pixQrCodeUrl}
                  alt="QR Code PIX"
                  className="w-48 h-48 border border-gray-200 dark:border-gray-700 p-2 rounded"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
                  <span className="text-gray-400">Gerando QR Code...</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ou copie e cole o código abaixo no seu aplicativo bancário:
              </p>
              <div className="relative">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-center">
                  <p className="text-sm font-mono break-all select-all overflow-hidden">
                    {pixCopiaECola || "Gerando código..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPixCode}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-brand-500 text-white text-xs rounded"
                >
                  {pixCopied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Importante
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    <li>O pagamento via PIX é processado instantaneamente</li>
                    <li>O QR Code e o código PIX são válidos por 30 minutos</li>
                    <li>
                      Após o pagamento, você receberá um email de confirmação
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "boleto" && (
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Instruções para Boleto
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Após clicar em "Pagar", você receberá o boleto por email. O
              pagamento pode levar até 3 dias úteis para ser processado.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Valor: {formatCurrency(total)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vencimento:{" "}
                {new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Importante
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    <li>O boleto tem vencimento em 3 dias úteis</li>
                    <li>
                      Após o pagamento, a compensação pode levar até 3 dias
                      úteis
                    </li>
                    <li>Você receberá o boleto por email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 space-y-2 text-gray-500 dark:text-gray-400">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsAcceptedChange(e.target.checked)}
            className="form-checkbox mr-2 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
          />
          <span>
            Eu aceito os{" "}
            <button
              type="button"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              termos e condições
            </button>
          </span>
        </label>
        {!termsAccepted && (
          <div className="text-error-500 text-sm">
            Por favor, aceite os termos e condições para continuar
          </div>
        )}
      </div>{" "}
      <button
        type="button"
        onClick={handlePaymentSubmit}
        disabled={processing || !termsAccepted}
        className="w-full px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:bg-brand-300"
      >
        {processing ? "Processando..." : `Pagar ${formatCurrency(total)}`}
      </button>
    </div>
  );
}
