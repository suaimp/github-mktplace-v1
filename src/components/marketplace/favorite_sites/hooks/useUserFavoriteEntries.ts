import { useEffect, useState } from "react";
import { favoriteSitesService } from "../services/favoriteSitesService";
import { supabase } from "../../../../lib/supabase";

export function useUserFavoriteEntries(userId: string | null) {
  const [favoriteEntryIds, setFavoriteEntryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);


  // Fetch favoritos e subscribe em tempo real
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    let ignore = false;
    const fetchAndSet = () => {
      favoriteSitesService.getAllByUser(userId)
        .then(favs => { if (!ignore) setFavoriteEntryIds(favs.map(f => f.entry_id)); })
        .finally(() => { if (!ignore) setLoading(false); });
    };
    fetchAndSet();

    // Supabase realtime listener
    const channel = supabase.channel(`favorite_sites_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_sites',
          filter: `user_id=eq.${userId}`
        },
        fetchAndSet
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { favoriteEntryIds, loading };
}
