import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { formatCurrency } from "../../components/marketplace/utils";

export default function BoletoSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [boletoData, setBoletoData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Get boleto data from location state or use mock data
  useEffect(() => {
    if (location.state?.boletoData) {
      setBoletoData(location.state.boletoData);
    } else {
      // Mock data for testing
      setBoletoData({
        barCode: "42297.11504 00064.897317 04021.401122 1 11070000082900",
        amount: 829.0,
        expirationDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("pt-BR"),
        boletoUrl: "#"
      });
    }
  }, [location]);

  const handleCopyBarcode = () => {
    if (boletoData?.barCode) {
      navigator.clipboard
        .writeText(boletoData.barCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch((err) => {
          console.error("Erro ao copiar código de barras:", err);
        });
    }
  };

  const handlePrintBoleto = () => {
    if (boletoData?.boletoUrl) {
      window.open(boletoData.boletoUrl, "_blank");
    } else {
      alert("URL do boleto não disponível");
    }
  };

  return (
    <>
      <PageMeta
        title="Boleto Gerado | Marketplace"
        description="Seu boleto foi gerado com sucesso"
      />
      <PageBreadcrumb pageTitle="Boleto Gerado" />

      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Falta pouco!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Pague {boletoData ? formatCurrency(boletoData.amount) : "..."}{" "}
                via Boleto para concluir sua compra
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Instruções de pagamento
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Para pagar pelo Internet Banking, copie a linha digitável ou
              escaneie o código de barras. Para pagar em qualquer banco, caixa
              eletrônico ou lotérica, por favor, imprima o boleto.
            </p>

            <div className="flex items-start mb-6">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">
                Aprovação em 1 ou 2 dias úteis. Os pagamentos feitos nos fins de
                semana ou feriados serão aprovados no dia útil seguinte.
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
                    <li>
                      Confirmaremos a data de entrega quando o pagamento for
                      aprovado.
                    </li>
                    <li>
                      O boleto tem vencimento em{" "}
                      {boletoData?.expirationDate || "3 dias úteis"}
                    </li>
                    <li>
                      Após o pagamento, a compensação pode levar até 3 dias
                      úteis
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAioAAAAKAQAAAACyeEgBAAAAT0lEQVR4Xu3MsQnAMAxEUYFbgVYRuD3w6oJrBV5FoNZFkinSuP18nmiBowD2tgWeImmGUtfJ/mqqV3NHUPL4mfs9CCi8bQSXRYpc5jL/MQ8LOG2w3NLbfQAAAABJRU5ErkJg"
                  alt="Código de barras"
                  className="w-full h-24 object-contain"
                />
              </div>

              <div className="w-full text-center mb-4">
                <p className="text-gray-700 dark:text-gray-300 font-mono break-all">
                  {boletoData?.barCode ||
                    "42297.11504 00064.897317 04021.401122 1 11070000082900"}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={handleCopyBarcode} className="min-w-[180px]">
                {copied ? "Copiado!" : "Copiar linha digitável"}
              </Button>

              <Button
                variant="outline"
                onClick={handlePrintBoleto}
                className="min-w-[180px]"
              >
                Imprimir boleto
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/orders")}
                className="min-w-[180px]"
              >
                Ver Meus Pedidos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
