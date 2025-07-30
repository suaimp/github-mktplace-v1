// Função utilitária para calcular apenas o valor do conteúdo (word count que ultrapassa o limite gratuito)
export function getContentPrice({
  item,
  wordCounts,
  selectedService,
  serviceCardsByActiveService,
  getServicePackageArray
}: {
  item: any;
  wordCounts: any;
  selectedService: any;
  serviceCardsByActiveService: any;
  getServicePackageArray: Function;
}) {
  // Usa getServicePackageArray para obter os dados do serviço selecionado
  const selected = getServicePackageArray(
    item,
    selectedService,
    serviceCardsByActiveService ?? []
  );

  // Se não há seleção válida, retorna 0
  if (!selected || selected.length === 0) {
    return 0;
  }
  
  const isFree = selected[0].is_free;
  const word_count = selected[0].word_count;
  const pricePerWord = selected[0].price_per_word;

  // Captura o valor digitado no input de word_count para este item
  const wordCountInput = wordCounts[item.id] ?? "";

  if (!wordCountInput || Number(wordCountInput) <= 0) {
    return 0;
  }

  // Se é um serviço free e o valor digitado ultrapassa o limite gratuito
  if (isFree && Number(wordCountInput) > Number(word_count)) {
    const extraWords = Number(wordCountInput) - Number(word_count);
    return pricePerWord * extraWords;
  }

  // Se NÃO é free, cobra pelo total de palavras
  if (!isFree) {
    return pricePerWord * Number(wordCountInput);
  }

  return 0;
}
