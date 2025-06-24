import React from "react";
import { useLocation } from "react-router-dom";

interface OrderProgressProps {
  currentStep: number;
  paymentStatus: "pending" | "processing" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "completed" | "cancelled";
  hasArticleDocument?: boolean;
  articleUrl?: string;
  orderDate?: string;
  showProgressOnly?: boolean;
}

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "pending";
}

const OrderProgress: React.FC<OrderProgressProps> = ({
  currentStep,
  paymentStatus,
  orderStatus, // eslint-disable-line @typescript-eslint/no-unused-vars
  hasArticleDocument = false,
  articleUrl,
  orderDate,
  showProgressOnly = false
}) => {
  const location = useLocation();

  // Verificar se estamos em uma rota de sucesso
  const isSuccessRoute =
    location.pathname.includes("/success") ||
    location.pathname.includes("/boleto-success") ||
    (location.pathname.includes("/payment") &&
      location.search.includes("success=true"));

  // Determinar o status de cada etapa
  const getStepStatus = (
    stepNumber: number
  ): "completed" | "current" | "pending" => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  // Determinar a descrição baseada no status atual
  const getStepDescription = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return "Pedido realizado";
      case 2:
        if (paymentStatus === "paid") return "Pagamento processado";
        if (paymentStatus === "processing") return "Processando pagamento";
        return "Aguardando pagamento";
      case 3:
        if (hasArticleDocument) return "Artigo recebido";
        return "Em preparação";
      case 4:
        if (articleUrl) return "Artigo publicado";
        return "Aguardando";
      default:
        return "";
    }
  };

  const steps: ProgressStep[] = [
    {
      id: 1,
      title: "Compra",
      description: getStepDescription(1),
      icon: (
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
          className="w-3 h-3"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      ),
      status: getStepStatus(1)
    },
    {
      id: 2,
      title: "Pagamento",
      description: getStepDescription(2),
      icon: (
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
          className="w-3 h-3"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      ),
      status: getStepStatus(2)
    },
    {
      id: 3,
      title: "Artigo",
      description: getStepDescription(3),
      icon: (
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
          className="w-3 h-3"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      ),
      status: getStepStatus(3)
    },
    {
      id: 4,
      title: "Publicação",
      description: getStepDescription(4),
      icon: (
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
          className="w-3 h-3"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      ),
      status: getStepStatus(4)
    }
  ];

  // Calcular a largura da barra de progresso
  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;
  // Obter a cor e estilo baseado no status
  const getStepStyles = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return {
          circle:
            "bg-green-500 border-green-500 text-white dark:bg-green-400 dark:border-green-400",
          title: "text-green-700 dark:text-green-400",
          description: "text-green-600 dark:text-green-500"
        };
      case "current":
        return {
          circle:
            "bg-blue-500 border-blue-500 text-white dark:bg-blue-400 dark:border-blue-400",
          title: "text-blue-700 dark:text-blue-400",
          description: "text-blue-600 dark:text-blue-500"
        };
      case "pending":
        return {
          circle:
            "bg-gray-200 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400",
          title: "text-gray-600 dark:text-gray-400",
          description: "text-gray-500 dark:text-gray-500"
        };
    }
  };
  // Obter informações da etapa atual
  const getCurrentStepInfo = () => {
    if (currentStep === 1) {
      return {
        title: "Pedido Confirmado",
        timeEstimate: "Aguardando pagamento",
        details: orderDate
          ? `Pedido realizado em ${orderDate}`
          : "Pedido realizado com sucesso"
      };
    }
    if (currentStep === 2) {
      if (paymentStatus === "processing") {
        return {
          title: "Processando Pagamento",
          timeEstimate: "1-2 dias úteis",
          details: "Aguardando confirmação de pagamento"
        };
      }
      if (paymentStatus === "paid") {
        return {
          title: "Pagamento Confirmado",
          timeEstimate: "Processado com sucesso",
          details: "Pagamento aprovado e confirmado"
        };
      }
      return {
        title: "Aguardando Pagamento",
        timeEstimate: "Pendente",
        details: "Aguardando confirmação de pagamento"
      };
    }
    if (currentStep === 3) {
      if (hasArticleDocument) {
        return {
          title: "Artigo Recebido",
          timeEstimate: "Em análise",
          details: "Artigo recebido e em processo de revisão"
        };
      }
      return {
        title: "Preparação do Artigo",
        timeEstimate: "2-3 dias úteis",
        details: "Aguardando recebimento do artigo para publicação"
      };
    }
    if (currentStep === 4) {
      if (articleUrl) {
        return {
          title: "Artigo Publicado",
          timeEstimate: "Concluído",
          details: "Artigo publicado com sucesso"
        };
      }
      return {
        title: "Publicação do Artigo",
        timeEstimate: "3-5 dias úteis",
        details: "Aguardando publicação do artigo"
      };
    }
    return null;
  };
  const currentStepInfo = getCurrentStepInfo();
  return (
    <div
      className={`mb-6 p-3 rounded-lg border ${
        isSuccessRoute
          ? "bg-transparent border-transparent"
          : "bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progresso do Pedido
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {currentStep} de {steps.length} etapas
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between relative">
          {/* Barra de fundo */}
          <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-300 dark:bg-gray-600"></div>

          {/* Barra de progresso */}
          <div
            className="absolute top-3 left-3 h-0.5 bg-green-500 dark:bg-green-400 transition-all duration-1000 ease-out"
            style={{ width: `calc(${progressWidth}% - 1.5rem)` }}
          ></div>

          {/* Etapas */}
          {steps.map((step) => {
            const styles = getStepStyles(step.status);

            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${styles.circle}`}
                >
                  {step.icon}
                </div>
                <div className="mt-1 text-center">
                  <div className={`font-medium text-xs ${styles.title}`}>
                    {step.title}
                  </div>
                  <div className={`text-xs ${styles.description}`}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>{" "}
      </div>
      {/* Informações da etapa atual - somente se showProgressOnly for false */}
      {!showProgressOnly && currentStepInfo && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{currentStepInfo.title}</span>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {currentStepInfo.timeEstimate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderProgress;
