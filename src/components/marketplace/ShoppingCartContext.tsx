import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { supabase } from "../../lib/supabase";
import { parsePrice } from "./utils";
import { useShoppingCartToCheckoutResume } from "./actions/ShoppingCartToCheckoutResume";

interface CartItem {
  id: string;
  entry_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image?: string;
    url?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addItem: (
    entryId: string,
    productName: string,
    price: number,
    quantity?: number,
    image?: string,
    url?: string
  ) => Promise<void>;
  removeItem: (entryId: string) => Promise<void>;
  updateQuantity: (entryId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    return retryOperation(
      operation,
      retries - 1,
      delay * 2 // Exponential backoff
    );
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shoppingCartToCheckoutResume = useShoppingCartToCheckoutResume();

  // Load cart items when component mounts
  useEffect(() => {
    loadCartItems();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadCartItems();
      } else if (event === "SIGNED_OUT") {
        setItems([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load cart items from database
  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        return;
      }

      // Get cart items with retry logic
      const cartItems = await retryOperation(async () => {
        const { data, error } = await supabase
          .from("shopping_cart_items")
          .select("id, entry_id, quantity")
          .eq("user_id", user.id);

        if (error) throw error;
        return data;
      });

      // If no items, set empty array
      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        return;
      }

      // Get product details for each cart item with retry logic
      const itemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // Get entry values with retry
            const entryValues = await retryOperation(async () => {
              const { data, error } = await supabase
                .from("form_entry_values")
                .select("field_id, value, value_json")
                .eq("entry_id", item.entry_id);

              if (error) throw error;
              return data;
            });

            // Get form fields with retry
            const formFields = await retryOperation(async () => {
              const { data: formData } = await supabase
                .from("form_entries")
                .select("form_id")
                .eq("id", item.entry_id)
                .single();

              if (!formData) throw new Error("Form entry not found");

              const { data, error } = await supabase
                .from("form_fields")
                .select(
                  `
                id, 
                field_type,
                form_field_settings (
                  is_product_name,
                  is_site_url
                )
              `
                )
                .eq("form_id", formData.form_id);

              if (error) throw error;
              return data;
            });

            // Find product name field
            const productNameField = formFields.find((field) => {
              const settings = field.form_field_settings as
                | { is_product_name?: boolean; is_site_url?: boolean }[]
                | undefined;
              if (Array.isArray(settings)) {
                return settings[0]?.is_product_name === true;
              }
              return (settings as any)?.is_product_name === true;
            });

            // Find site URL field
            const siteUrlField = formFields.find((field) => {
              const settings = field.form_field_settings as
                | { is_product_name?: boolean; is_site_url?: boolean }[]
                | undefined;
              if (Array.isArray(settings)) {
                return settings[0]?.is_site_url === true;
              }
              return (settings as any)?.is_site_url === true;
            });

            // Find product price field
            const productPriceField = formFields.find(
              (field) => field.field_type === "product"
            );

            // Get product name
            let productName = "Unknown Product";
            if (productNameField) {
              const nameValue = entryValues.find(
                (v) => v.field_id === productNameField.id
              );
              if (nameValue) {
                if (productNameField.field_type === "brand") {
                  try {
                    const brandData =
                      typeof nameValue.value_json === "string"
                        ? JSON.parse(nameValue.value_json)
                        : nameValue.value_json;
                    productName = brandData?.name || "Unknown Product";
                  } catch (e) {
                    productName = nameValue.value || "Unknown Product";
                  }
                } else {
                  productName = nameValue.value || "Unknown Product";
                }
              }
            }

            // Get product URL
            let productUrl = "";
            if (siteUrlField) {
              const urlValue = entryValues.find(
                (v) => v.field_id === siteUrlField.id
              );
              if (urlValue) {
                productUrl = urlValue.value || "";
              }
            }

            // Get product price
            let productPrice = 0;
            if (productPriceField) {
              const priceValue = entryValues.find(
                (v) => v.field_id === productPriceField.id
              );
              if (priceValue) {
                try {
                  // Os dados do preço estão na coluna 'value', não 'value_json'
                  if (priceValue.value) {
                    // Parse do JSON que vem da coluna value
                    const priceData =
                      typeof priceValue.value === "string"
                        ? JSON.parse(priceValue.value)
                        : priceValue.value;

                    console.log("🔍 Dados do preço:", priceData);
                    console.log(
                      "🔍 promotional_price:",
                      priceData.promotional_price
                    );
                    console.log("🔍 price:", priceData.price);

                    // Verifica se promotional_price tem valor válido
                    if (
                      priceData.promotional_price &&
                      priceData.promotional_price !== ""
                    ) {
                      console.log(
                        "🔥 USANDO PREÇO PROMOCIONAL:",
                        priceData.promotional_price
                      );
                      productPrice = parsePrice(priceData.promotional_price);
                    } else {
                      console.log("📦 USANDO PREÇO NORMAL:", priceData.price);
                      productPrice = parsePrice(priceData.price);
                    }
                  } else if (priceValue.value_json) {
                    // Fallback para value_json se value não existir
                    const priceData =
                      typeof priceValue.value_json === "string"
                        ? JSON.parse(priceValue.value_json)
                        : priceValue.value_json;
                    productPrice = parsePrice(priceData);
                  }
                } catch (e) {
                  console.error("Error parsing product price:", e);
                }
              }
            }

            return {
              id: item.id,
              entry_id: item.entry_id,
              quantity: item.quantity,
              product: {
                name: productName,
                price: productPrice,
                url: productUrl
              }
            };
          } catch (error) {
            console.error(
              `Error loading details for cart item ${item.id}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out any failed items and set the state
      setItems(itemsWithDetails.filter((item) => item !== null) as CartItem[]);
    } catch (err) {
      console.error("Error loading cart items:", err);
      setError(
        "Unable to load your cart. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (
    entryId: string,
    productName: string,
    price: number,
    quantity: number = 1,
    image?: string,
    url?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!user) {
        console.log(url, image, productName, price, quantity);
      }

      await retryOperation(async () => {
        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from("shopping_cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("entry_id", entryId)
          .maybeSingle();

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          const { error: updateError } = await supabase
            .from("shopping_cart_items")
            .update({ quantity: newQuantity })
            .eq("id", existingItem.id);

          await shoppingCartToCheckoutResume.edit({
            user_id: user.id,
            entry_id: entryId,
            quantity: newQuantity
          });

          if (updateError) throw updateError;
        } else {
          // Insert new item
          const insertData = {
            user_id: user.id,
            entry_id: entryId,
            quantity
          };
          const { error: insertError } = await supabase
            .from("shopping_cart_items")
            .insert(insertData);
          shoppingCartToCheckoutResume.add(insertData);
          if (insertError) throw insertError;
        }
      });

      // Reload cart items
      await loadCartItems();
    } catch (err) {
      console.error("Error adding item to cart:", err);
      setError("Unable to add item to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (entryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      await retryOperation(async () => {
        const { error: deleteError } = await supabase
          .from("shopping_cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("entry_id", entryId);

        if (deleteError) throw deleteError;
      });

      // Remove também do resumo do checkout
      await shoppingCartToCheckoutResume.remove({
        user_id: user.id,
        entry_id: entryId
      });

      // Update local state
      setItems(items.filter((item) => item.entry_id !== entryId));
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError("Unable to remove item from cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (entryId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        await removeItem(entryId);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      await retryOperation(async () => {
        const { error: updateError } = await supabase
          .from("shopping_cart_items")
          .update({ quantity })
          .eq("user_id", user.id)
          .eq("entry_id", entryId);

        if (updateError) throw updateError;
      });

      // Atualiza também no resumo do checkout
      await shoppingCartToCheckoutResume.edit({
        user_id: user.id,
        entry_id: entryId,
        quantity
      });

      // Update local state
      setItems(
        items.map((item) =>
          item.entry_id === entryId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Error updating item quantity:", err);
      setError("Unable to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      await retryOperation(async () => {
        const { error: deleteError } = await supabase
          .from("shopping_cart_items")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;
      });

      // Update local state
      setItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Unable to clear cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const value = {
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
