// Função utilitária para calcular o total do produto, mantendo exatamente a mesma lógica e variáveis
export function getTotalProductPrice({
  item,
  quantities,
  selectedNiches,
  selectedService,
  wordCounts,
  serviceCardsByActiveService,
  getServicePackageArray,
  getNichePrice
}: {
  item: any;
  quantities: any;
  selectedNiches: any;
  selectedService: any;
  wordCounts: any;
  serviceCardsByActiveService: any;
  getServicePackageArray: Function;
  getNichePrice: Function;
}) {
  const itemPrice = item.price * (quantities[item.id] ?? item.quantity ?? 1);

  console.log(" item.", item);
  const nichePrice = getNichePrice(item, selectedNiches);

  const selected = getServicePackageArray(
    item,
    selectedService,
    serviceCardsByActiveService ?? []
  );

  const isFree = selected.length > 0 && selected[0].is_free;

  // Captura o valor digitado no input de word_count para este item
  const wordCountInput = wordCounts[item.id] ?? "";
  const word_count = selected.length > 0 && selected[0].word_count;

  const wordCountCalc = (() => {
    if (isFree) {
      if (Number(wordCountInput) > Number(word_count)) {
        return (
          //subtrai o valor gratis
          Number(wordCountInput) - Number(word_count)
        );
      }
      return 0;
    } else {
      return Number(wordCountInput);
    }
  })();

  const pricePerWord = selected.length > 0 && selected[0].price_per_word;

  // CORREÇÃO: Multiplicar o valor do conteúdo pela quantidade
  const quantidade = quantities[item.id] ?? item.quantity ?? 1;
  const wordCountPrice = pricePerWord * wordCountCalc * quantidade;

  // Se houver nicho selecionado, usar apenas o valor do nicho (vez de item.price)
  if (nichePrice > 0) {
    return (
      nichePrice * quantidade + wordCountPrice
    );
  }
  // Caso contrário, usa o padrão
  const totalProductPrice = itemPrice + wordCountPrice;
  return totalProductPrice;
}
