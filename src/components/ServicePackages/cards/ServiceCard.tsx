import React from "react";

interface Feature {
  text: string;
  available: boolean;
}

interface ServiceCardProps {
  title?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: Feature[];
  buttonText?: string;
}

const defaultFeatures: Feature[] = [
  { text: "10 website", available: true },
  { text: "1GB Storage", available: true },
  { text: "Unlimited Sub-Domain", available: true },
  { text: "5 Custom Domain", available: true },
  { text: "Free SSL Certificate", available: true },
  { text: "Unlimited Traffic", available: false }
];

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title = "Professional",
  price = "$199.00",
  period = "/ Lifetime",
  description = "For working on commercial projects",
  features = defaultFeatures,
  buttonText = "Choose This Plan"
}) => {
  return (
    <div className="rounded-2xl border-2 border-brand-500 bg-white p-6 dark:border-brand-500 dark:bg-white/[0.03] xl:p-8">
      <div className="flex items-start justify-between -mb-4">
        <span className="block font-semibold text-gray-800 text-theme-xl dark:text-white/90">
          {title}
        </span>
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-[10.5px] bg-brand-50 dark:bg-brand-500/10 text-brand-500">
          {/* SVG principal do topo */}
          <svg
            className="fill-current"
            width="29"
            height="28"
            viewBox="0 0 29 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.2969 3.55469C10.8245 3.55469 9.6309 4.7483 9.6309 6.2207V7.10938H6.29462C4.82222 7.10938 3.6286 8.30299 3.6286 9.77539V20.4395C3.6286 21.9119 4.82222 23.1055 6.29462 23.1055H23.4758C24.9482 23.1055 26.1419 21.9119 26.1419 20.4395V9.77539C26.1419 8.30299 24.9482 7.10938 23.4758 7.10938H19.7025V6.2207C19.7025 4.7483 18.5089 3.55469 17.0365 3.55469H12.2969ZM18.8148 8.88672C18.8145 8.88672 18.8142 8.88672 18.8138 8.88672H10.5196C10.5193 8.88672 10.5189 8.88672 10.5186 8.88672H6.29462C5.80382 8.88672 5.40595 9.28459 5.40595 9.77539V10.9666L14.5355 14.8792C14.759 14.975 15.012 14.975 15.2356 14.8792L24.3645 10.9669V9.77539C24.3645 9.28459 23.9666 8.88672 23.4758 8.88672H18.8148ZM17.9252 7.10938V6.2207C17.9252 5.7299 17.5273 5.33203 17.0365 5.33203H12.2969C11.8061 5.33203 11.4082 5.7299 11.4082 6.2207V7.10938H17.9252ZM5.40595 20.4395V12.9003L13.8353 16.5129C14.506 16.8003 15.2651 16.8003 15.9357 16.5129L24.3645 12.9006V20.4395C24.3645 20.9303 23.9666 21.3281 23.4758 21.3281H6.29462C5.80382 21.3281 5.40595 20.9303 5.40595 20.4395Z"
              fill=""
            />
          </svg>
        </span>
      </div>
      <div className="flex items-end mt-6">
        <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">
          {price}
        </h2>
        <span className="inline-block mb-1 text-sm text-gray-500 dark:text-gray-400">
          {period}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <div className="w-full h-px my-6 bg-white/20"></div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-3 text-sm ${
              feature.available
                ? "text-gray-700 dark:text-gray-400"
                : "text-gray-400"
            }`}
          >
            {feature.available ? (
              // Ícone de check
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
            ) : (
              // Ícone de X
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
            )}
            {feature.text}
          </li>
        ))}
      </ul>
      <button className="flex w-full items-center justify-center rounded-lg bg-brand-500 p-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600">
        {buttonText}
      </button>
    </div>
  );
};

export default ServiceCard;
