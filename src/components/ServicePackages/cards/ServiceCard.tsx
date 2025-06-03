import React from "react";
import { useCardColors } from "./cardColors";
import { setService } from "./actions/setService";

// Permite receber cardColors por props para customização dinâmica
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
  cardColors?: any; // CardColors opcional
  button?: boolean; // nova prop
  price_per_word?: number;
  word_count?: number;
  is_free?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  service_id,
  title,
  price,
  period,
  subtitle,
  benefits,
  not_benefits,
  buttonText,
  cardColors: cardColorsProp,
  button = false,
  created_at,
  updated_at,
  price_per_word, // <-- ADICIONE AQUI
  word_count, // <-- ADICIONE AQUI
  is_free
}) => {
  // Limita a soma de benefits e not_benefits a no máximo 6 itens exibidos
  const maxItems = 6;
  const allItems = [
    ...(benefits || []).map((text) => ({ text, type: "benefit" })),
    ...(not_benefits || []).map((text) => ({ text, type: "not_benefit" }))
  ];
  const itemsToShow = allItems.slice(0, maxItems);

  // Hook de cores
  const [defaultColors] = useCardColors();
  const cardColors = cardColorsProp || defaultColors;

  return (
    <div
      className={`relative rounded-2xl border ${cardColors.border} ${cardColors.bg} p-6 ${cardColors.borderDark} ${cardColors.bgDark} xl:p-8`}
      style={{ height: 519 }}
    >
      <div className="flex items-start justify-between -mb-4">
        <span
          className={`block mb-3 font-semibold ${cardColors.title} text-theme-xl ${cardColors.titleDark}`}
          style={{ fontSize: 20 }}
        >
          {title}
        </span>
      </div>
      <div className="flex items-end justify-between mb-1">
        <div className="flex items-end gap-1" style={{ gap: 5 }}>
          <h2
            className={`font-bold ${cardColors.price} text-title-md ${cardColors.priceDark}`}
            style={{ fontSize: 36, height: 43 }}
          >
            {price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}
          </h2>
          <span
            className={`inline-block mb-1 text-sm ${cardColors.period} ${cardColors.periodDark}`}
          >
            /{period}
          </span>
        </div>
        {/* Exemplo de preço riscado, pode remover se não usar */}
        {/* <span className="font-semibold text-gray-400 line-through text-theme-xl">$59.00</span> */}
      </div>
      <p className={`text-sm ${cardColors.benefit} ${cardColors.benefitDark}`}>
        {subtitle}
      </p>
      <div
        className={`w-full h-px my-6 ${cardColors.divider} ${cardColors.dividerDark}`}
      ></div>
      <ul className="mb-8 space-y-3">
        {itemsToShow.map((item, idx) =>
          item.type === "benefit" ? (
            <li
              key={"b-" + idx}
              className={`flex items-center gap-3 text-sm ${cardColors.benefit} ${cardColors.benefitDark}`}
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
              className={`flex items-center gap-3 text-sm ${cardColors.benefit} ${cardColors.benefitDark}`}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cardColors.notBenefit}
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
      <button
        className={`absolute bottom-[30px] left-0 right-0 mx-auto flex w-[90%] items-center justify-center rounded-lg ${cardColors.button} p-3.5 text-sm font-medium text-white shadow-theme-xs transition-colors ${cardColors.buttonHover} ${cardColors.buttonDark} ${cardColors.buttonDarkHover}`}
        onClick={
          button
            ? () => {
                setService({
                  id,
                  service_id,
                  title,
                  subtitle,
                  price,
                  benefits,
                  not_benefits,
                  period,
                  created_at,
                  updated_at,
                  price_per_word,
                  word_count,
                  is_free
                });
              }
            : undefined
        }
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ServiceCard;
