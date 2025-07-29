import { useState } from "react";
import { useCart } from "./ShoppingCartContext";
import { supabase } from "../../lib/supabase";
import Button from "../ui/button/Button";
import { extractProductPrice } from "./actions/priceCalculator";
import { showToast } from "../../utils/toast";
import { PdfExportButton } from "../EditorialManager/table/export";

interface BulkSelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  selectedEntries: string[];
  productNameField: any;
  productPriceField: any;
  productUrlField: any;
  entries: any[];
  fields: any[]; // Adicionado para exportação PDF
  formTitle?: string; // Adicionado para exportação PDF
}

export default function BulkSelectionBar({
  selectedCount,
  onClear,
  selectedEntries,
  productNameField,
  productPriceField,
  productUrlField,
  entries,
  fields,
  formTitle = "Marketplace"
}: BulkSelectionBarProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Get selected entries data
      const selectedEntriesData = entries.filter((entry) =>
        selectedEntries.includes(entry.id)
      );

      // Add each selected entry to cart
      for (const entry of selectedEntriesData) {
        // Get product name, URL and price for the entry
        const productName = productNameField
          ? entry.values[productNameField.id]
          : "Product";
        let productUrl = productUrlField
          ? entry.values[productUrlField.id]
          : "";

        // Usar a nova função para calcular o preço
        const productPrice = extractProductPrice(entry, productPriceField);

        console.log("[BulkSelectionBar] Dados enviados para addItem:", {
          entryId: entry.id,
          productName,
          productPrice,
          quantity: 1,
          image: undefined,
          productUrl
        });

        // Add to cart
        await addItem(
          entry.id,
          productName,
          productPrice,
          1,
          undefined,
          productUrl
        );
      }

      // Mostrar toast de sucesso
      const itemText = selectedEntriesData.length === 1 ? "item" : "itens";
      showToast(
        `${selectedEntriesData.length} ${itemText} adicionados ao carrinho!`,
        "success"
      );

      // Clear selection after adding to cart
      onClear();
    } catch (error) {
      console.error("Error adding items to cart:", error);
      showToast("Erro ao adicionar itens ao carrinho", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    setAddingToFavorites(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Você precisa estar logado para adicionar aos favoritos");
        return;
      }

      // Add each selected entry to favorites
      const favoritesData = selectedEntries.map((entryId) => ({
        user_id: user.id,
        entry_id: entryId
      }));

      const { error } = await supabase
        .from("user_favorites")
        .upsert(favoritesData, { onConflict: "user_id,entry_id" });

      if (error) throw error;

      // Clear selection after adding to favorites
      onClear();
    } catch (error) {
      console.error("Error adding to favorites:", error);
    } finally {
      setAddingToFavorites(false);
    }
  };

  // Preparar dados para exportação PDF
  const selectedEntriesData = entries.filter((entry) =>
    selectedEntries.includes(entry.id)
  );

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center">
        <div className="text-gray-700 dark:text-gray-300">
          Selecionado <strong>{selectedCount}</strong> Produtos
        </div>

        <button
          type="button"
          className="ml-4 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClear}
        >
          <span>Limpar</span>
        </button>

        <button
          type="button"
          className="ml-2 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleAddToFavorites}
          disabled={addingToFavorites}
        >
          <span>{addingToFavorites ? "Adicionando..." : "Favorito"}</span>
        </button>

        {/* Botão de Exportação PDF */}
        <div className="ml-2">
          <PdfExportButton
            entries={selectedEntriesData}
            fields={fields}
            formTitle={formTitle}
            disabled={selectedCount === 0}
          />
        </div>

        <div className="flex-1"></div>

        <Button onClick={handleAddToCart} disabled={loading} size="sm">
          {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
        </Button>
      </div>
    </div>
  );
}
