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

  if (selected.length === 0) {
    return 0;
  }

  const isFree = selected[0].is_free;
  const word_count = selected[0].word_count;
  const pricePerWord = selected[0].price_per_word;

  // Se não é free, não há cobrança de conteúdo extra (já está no preço base)
  if (!isFree) {
    return 0;
  }

  // Captura o valor digitado no input de word_count para este item
  const wordCountInput = wordCounts[item.id] ?? "";

  // Se é free e o valor digitado ultrapassa o limite gratuito
  if (Number(wordCountInput) > Number(word_count)) {
    const extraWords = Number(wordCountInput) - Number(word_count);
    const contentPrice = pricePerWord * extraWords;

    console.log("getContentPrice - Item:", item.id, {
      wordCountInput,
      word_count,
      extraWords,
      pricePerWord,
      contentPrice
    });

    return contentPrice;
  }

  return 0;
}
