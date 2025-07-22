import { useState } from "react";

// Define the TypeScript interface for FAQ items
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Define the FAQ data
const faqData: FAQItem[] = [
  {
    id: 0,
    question: "Como comprar um link em portais?",
    answer:
      "Para comprar um link, basta acessar nossa página de marketplace, selecionar o portal desejado e clicar em 'comprar'. Defina se o conteúdo será produzido por você ou por nossa equipe e, em seguida, realize o pagamento. O processo é simples, rápido e seguro."
  },
  {
    id: 1,
    question: "Como enviar o conteúdo para publicação?",
    answer:
      "Após realizar o pedido, basta seguir o padrão indicado no link de exemplo fornecido e fazer o upload do conteúdo diretamente na página do pedido, no campo referente ao site escolhido para publicação."
  },
  {
    id: 2,
    question: "Como enviar minhas pautas para produção de conteúdo?",
    answer:
      "Após a confirmação do pedido, aguarde até 24 horas para que nossa equipe entre em contato solicitando as pautas para a produção do seu artigo. Caso ainda não tenha as pautas definidas, não se preocupe — podemos sugerir algumas opções com base no tema do portal escolhido."
  },
  {
    id: 3,
    question: "Em quanto tempo meu conteúdo será publicado?",
    answer:
      "O prazo médio para publicação varia de acordo com o portal escolhido, mas geralmente ocorre entre 3 a 7 dias úteis após a aprovação do conteúdo. Caso haja urgência, consulte nossa equipe sobre prazos expressos."
  },
  {
    id: 4,
    question: "O conteúdo publicado ficará no ar por quanto tempo?",
    answer:
      "A maioria dos portais mantém os conteúdos publicados por tempo indeterminado. No entanto, recomendamos verificar essa informação na descrição de cada portal antes da compra."
  },
  {
    id: 5,
    question: "Posso editar ou substituir o conteúdo após a publicação?",
    answer:
      "Não. Após o envio do conteúdo e o início do processo de publicação, não é possível realizar alterações ou substituições. Recomendamos revisar atentamente o material antes de enviá-lo, pois ele será publicado conforme foi submetido."
  },
  {
    id: 6,
    question: "A publicação garante posicionamento no Google?",
    answer:
      "Embora publicações em portais relevantes contribuam para o SEO do seu site, não garantimos posições específicas nos resultados de busca, pois isso depende de diversos fatores externos e do algoritmo do Google."
  },
  {
    id: 7,
    question: "Como recebo o link da publicação?",
    answer:
      "Assim que o conteúdo for publicado, você será notificado por e-mail com o link de acesso. Você também pode acompanhar o status do pedido diretamente na sua área do cliente."
  },
  {
    id: 8,
    question: "Posso cancelar minha compra?",
    answer:
      "Sim. Você pode cancelar seu pedido dentro do prazo de 7 dias, desde que o conteúdo ainda não tenha iniciado o processo de produção e publicação por nossa equipe. Para solicitar o cancelamento, entre em contato pelo e-mail cancelamento@suaimprensa.com.br."
  }
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-full">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          <strong>Precisa de ajuda? Comece por aqui 👇</strong>
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Reunimos as dúvidas mais comuns para te ajudar a aproveitar ao máximo nosso marketplace
        </p>
      </div>
      <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
        <div className="space-y-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div
                onClick={() => toggleItem(item.id)}
                className={`flex items-center justify-between py-3 pl-6 pr-3 cursor-pointer ${
                  openItem === item.id ? "bg-gray-50 dark:bg-white/[0.03]" : ""
                }`}
              >
                <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  {item.question}
                </h4>

                <button
                  className={`flex h-12 w-full max-w-12 items-center justify-center rounded-full bg-gray-100 duration-200 ease-linear dark:bg-white/[0.03] ${
                    openItem === item.id
                      ? "text-gray-800 dark:text-white/90 rotate-180"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <svg
                    className="stroke-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.75 8.875L12 15.125L18.25 8.875"
                      stroke=""
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {openItem === item.id && (
                <div className="px-6 py-7">
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
