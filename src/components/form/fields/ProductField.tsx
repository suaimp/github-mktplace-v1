import Input from "../input/InputField";
import { FormFieldSettings } from "./types";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  applyCurrencyMask,
  formatInputCurrency
} from "../../../utils/currency";

interface ProductFieldProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
  settings?: FormFieldSettings;
}

export default function ProductField({
  value,
  onChange,
  error,
  onErrorClear,
  settings
}: ProductFieldProps) {
  const location = useLocation();
  const [validationError, setValidationError] = useState<string>("");
  const [priceInputValue, setPriceInputValue] = useState<string>("");
  const [promotionalPriceInputValue, setPromotionalPriceInputValue] =
    useState<string>("");

  // Sync input values with parsedValue only on external changes
  useEffect(() => {
    let parsedValue: {
      price?: string;
      promotional_price?: string;
      old_price?: string;
      old_promotional_price?: string;
    } = {};

    try {
      if (typeof value === "string") {
        // Tenta fazer parse do JSON
        parsedValue = JSON.parse(value || "{}");
      } else if (typeof value === "object" && value !== null) {
        // Se já é um objeto, usa diretamente
        parsedValue = value;
      } else if (value) {
        // Se é um valor simples e não vazio, pode ser promotional_price
        // Mas APENAS se não estivermos em modo de edição (quando há objeto completo)
        parsedValue = { promotional_price: String(value) };
      } else {
        // Valor vazio ou null
        parsedValue = {};
      }
    } catch (error) {
      // Se falhar o parse, assume que é um valor simples
      if (value) {
        parsedValue = { promotional_price: String(value) };
      } else {
        parsedValue = {};
      }
    }

    // Prioriza old_price e old_promotional_price para exibição (valores sem comissão)
    const displayPrice = parsedValue.old_price || parsedValue.price || "";
    const displayPromotionalPrice =
      parsedValue.old_promotional_price || parsedValue.promotional_price || "";

    // Always update both fields when value changes (importante para modo de edição)
    setPriceInputValue(formatInputCurrency(displayPrice));
    setPromotionalPriceInputValue(formatInputCurrency(displayPromotionalPrice));
  }, [value]);

  // Parse value from string if needed
  let parsedValue: {
    price?: string;
    promotional_price?: string;
    old_price?: string;
    old_promotional_price?: string;
  } = {};
  try {
    if (typeof value === "string") {
      parsedValue = JSON.parse(value || "{}");
    } else if (typeof value === "object" && value !== null) {
      parsedValue = value;
    } else if (value) {
      parsedValue = { promotional_price: String(value) };
    } else {
      parsedValue = {};
    }
  } catch (error) {
    if (value) {
      parsedValue = { promotional_price: String(value) };
    } else {
      parsedValue = {};
    }
  }

  // Convert price to number for calculations
  const priceToNumber = (priceStr: string | number): number => {
    if (!priceStr) return 0;

    const str = priceStr.toString();

    // Remove any non-numeric characters except dots and commas
    let cleaned = str.replace(/[^\d,.]/g, "");

    // Handle Brazilian format: 1.500,50 -> 1500.50 or simple numbers
    if (cleaned.includes(",")) {
      // Remove thousand separators (dots) and convert comma to dot
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Aplica máscara de moeda
    const maskedValue = applyCurrencyMask(inputValue);

    // Update local state with masked value
    setPriceInputValue(maskedValue);

    const newValue = {
      ...parsedValue,
      price: maskedValue, // Sempre usa o valor atual do input
      old_price: maskedValue // Atualiza o valor original também
    };

    // Clear validation error when changing values
    setValidationError("");

    // Re-validate promotional price if it exists
    if (parsedValue.old_promotional_price && maskedValue) {
      const promotionalPrice = priceToNumber(parsedValue.old_promotional_price);
      const regularPrice = priceToNumber(maskedValue);

      if (regularPrice > 0 && promotionalPrice >= regularPrice) {
        setValidationError(
          "Preço promocional deve ser menor que o preço normal"
        );
      }
    }

    onChange(JSON.stringify(newValue));

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const handlePriceBlur = () => {
    // No formatting on blur - keep raw value
  };

  const handlePromotionalPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // Aplica máscara de moeda
    const maskedValue = applyCurrencyMask(inputValue);

    // Block input if promotional price would be greater than or equal to regular price
    if (maskedValue && parsedValue.old_price) {
      const promotionalPrice = priceToNumber(maskedValue);
      const regularPrice = priceToNumber(parsedValue.old_price);

      if (regularPrice > 0 && promotionalPrice >= regularPrice) {
        // Don't update the input value, just show error
        setValidationError(
          "Preço promocional deve ser menor que o preço normal"
        );
        return; // Block the input
      }
    }

    // Update local state with masked value
    setPromotionalPriceInputValue(maskedValue);

    const newValue = {
      ...parsedValue,
      promotional_price: maskedValue, // Sempre usa o valor atual do input
      old_promotional_price: maskedValue // Atualiza o valor original também
    };

    // Clear validation error for valid inputs
    setValidationError("");

    onChange(JSON.stringify(newValue));

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const handlePromotionalPriceBlur = () => {
    // No formatting on blur - keep raw value
  };

  // Helper function to get product descriptions
  const getProductDescriptions = () => {
    if (settings?.product_description) {
      // Se for string JSON, parse para objeto
      if (typeof settings.product_description === "string") {
        try {
          const parsed = JSON.parse(settings.product_description);
          return {
            price_description: parsed.price_description || "",
            promotional_price_description:
              parsed.promotional_price_description || ""
          };
        } catch (e) {
          return {
            price_description: settings.product_description,
            promotional_price_description: ""
          };
        }
      }
      // Se já for objeto
      if (typeof settings.product_description === "object") {
        const productDesc = settings.product_description as {
          price_description?: string;
          promotional_price_description?: string;
        };
        return {
          price_description: productDesc.price_description || "",
          promotional_price_description:
            productDesc.promotional_price_description || ""
        };
      }
    }
    return { price_description: "", promotional_price_description: "" };
  };

  const productDescriptions = getProductDescriptions();

  // Check if promotional price field should be shown
  // Don't show when current route contains "pages/cadastro-de-sitewebsite"
  const shouldShowPromotionalPrice = !location.pathname.includes(
    "pages/cadastro-de-sitewebsite"
  );

  // Get the main price (promotional if available, otherwise regular)
  const getMainPrice = () => {
    // Prioriza old_promotional_price se disponível, senão old_price
    if (
      parsedValue.old_promotional_price &&
      parsedValue.old_promotional_price !== ""
    ) {
      return parsedValue.old_promotional_price;
    }
    if (parsedValue.old_price && parsedValue.old_price !== "") {
      return parsedValue.old_price;
    }

    // Fallback para valores antigos
    if (parsedValue.promotional_price && parsedValue.promotional_price !== "") {
      return parsedValue.promotional_price;
    }
    return parsedValue.price || "";
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
          Preço
        </label>
        <Input
          type="text"
          name="price"
          value={priceInputValue}
          onChange={handlePriceChange}
          onBlur={handlePriceBlur}
          placeholder="0,00"
          error={!!error}
          hint={error || productDescriptions.price_description}
        />
      </div>

      {shouldShowPromotionalPrice && (
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
            Preço Promocional
          </label>
          <Input
            type="text"
            name="promotional_price"
            value={promotionalPriceInputValue}
            onChange={handlePromotionalPriceChange}
            onBlur={handlePromotionalPriceBlur}
            placeholder="0,00"
            error={!!validationError}
            hint={
              validationError ||
              productDescriptions.promotional_price_description
            }
          />
        </div>
      )}

      {/* Hidden field to store the main price for form processing */}
      <input type="hidden" name="main_price" value={getMainPrice()} />
    </div>
  );
}
