 
import * as NicheIcons from "../../icons/niche-icons";
import {
  parseNicheData,
  type NicheOption
} from "../../services/db-services/form-services/formFieldNicheService";
import { MarketplaceTableInfoTooltip } from "./Tooltip";
import { useNichesWithRealTimeUpdates } from "./niche_rendering/hooks/useNichesWithRealTimeUpdates";

interface NicheRendererProps {
  value: any;
}

export function NicheRenderer({ value }: NicheRendererProps) {
  const { niches: allNiches, loading } = useNichesWithRealTimeUpdates();

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-[19px] h-[19px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  try {
    // Parse os dados do nicho atual (se existir)
    let nicheData: NicheOption[] = [];

    if (value) {
      if (typeof value === "string") {
        console.log("[NicheRenderer] Processing string value:", value);

        // Verifica se parece ser JSON
        if (value.trim().startsWith("[") || value.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(value);
            console.log("[NicheRenderer] Parsed JSON:", parsed);
            nicheData = parseNicheData(
              Array.isArray(parsed) ? parsed : [parsed]
            );
          } catch {
            console.log(
              "[NicheRenderer] Failed to parse JSON, skipping malformed data"
            );
            // Continua sem dados de nicho, vai exibir todos sem destaque
          }
        } else {
          // String simples, trata como texto
          console.log("[NicheRenderer] Simple string, treating as text");
          nicheData = [{ text: value, icon: undefined }];
        }
      } else if (Array.isArray(value)) {
        console.log("[NicheRenderer] Processing array value:", value);
        nicheData = parseNicheData(value);
      } else {
        console.log("[NicheRenderer] Processing object value:", value);
        nicheData = parseNicheData([value]);
      }
    } else {
      console.log(
        "[NicheRenderer] No value provided, showing all niches without highlight"
      );
    }

    // Filtra dados válidos
    const validNicheData = nicheData.filter((niche) => {
      const hasText = niche.text && niche.text.trim() !== "";
      const hasIcon = niche.icon && niche.icon.trim() !== "";
      return hasText || hasIcon;
    });

    console.log("[NicheRenderer] Valid nicheData:", validNicheData);
    console.log("[NicheRenderer] All available niches:", allNiches);

    // Pega os textos dos nichos que o site possui (se houver)
    const siteNicheTexts = validNicheData
      .map((niche) => niche.text)
      .filter((text) => text && text.trim() !== "");

    console.log("[NicheRenderer] Site niche texts:", siteNicheTexts);

    // Sempre renderiza todos os ícones de nicho disponíveis
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', width: 'max-content' }}>
        {allNiches.map((niche, index) => {
          const isActive = siteNicheTexts.includes(niche.text);
          const IconComponent = niche.icon
            ? (NicheIcons as any)[niche.icon]
            : null;

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
        })}
      </div>
    );
  } catch (error) {
    console.error("[NicheRenderer] Error rendering niche:", error);
    return <span className="text-gray-500 dark:text-gray-400">-</span>;
  }
}
