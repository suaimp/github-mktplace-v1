import { useState } from 'react';
import { useCart } from './ShoppingCartContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/button/Button';

interface BulkSelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  selectedEntries: string[];
  productNameField: any;
  productPriceField: any;
  productUrlField: any;
  entries: any[];
}

export default function BulkSelectionBar({
  selectedCount,
  onClear,
  selectedEntries,
  productNameField,
  productPriceField,
  productUrlField,
  entries
}: BulkSelectionBarProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Get selected entries data
      const selectedEntriesData = entries.filter(entry => 
        selectedEntries.includes(entry.id)
      );
      
      // Add each selected entry to cart
      for (const entry of selectedEntriesData) {
        // Get product name, URL and price for the entry
        const productName = productNameField ? entry.values[productNameField.id] : 'Product';
        let productUrl = productUrlField ? entry.values[productUrlField.id] : '';
        let productPrice = 0;
        
        if (productPriceField) {
          try {
            const priceValue = entry.values[productPriceField.id];
            if (typeof priceValue === 'string') {
              // Try to parse price from string
              const cleanPrice = priceValue.replace(/[^\d,\.]/g, '').replace(',', '.');
              productPrice = parseFloat(cleanPrice) || 0;
            } else if (typeof priceValue === 'object' && priceValue.price) {
              // Try to parse price from object
              const cleanPrice = typeof priceValue.price === 'string' 
                ? priceValue.price.replace(/[^\d,\.]/g, '').replace(',', '.') 
                : priceValue.price;
              productPrice = parseFloat(cleanPrice) || 0;
            }
          } catch (e) {
            console.error('Error parsing product price:', e);
          }
        }
        
        // Add to cart
        await addItem(entry.id, productName, productPrice, 1, undefined, productUrl);
      }
      
      // Clear selection after adding to cart
      onClear();
    } catch (error) {
      console.error('Error adding items to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    setAddingToFavorites(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para adicionar aos favoritos');
        return;
      }
      
      // Add each selected entry to favorites
      const favoritesData = selectedEntries.map(entryId => ({
        user_id: user.id,
        entry_id: entryId
      }));
      
      const { error } = await supabase
        .from('user_favorites')
        .upsert(favoritesData, { onConflict: 'user_id,entry_id' });
        
      if (error) throw error;
      
      // Clear selection after adding to favorites
      onClear();
    } catch (error) {
      console.error('Error adding to favorites:', error);
    } finally {
      setAddingToFavorites(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-3xl">
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
          <span>{addingToFavorites ? 'Adicionando...' : 'Favorito'}</span>
        </button>
        
        <div className="flex-1"></div>
        
        <Button
          onClick={handleAddToCart}
          disabled={loading}
          size="sm"
        >
          {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </div>
  );
}