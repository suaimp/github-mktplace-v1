import React, { createContext, useContext, useEffect, useState } from "react";
import { favoriteSitesService } from "../services/favoriteSitesService";
import { supabase } from "../../../../lib/supabase";

interface FavoritesContextType {
  favoriteEntryIds: string[];
  loading: boolean;
  addToFavorites: (entryId: string) => Promise<void>;
  removeFromFavorites: (entryId: string) => Promise<void>;
  isFavorite: (entryId: string) => boolean;
  refetch: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteEntryIds, setFavoriteEntryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const favorites = await favoriteSitesService.getAllByUser(userId);
      setFavoriteEntryIds(favorites.map(f => f.entry_id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (entryId: string) => {
    if (!userId) return;
    try {
      await favoriteSitesService.add(userId, entryId);
      setFavoriteEntryIds(prev => [...prev, entryId]);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (entryId: string) => {
    if (!userId) return;
    try {
      await favoriteSitesService.remove(userId, entryId);
      setFavoriteEntryIds(prev => prev.filter(id => id !== entryId));
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const isFavorite = (entryId: string) => favoriteEntryIds.includes(entryId);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!userId) return;
    
    fetchFavorites();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`favorites_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_sites',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchFavorites(); // Refetch when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteEntryIds,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        refetch: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
