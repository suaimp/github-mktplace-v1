import FeedbackForm from "./FeedbackForm";

export default function FeedbackExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        {" "}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Central de Feedback do Cliente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Valorizamos sua opinião e sugestões para nos ajudar a melhorar nossos
          serviços
        </p>
      </div>

      <FeedbackForm />

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        {" "}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          O que acontece depois que você envia?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">
                1
              </span>
            </div>
            <div>
              {" "}
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Confirmação Imediata
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Você receberá uma confirmação de que seu feedback foi enviado
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">
                2
              </span>
            </div>
            <div>
              {" "}
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Processo de Análise
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Nossa equipe analisará sua sugestão em 2-3 dias úteis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">
                3
              </span>
            </div>
            <div>
              {" "}
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Comunicação de Acompanhamento
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Entraremos em contato com atualizações sobre o status da sua
                sugestão
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-brand-500 mb-1">24h</div>{" "}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tempo Médio de Resposta
          </div>
        </div>

        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-500 mb-1">89%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Taxa de Implementação
          </div>
        </div>

        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-500 mb-1">500+</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Sugestões Recebidas
          </div>
        </div>
      </div>
    </div>
  );
}
