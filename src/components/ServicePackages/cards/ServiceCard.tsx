import React from "react";

interface ServiceCardProps {
  id: string;
  service_id: string;
  title: string;
  subtitle: string | null;
  price: number;
  benefits: string[];
  not_benefits: string[];
  period: string;
  created_at: string;
  updated_at: string;
  buttonText?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  price,
  period,
  subtitle,
  benefits,
  not_benefits,
  buttonText
}) => {
  // Limita a soma de benefits e not_benefits a no máximo 6 itens exibidos
  const maxItems = 6;
  const allItems = [
    ...(benefits || []).map((text) => ({ text, type: "benefit" })),
    ...(not_benefits || []).map((text) => ({ text, type: "not_benefit" }))
  ];
  const itemsToShow = allItems.slice(0, maxItems);

  return (
    <div
      className="relative rounded-2xl border-2 border-brand-500 bg-white p-6 dark:border-brand-500 dark:bg-white/[0.03] xl:p-8"
      style={{ height: 519 }}
    >
      <div className="flex items-start justify-between -mb-4">
        <span
          className="block font-semibold text-gray-800 dark:text-white/90"
          style={{ fontSize: 20 }}
        >
          {title}
        </span>
      </div>
      <div className="flex items-end mt-6 gap-1">
        <h2
          className="font-bold text-gray-800 dark:text-white/90"
          style={{ fontSize: 36, height: 43 }}
        >
          {price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </h2>
        <span className="inline-block  text-sm text-gray-500 dark:text-gray-400">
          /{period}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
      <div className="w-full h-px my-6 bg-white/20"></div>
      <ul className="mb-8 space-y-3">
        {itemsToShow.map((item, idx) =>
          item.type === "benefit" ? (
            <li
              key={"b-" + idx}
              className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-400"
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-success-500"
              >
                <path
                  d="M13.4017 4.35986L6.12166 11.6399L2.59833 8.11657"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item.text}
            </li>
          ) : (
            <li
              key={"nb-" + idx}
              className="flex items-center gap-3 text-sm text-gray-400"
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.05394 4.78033C3.76105 4.48744 3.76105 4.01256 4.05394 3.71967C4.34684 3.42678 4.82171 3.42678 5.1146 3.71967L8.33437 6.93944L11.5521 3.72173C11.845 3.42883 12.3199 3.42883 12.6127 3.72173C12.9056 4.01462 12.9056 4.48949 12.6127 4.78239L9.39503 8.0001L12.6127 11.2178C12.9056 11.5107 12.9056 11.9856 12.6127 12.2785C12.3198 12.5713 11.845 12.5713 11.5521 12.2785L8.33437 9.06076L5.11462 12.2805C4.82173 12.5734 4.34685 12.5734 4.05396 12.2805C3.76107 11.9876 3.76107 11.5127 4.05396 11.2199L7.27371 8.0001L4.05394 4.78033Z"
                  fill="currentColor"
                />
              </svg>
              {item.text}
            </li>
          )
        )}
      </ul>
      <button className="absolute bottom-8 left-0 right-0 mx-auto flex w-[90%] items-center justify-center rounded-lg bg-brand-500 p-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 b-35 mt-[35px]">
        {buttonText}
      </button>
    </div>
  );
};

export default ServiceCard;
