import React from "react";
import { useTableSearch } from "../hooks";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageReset: () => void;
}

const SearchInput = React.memo(({ searchTerm, onSearchChange, onPageReset }: SearchInputProps) => {
  const { searchInput, setSearchInput, handleSearchSubmit } = useTableSearch({
    searchTerm,
    onSearchChange,
    onPageReset
  });

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400 transition-colors hover:text-black focus:text-black"
        onClick={handleSearchSubmit}
        tabIndex={0}
        aria-label="Buscar"
      >
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <input
        placeholder="Pesquisar..."
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
        type="text"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
