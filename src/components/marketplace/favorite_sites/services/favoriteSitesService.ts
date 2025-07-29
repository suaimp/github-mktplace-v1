import { supabase } from "../../../../lib/supabase";
import { FavoriteSite } from "../hooks/useFavoriteSites";

export const favoriteSitesService = {
  async getAllByUser(userId: string): Promise<FavoriteSite[]> {
    const { data, error } = await supabase
      .from("favorite_sites")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async add(userId: string, entryId: string): Promise<void> {
    await supabase.from("favorite_sites").upsert([
      { user_id: userId, entry_id: entryId, id: crypto.randomUUID() },
    ]);
  },

  async remove(userId: string, entryId: string): Promise<void> {
    await supabase
      .from("favorite_sites")
      .delete()
      .eq("user_id", userId)
      .eq("entry_id", entryId);
  },
};
