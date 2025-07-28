// Função para converter valor brasileiro para número (baseada no PriceSimulationDisplay)
function parseBrazilianPrice(value: any): number {
  if (!value) return 0;

  let str = String(value);

  // Remove símbolos de moeda e espaços
  str = str.replace(/[R$\s"\\]/g, "");

  // Tratamento específico para diferentes formatos
  if (str.includes(",") && str.includes(".")) {
    // Formato brasileiro completo: 1.000,50 ou 10.000,25
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    // Apenas vírgula: 1000,50
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    // Verificar se é decimal ou separador de milhares
    const parts = str.split(".");
    if (parts.length === 2 && parts[1].length <= 2) {
      // Provavelmente decimal: 1000.50 - mantém como está
    } else {
      // Separador de milhares: 1.000 ou 10.000
      str = str.replace(/\./g, "");
    }
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Extrai informações de preço para busca
export function extractPriceForSearch(productData: any): string[] {
  if (!productData) return [];

  const searchableTexts: string[] = [];

  // Se é string, tenta fazer parse
  if (typeof productData === "string") {
    try {
      const parsed = JSON.parse(productData);
      return extractPriceForSearch(parsed);
    } catch {
      // Se não conseguiu fazer parse como JSON, pode ser um valor direto
      const directPrice = parseBrazilianPrice(productData);
      if (!isNaN(directPrice) && directPrice > 0) {
        searchableTexts.push(
          directPrice.toString(),
          directPrice.toFixed(2),
          formatCurrencyForSearch(directPrice)
        );
      }
      // Também adiciona o texto original
      searchableTexts.push(productData);
      return searchableTexts;
    }
  }

  // Se é objeto, extrai os preços
  if (typeof productData === "object") {
    const priceFields = ['price', 'promotional_price', 'old_price', 'old_promotional_price'];
    
    priceFields.forEach(field => {
      const value = productData[field];
      if (value) {
        const price = parseBrazilianPrice(value);
        if (!isNaN(price) && price > 0) {
          searchableTexts.push(
            price.toString(),
            price.toFixed(2),
            formatCurrencyForSearch(price)
          );
        }
        // Também adiciona o valor original como string
        searchableTexts.push(String(value));
      }
    });
  }

  return [...new Set(searchableTexts)]; // Remove duplicatas
}

// Formata preço para busca (versões comuns de escrita)
function formatCurrencyForSearch(price: number): string {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(price);
  
  return formatted;
}
