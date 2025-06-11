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

  // Log value on mount
  useEffect(() => {
    console.log("ProductField value on mount:", value);
  }, []);

  // Sync input values with parsedValue only on external changes
  useEffect(() => {
    console.log("Value prop changed:", value);
    const parsedValue =
      typeof value === "string" ? JSON.parse(value || "{}") : value || {};
    console.log("Parsed value:", parsedValue);

    // Only update if the input is not currently focused or if there's no current value
    if (
      !priceInputValue ||
      document.activeElement?.getAttribute("name") !== "price"
    ) {
      setPriceInputValue(formatInputCurrency(parsedValue.price || ""));
    }

    if (
      !promotionalPriceInputValue ||
      document.activeElement?.getAttribute("name") !== "promotional_price"
    ) {
      setPromotionalPriceInputValue(
        formatInputCurrency(parsedValue.promotional_price || "")
      );
    }
  }, [value]);

  // Parse value from string if needed
  const parsedValue =
    typeof value === "string" ? JSON.parse(value || "{}") : value || {};

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
    console.log("Price input change - inputValue:", inputValue);
    console.log("Price input change - current value prop:", value);

    // Aplica máscara de moeda
    const maskedValue = applyCurrencyMask(inputValue);

    // Update local state with masked value
    setPriceInputValue(maskedValue);

    const newValue = {
      ...parsedValue,
      price: maskedValue
    };

    console.log("Price input change - newValue:", newValue);

    // Clear validation error when changing values
    setValidationError("");

    // Re-validate promotional price if it exists
    if (parsedValue.promotional_price && maskedValue) {
      const promotionalPrice = priceToNumber(parsedValue.promotional_price);
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
    console.log(
      "[ProductField] Promotional price input change - inputValue:",
      inputValue
    );
    console.log(
      "[ProductField] Promotional price input change - current value prop:",
      value
    );
    console.log(
      "[ProductField] Promotional price input change - parsedValue:",
      parsedValue
    );

    // Aplica máscara de moeda
    const maskedValue = applyCurrencyMask(inputValue);
    console.log(
      "[ProductField] Promotional price input change - maskedValue:",
      maskedValue
    );

    // Block input if promotional price would be greater than or equal to regular price
    if (maskedValue && parsedValue.price) {
      const promotionalPrice = priceToNumber(maskedValue);
      const regularPrice = priceToNumber(parsedValue.price);

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
      promotional_price: maskedValue
    };

    console.log(
      "[ProductField] Promotional price input change - newValue:",
      newValue
    );
    console.log(
      "[ProductField] Promotional price input change - calling onChange with:",
      JSON.stringify(newValue)
    );

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
    // If promotional price is filled, it becomes the main price
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
