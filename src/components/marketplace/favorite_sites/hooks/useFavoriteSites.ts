import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

export interface FavoriteSite {
  id: string;
  user_id: string;
  entry_id: string;
}

export function useFavoriteSites(userId: string | null) {
  const [favorites, setFavorites] = useState<FavoriteSite[]>([]);
  const [loading, setLoading] = useState(false);

  // Cache key for localStorage
  const cacheKey = userId ? `favorite_sites_${userId}` : null;

  // Carregar favoritos do cache localStorage instantaneamente
  useEffect(() => {
    if (!userId) return;
    const cached = cacheKey ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        setFavorites(JSON.parse(cached));
      } catch {}
    }
  }, [userId]);

  // Buscar favoritos do banco e atualizar cache
  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("favorite_sites")
      .select("*")
      .eq("user_id", userId);
    if (!error && data) {
      setFavorites(data);
      if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setLoading(false);
  }, [userId, cacheKey]);

  // Atualizar favoritos localmente ao adicionar
  const addFavorite = async (entryId: string) => {
    if (!userId) return;
    setFavorites((prev) => {
      if (prev.some(f => f.entry_id === entryId)) return prev;
      const newFav = { user_id: userId, entry_id: entryId, id: crypto.randomUUID() };
      const updated = [...prev, newFav];
      if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(updated));
      return updated;
    });
    await supabase.from("favorite_sites").upsert([
      { user_id: userId, entry_id: entryId, id: crypto.randomUUID() },
    ]);
    fetchFavorites(); // background sync
  };

  // Atualizar favoritos localmente ao remover
  const removeFavorite = async (entryId: string) => {
    if (!userId) return;
    setFavorites((prev) => {
      const updated = prev.filter(f => f.entry_id !== entryId);
      if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(updated));
      return updated;
    });
    await supabase
      .from("favorite_sites")
      .delete()
      .eq("user_id", userId)
      .eq("entry_id", entryId);
    fetchFavorites(); // background sync
  };

  // Buscar favoritos do banco ao montar
  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite: (entryId: string) => favorites.some(f => f.entry_id === entryId),
    refetch: fetchFavorites,
  };
}
