import * as NicheIcons from "../../../../icons/niche-icons";
import { MarketplaceTableInfoTooltip } from "../../Tooltip";
import type { NicheIconProps } from "../types";

export function NicheIcon({ niche, isActive, index }: NicheIconProps) {
  const IconComponent = niche.icon ? (NicheIcons as any)[niche.icon] : null;

  // Se não tem ícone, não renderiza
  if (!IconComponent) {
    return null;
  }

  return (
    <MarketplaceTableInfoTooltip
      key={`${niche.text}-${index}`}
      text={
        <span style={{ color: '#fff' }}>
          {isActive
            ? `Aceita conteúdos relacionados a ${niche.text}`
            : `Não aceita conteúdos relacionados a ${niche.text}`}
        </span>
      }
    >
      <div
        className={`inline-flex items-center justify-center w-[19px] h-[19px] rounded-full transition-all cursor-help ${
          isActive
            ? "bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/30"
            : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600"
        }`}
      >
        <IconComponent className="w-[11px] h-[11px]" />
      </div>
    </MarketplaceTableInfoTooltip>
  );
}
