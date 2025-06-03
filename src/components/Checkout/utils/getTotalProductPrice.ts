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
  const nichePrice = getNichePrice(item, selectedNiches);

  // Usa getServicePackageArray e faz console.log do resultado
  const selected = getServicePackageArray(
    item,
    selectedService,
    serviceCardsByActiveService ?? []
  );

  const isFree = selected.length > 0 && selected[0].is_free;

  // Captura o valor digitado no input de word_count para este item
  const wordCountInput = wordCounts[item.id] ?? "";
  console.log(wordCountInput);
  const word_count = selected.length > 0 && selected[0].word_count;
  console.log(word_count);

  const wordCountCalc = (() => {
    if (isFree) {
      if (Number(wordCountInput) > Number(word_count)) {
        return (
          //subtrai o valor gratis
          Number(wordCountInput) - Number(word_count)
        );
      }
      console.log("é free");
      return 0;
    } else {
      console.log("não é free");
      return Number(wordCountInput);
    }
  })();

  const pricePerWord = selected.length > 0 && selected[0].price_per_word;
  console.log(pricePerWord);

  const wordCountPrice = pricePerWord * wordCountCalc;

  console.log("wordCountPrice:", wordCountPrice);

  const totalProductPrice = itemPrice + nichePrice + wordCountPrice;

  return totalProductPrice;
}
