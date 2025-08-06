/**
 * Utilitário para normalizar diferentes formatos de preço
 * Trata preços que vêm como number ou string com formatação (ex: "R$ 3.794,00")
 */

/**
 * Normaliza um valor de preço para número
 * Aceita formatos: number, string com R$, string com pontos e vírgulas
 * 
 * @param price - Preço em qualquer formato
 * @returns number - Preço normalizado como número
 */
export function normalizePrice(price: string | number | null | undefined): number {
  // Se é null ou undefined, retorna 0
  if (price === null || price === undefined) {
    return 0;
  }

  // Se já é número, retorna direto
  if (typeof price === 'number') {
    return price;
  }

  // Se é string, processa
  if (typeof price === 'string') {
    // Remove "R$", espaços, e outros caracteres não numéricos, exceto vírgulas e pontos
    const cleanPrice = price
      .replace(/R\$\s*/gi, '') // Remove "R$" com ou sem espaços
      .replace(/[^\d,.-]/g, '') // Remove tudo exceto dígitos, vírgulas, pontos e hífen
      .trim();

    // Se string está vazia após limpeza, retorna 0
    if (!cleanPrice) {
      return 0;
    }

    // Detecta se usa vírgula como separador decimal (formato brasileiro)
    // Ex: "3.794,00" ou "1.234,56"
    const hasBrazilianFormat = cleanPrice.includes(',') && cleanPrice.lastIndexOf('.') < cleanPrice.lastIndexOf(',');
    
    if (hasBrazilianFormat) {
      // Formato brasileiro: remove pontos (milhares) e troca vírgula por ponto (decimal)
      const normalized = cleanPrice
        .replace(/\./g, '') // Remove pontos de milhares
        .replace(',', '.'); // Troca vírgula por ponto decimal
      
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    } else {
      // Formato americano ou simples
      const parsed = parseFloat(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
  }

  // Fallback: retorna 0
  return 0;
}

/**
 * Verifica se um valor de preço é válido (maior que 0)
 * 
 * @param price - Preço em qualquer formato
 * @returns boolean - true se o preço é válido
 */
export function isValidPrice(price: string | number | null | undefined): boolean {
  const normalized = normalizePrice(price);
  return normalized > 0;
}

/**
 * Formata um preço normalizado para exibição em reais
 * 
 * @param price - Preço como número
 * @returns string - Preço formatado (ex: "R$ 3.794,00")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

/**
 * Testa a função com diferentes formatos de preço
 * Função utilitária para debugging
 */
export function testPriceNormalizer() {
  const testCases = [
    3.794,
    "3.794,00",
    "R$ 3.794,00", 
    "R$3.794,00",
    "1.234,56",
    "R$ 1.234,56",
    "1234.56",
    "1234",
    "",
    null,
    undefined,
    "R$ 0,00",
    "0"
  ];

  console.log('🧪 Testando normalização de preços:');
  testCases.forEach(testCase => {
    const normalized = normalizePrice(testCase);
    console.log(`Input: ${JSON.stringify(testCase)} -> Output: ${normalized}`);
  });
}
