import * as Icons from "../../icons";
import type { NicheOption } from "../../services/db-services/form-services/formFieldNicheService";

interface NicheDisplayProps {
  niches: NicheOption[];
  onNicheSelect?: (niche: NicheOption) => void;
  selectedNiche?: NicheOption;
  className?: string;
}

export default function NicheDisplay({
  niches,
  onNicheSelect,
  selectedNiche,
  className = ""
}: NicheDisplayProps) {
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;

    // Busca o ícone no objeto Icons usando o nome
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || null;
  };

  return (
    <div className={`grid gap-3 ${className}`}>
      {niches.map((niche, index) => {
        const IconComponent = getIconComponent(niche.icon);
        const isSelected = selectedNiche?.text === niche.text;

        return (
          <div
            key={`${niche.text}-${index}`}
            onClick={() => onNicheSelect?.(niche)}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
              ${
                isSelected
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
              ${onNicheSelect ? "hover:shadow-sm" : ""}
            `}
          >
            {IconComponent && (
              <div className="flex-shrink-0">
                <IconComponent className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
            )}
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {niche.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Componente para exibir um único nicho de forma compacta
interface CompactNicheProps {
  niche: NicheOption;
  className?: string;
}

export function CompactNiche({ niche, className = "" }: CompactNicheProps) {
  const IconComponent = (Icons as any)[niche.icon || ""];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm ${className}`}
    >
      {IconComponent && (
        <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      )}
      <span className="text-gray-700 dark:text-gray-300">{niche.text}</span>
    </div>
  );
}
