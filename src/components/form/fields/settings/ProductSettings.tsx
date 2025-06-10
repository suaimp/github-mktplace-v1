import { useState, useEffect } from "react";
import Label from "../../Label";
import Input from "../../input/InputField";

interface ProductSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function ProductSettings({
  settings,
  onChange
}: ProductSettingsProps) {
  const [prices, setPrices] = useState({
    product_price: "",
    promotional_price: ""
  });

  // Inicializa os valores dos preços quando settings muda
  useEffect(() => {
    if (settings.product_description) {
      let parsedData = {
        price_description: "",
        promotional_price_description: ""
      };

      // Se for string JSON, parse para objeto
      if (typeof settings.product_description === "string") {
        try {
          parsedData = JSON.parse(settings.product_description);
        } catch (e) {
          // Se não conseguir fazer parse, usa a string como price_description
          parsedData = {
            price_description: settings.product_description,
            promotional_price_description: ""
          };
        }
      }
      // Se já for objeto
      else if (typeof settings.product_description === "object") {
        parsedData = settings.product_description;
      }

      setPrices({
        product_price: parsedData.price_description || "",
        promotional_price: parsedData.promotional_price_description || ""
      });
    } else {
      // Se não há dados, limpa os campos
      setPrices({
        product_price: "",
        promotional_price: ""
      });
    }
  }, [settings.product_description]);

  // Atualiza o primeiro input (product_price)
  const handleProductPriceChange = (value: string) => {
    const newPrices = { ...prices, product_price: value };
    setPrices(newPrices);

    // Envia o objeto para settings
    const pricesObject = {
      price_description: newPrices.product_price,
      promotional_price_description: newPrices.promotional_price
    };
    onChange({ ...settings, product_description: pricesObject });
  };

  // Atualiza o segundo input (promotional_price)
  const handlePromotionalPriceChange = (value: string) => {
    const newPrices = { ...prices, promotional_price: value };
    setPrices(newPrices);

    // Envia o objeto para settings
    const pricesObject = {
      price_description: newPrices.product_price,
      promotional_price_description: newPrices.promotional_price
    };
    onChange({ ...settings, product_description: pricesObject });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Configurações do Produto
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Descrição do Preço</Label>
          <Input
            type="text"
            value={prices.product_price}
            onChange={(e) => handleProductPriceChange(e.target.value)}
            placeholder="Ex: Artigo com até 2 links"
          />
        </div>

        <div>
          <Label>Descrição do Preço Promocional</Label>
          <Input
            type="text"
            value={prices.promotional_price}
            onChange={(e) => handlePromotionalPriceChange(e.target.value)}
            placeholder="Ex: Preço especial Black Friday"
          />
        </div>
      </div>
    </div>
  );
}
