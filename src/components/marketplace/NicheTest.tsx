// Exemplo de teste para verificar o funcionamento dos nichos com ícones

import { renderNicheWithIcon } from "./MarketplaceValueFormatter";

// Teste 1: Nicho com ícone
const nicheWithIcon = {
  text: "Marketing Digital",
  icon: "BoltIcon"
};

// Teste 2: Array de nichos
const multipleNiches = [
  { text: "E-commerce", icon: "ShoppingCartIcon" },
  { text: "SEO", icon: "ChartIcon" },
  { text: "Conteúdo", icon: "FileIcon" }
];

// Teste 3: String JSON
const nicheAsString = JSON.stringify({
  text: "Tecnologia",
  icon: "CodeIcon"
});

// Teste 4: Nicho sem ícone
const nicheWithoutIcon = {
  text: "Finanças"
};

console.log("Testes de renderização de nichos:");
console.log("1. Nicho com ícone:", renderNicheWithIcon(nicheWithIcon));
console.log("2. Múltiplos nichos:", renderNicheWithIcon(multipleNiches));
console.log("3. String JSON:", renderNicheWithIcon(nicheAsString));
console.log("4. Nicho sem ícone:", renderNicheWithIcon(nicheWithoutIcon));

export { nicheWithIcon, multipleNiches, nicheAsString, nicheWithoutIcon };
