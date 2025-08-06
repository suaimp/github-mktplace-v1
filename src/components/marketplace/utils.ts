/**
 * Format a number as currency (BRL)
 */
export function formatCurrency(value: any): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

/**
 * Parse price from various formats
 */
export function parsePrice(price: any): number {
  if (typeof price === "number") {
    return price;
  }

  if (typeof price === "string") {
    // Remove currency symbols but keep digits, commas and dots
    let cleanPrice = price.replace(/[^\d,\.]/g, "");
    
    // Detectar formato brasileiro vs americano
    // Se tem vírgula e ponto, ex: "1.234,56" (brasileiro) ou "1,234.56" (americano)
    if (cleanPrice.includes(",") && cleanPrice.includes(".")) {
      const lastComma = cleanPrice.lastIndexOf(",");
      const lastDot = cleanPrice.lastIndexOf(".");
      
      if (lastComma > lastDot) {
        // Formato brasileiro: "1.234,56" - vírgula é decimal
        cleanPrice = cleanPrice.replace(/\./g, "").replace(",", ".");
      } else {
        // Formato americano: "1,234.56" - ponto é decimal
        cleanPrice = cleanPrice.replace(/,/g, "");
      }
    }
    // Se tem apenas vírgula, assumir formato brasileiro
    else if (cleanPrice.includes(",") && !cleanPrice.includes(".")) {
      cleanPrice = cleanPrice.replace(",", ".");
    }
    // Se tem apenas ponto, assumir formato americano (já está correto)
    
    return parseFloat(cleanPrice) || 0;
  }

  if (typeof price === "object") {
    // Handle product field format
    if (price.price) {
      if (typeof price.price === "string") {
        // Remove currency symbols and non-numeric characters except decimal separator
        const cleanPrice = price.price
          .replace(/[^\d,\.]/g, "")
          .replace(",", ".");
        return parseFloat(cleanPrice) || 0;
      } else if (typeof price.price === "number") {
        return price.price;
      }
    }
  }

  return 0;
}

/**
 * Extract product name from brand or text field
 */
export function extractProductName(value: any): string {
  if (!value) return "Unknown Product";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    // Handle brand field format
    if (value.name) {
      return value.name;
    }

    // Try to convert to string
    try {
      return JSON.stringify(value);
    } catch (e) {
      return "Unknown Product";
    }
  }

  return String(value);
}

/**
 * Extract URL from field value
 */
export function extractUrl(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    // Check if it's a valid URL
    try {
      new URL(value);
      return value;
    } catch (e) {
      return "";
    }
  }

  return "";
}
