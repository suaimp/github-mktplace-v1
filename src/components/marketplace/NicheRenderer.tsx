import React from "react";
import * as NicheIcons from "../../../icons/niche-icons";
import {
  parseNicheData,
  type NicheOption
} from "../../../services/db-services/form-services/formFieldNicheService";
import { MarketplaceTableInfoTooltip } from "../Tooltip";
import { useNiches } from "../hooks/useNiches";

interface NicheRendererProps {
  value: any;
}

export function NicheRenderer({ value }: NicheRendererProps) {
  const { niches: allNiches, loading } = useNiches();

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
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
              text={niche.text}
              tableLoaded={true}
              entriesCount={1}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                />
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
