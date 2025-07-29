import { StarIcon } from "../../../icons";
import { useFavorites } from "./context/FavoritesContext";

interface FavoriteStarProps {
  entryId: string;
}

export function FavoriteStar({ entryId }: FavoriteStarProps) {
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useFavorites();

  const checked = isFavorite(entryId);

  return (
    <button
      type="button"
      aria-label={checked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={() => (checked ? removeFromFavorites(entryId) : addToFavorites(entryId))}
      className="transition-none ml-1 rounded-md p-0.5 outline-none border-none bg-transparent"
      style={{ boxShadow: "none" }}
    >
      <StarIcon
        width={20}
        height={20}
        filled={checked}
        className={
          `${checked ? "text-gray-300 dark:text-gray-700" : "text-gray-300 dark:text-gray-700"} ` +
          "transition-colors hover:text-[#fdb022]"
        }
        style={{ color: checked ? "#fdb022" : undefined }}
      />
    </button>
  );
}
