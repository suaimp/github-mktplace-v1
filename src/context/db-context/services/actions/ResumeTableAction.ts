import { useEffect, useState } from "react";
import { useCart } from "../../../../components/marketplace/ShoppingCartContext";
import { getFormEntryValuesByEntryId } from "../formEntryValueService";

export function useResumeTableLogic() {
  const { items } = useCart();
  const [redacaoEscolha, setRedacaoEscolha] = useState<{
    [key: string]: boolean;
  }>(() => Object.fromEntries(items.map((item) => [item.id, false])));
  const [entryValues, setEntryValues] = useState<{
    [entryId: string]: { niche?: any[] | string; price?: number };
  }>({});
  const [loading, setLoading] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<{
    [entryId: string]: string;
  }>({});
  const [cartQuantities, setCartQuantities] = useState<{
    [key: string]: number;
  }>(() => Object.fromEntries(items.map((item) => [item.id, item.quantity])));

  useEffect(() => {
    async function fetchAllEntryValues() {
      setLoading(true);
      const valuesObj: {
        [entryId: string]: { niche?: any[] | string; price?: number };
      } = {};
      for (const item of items) {
        const entryId = item.entry_id || item.id;
        const values = await getFormEntryValuesByEntryId(entryId);
        const filteredValues = values.filter((v) => v.entry_id === entryId);
        const valueJsons = filteredValues
          .map((v) => v.value_json)
          .filter((v) => v !== null && v !== undefined);
        let nicheValue;
        let priceValue;
        const arrayWithNiches = valueJsons.find(
          (v) => Array.isArray(v) && v.length > 0 && v[0]?.niche
        );
        if (Array.isArray(arrayWithNiches)) {
          nicheValue = arrayWithNiches;
          priceValue = undefined;
        } else {
          nicheValue = undefined;
          priceValue = undefined;
        }
        valuesObj[entryId] = { niche: nicheValue, price: priceValue };
      }
      setEntryValues(valuesObj);
      setLoading(false);
    }
    if (items.length > 0) fetchAllEntryValues();
  }, [items]);

  useEffect(() => {
    setCartQuantities(
      Object.fromEntries(items.map((item) => [item.id, item.quantity]))
    );
  }, [items]);

  const handleRedacaoChange = (itemId: string) => {
    setRedacaoEscolha((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCartQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
  };

  const totalPrice = items.reduce((acc, item) => {
    const entryId = item.entry_id || item.id;
    const niche = entryValues[entryId]?.niche;
    let price = item.product.price;
    if (Array.isArray(niche) && selectedNiches[entryId]) {
      const selected = niche.find(
        (n: any) => n.niche === selectedNiches[entryId]
      );
      if (selected && selected.price) {
        price = Number(
          String(selected.price)
            .replace(/[^0-9,.-]+/g, "")
            .replace(",", ".")
        );
      }
    } else if (entryValues[entryId]?.price) {
      price = entryValues[entryId]?.price;
    }
    const quantity = cartQuantities[item.id] ?? item.quantity;
    return acc + price * quantity;
  }, 0);

  return {
    items,
    redacaoEscolha,
    setRedacaoEscolha,
    entryValues,
    loading,
    selectedNiches,
    setSelectedNiches,
    cartQuantities,
    setCartQuantities,
    handleRedacaoChange,
    handleQuantityChange,
    totalPrice
  };
}
