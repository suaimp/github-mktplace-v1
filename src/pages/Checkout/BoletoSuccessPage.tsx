import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { formatCurrency } from "../../components/marketplace/utils";
import OrderProgress from "../Orders/local-components/OrderProgress";

export default function BoletoSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [boletoData, setBoletoData] = useState<any>(null);

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

  const orderAmount = boletoData?.amount || 829.0;

  return (
    <>
      <PageMeta
        title="Pagamento Concluído | Marketplace"
        description="Pagamento concluído com sucesso"
      />
      <PageBreadcrumb pageTitle="Pagamento Concluído" />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Obrigado! Pagamento Pendente!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Seu pagamento de {formatCurrency(orderAmount)} está aguardando
                  processamento
                </p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Próximo Passo: Envie seu Conteúdo
                  </h2>
                  <p className="text-blue-800 dark:text-blue-200 mb-4">
                    Para dar continuidade ao seu pedido, você precisa enviar o
                    conteúdo do artigo. Acesse os detalhes do pedido para fazer
                    o upload.
                  </p>{" "}
                  <div className="mb-4">
                    <OrderProgress
                      currentStep={2}
                      paymentStatus="pending"
                      orderStatus="pending"
                      hasArticleDocument={false}
                      articleUrl=""
                      orderDate={new Date().toLocaleDateString("pt-BR")}
                      showProgressOnly={true}
                    />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
                    Acessar Detalhes do Pedido
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                O que acontece agora?
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300">
                    Você receberá um email de confirmação com todos os detalhes
                    da compra
                  </p>
                </div>
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Envie o conteúdo do seu artigo
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Acesse "Detalhes do Pedido" para fazer o upload do arquivo
                      ou inserir o texto
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Prazo de publicação: 3-5 dias úteis
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Após o envio do conteúdo, seu artigo será publicado no
                      site escolhido
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/orders")}
                  className="min-w-[200px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                  Enviar Conteúdo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
