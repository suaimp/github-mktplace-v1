import { useState, useRef, useEffect } from "react";
import * as Icons from "../../icons";
import { ChevronDownIcon } from "../../icons";

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

// Lista de ícones específicos para nichos
const availableIcons = [
  { name: "FinanceIcon", component: Icons.FinanceIcon },
  { name: "HeartIcon", component: Icons.HeartIcon },
  { name: "CasinoIcon", component: Icons.CasinoIcon },
  { name: "EntertainmentIcon", component: Icons.EntertainmentIcon },
  { name: "TechIcon", component: Icons.TechIcon }
];

export default function IconSelector({
  selectedIcon,
  onIconSelect,
  onClear,
  placeholder = "Selecione um ícone"
}: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedIconComponent = selectedIcon
    ? availableIcons.find((icon) => icon.name === selectedIcon)?.component
    : null;

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectorRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {selectedIconComponent ? (
            <>
              {(() => {
                const IconComponent = selectedIconComponent;
                return (
                  <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                );
              })()}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedIcon?.replace("Icon", "")}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {selectedIcon && onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
              title="Remover ícone"
            >
              ×
            </button>
          )}
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2 p-3">
            {availableIcons.map((icon) => {
              const IconComponent = icon.component;
              return (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleIconSelect(icon.name)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center ${
                    selectedIcon === icon.name
                      ? "bg-brand-100 dark:bg-brand-900 border border-brand-500"
                      : "border border-transparent"
                  }`}
                  title={icon.name.replace("Icon", "")}
                >
                  <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
