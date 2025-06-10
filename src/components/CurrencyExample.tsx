import React, { useState } from "react";
import {
  applyCurrencyMask,
  formatCurrency,
  parsePrice
} from "../utils/currency";

interface CurrencyExampleProps {}

const CurrencyExample: React.FC<CurrencyExampleProps> = () => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setValue(maskedValue);
  };

  const numericValue = parsePrice(value);
  const formattedValue = formatCurrency(numericValue);

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Teste da Máscara de Moeda
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Digite um valor:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
              R$
            </span>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder="0,00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Valor mascarado:</strong> {value || "(vazio)"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Valor numérico:</strong> {numericValue}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Formatado como moeda:</strong> {formattedValue}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            Como usar:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Digite apenas números (ex: 1250 → 12,50)</li>
            <li>• Separador de milhares automático</li>
            <li>• Sempre 2 casas decimais</li>
            <li>• Formato brasileiro (vírgula para decimais)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExample;
