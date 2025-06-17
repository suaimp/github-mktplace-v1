// Teste para verificar o processamento de dados de nicho no NicheField

// Dados que estão vindo (conforme imagem)
const testData = [
  { niche: "Finanças", price: "R$ 700,00" },
  { niche: "Erótico", price: "R$ 600,00" },
  { niche: "Cassino", price: "R$ 600,00" },
  { niche: '{"text":"Cassino","icon":"CasinoIcon"}', price: "" },
  { niche: '{"text":"Erótico","icon":"HeartIcon"}', price: "" }
];

console.log("=== TESTE NICHE FIELD ===");
console.log("Dados de entrada:", JSON.stringify(testData, null, 2));

// Simulação da lógica de processamento do NicheField
function processNicheData(data) {
  console.log("\n=== PROCESSAMENTO ===");

  return data
    .map((item, index) => {
      console.log(`\nItem ${index}:`, item);

      if (typeof item === "object" && item !== null) {
        // Se tem propriedade 'niche' que é uma string JSON
        if (item.niche && typeof item.niche === "string") {
          if (item.niche.startsWith("{") && item.niche.includes("text")) {
            try {
              const parsedNiche = JSON.parse(item.niche);
              console.log(`  Parsed niche JSON:`, parsedNiche);
              const result = {
                niche: parsedNiche.text || item.niche,
                price: item.price || ""
              };
              console.log(`  Resultado:`, result);
              return result;
            } catch {
              console.log(`  Falha no parse do JSON, usando como texto`);
              const result = {
                niche: item.niche,
                price: item.price || ""
              };
              console.log(`  Resultado:`, result);
              return result;
            }
          } else {
            const result = {
              niche: item.niche,
              price: item.price || ""
            };
            console.log(`  String simples, resultado:`, result);
            return result;
          }
        }
      }

      return { niche: "", price: "" };
    })
    .filter((item) => item.niche && item.niche.trim() !== "");
}

const resultado = processNicheData(testData);
console.log("\n=== RESULTADO FINAL ===");
console.log(JSON.stringify(resultado, null, 2));

console.log("\n=== RESUMO ===");
resultado.forEach((item, index) => {
  console.log(`${index + 1}. "${item.niche}" - ${item.price}`);
});
