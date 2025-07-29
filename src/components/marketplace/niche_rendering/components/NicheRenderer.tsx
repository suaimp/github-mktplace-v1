import { useNichesWithRealTimeUpdates } from "../hooks/useNichesWithRealTimeUpdates";
import { parseNicheValue } from "../services/nicheValueParser";
import { NicheIcon } from "./NicheIcon";
import { NicheLoadingSkeleton } from "./NicheLoadingSkeleton";

interface NicheRendererProps {
  value: any;
}

export function NicheRenderer({ value }: NicheRendererProps) {
  const { niches: allNiches, loading, error } = useNichesWithRealTimeUpdates();

  if (loading) {
    return <NicheLoadingSkeleton />;
  }

  if (error) {
    console.error("[NicheRenderer] Error loading niches:", error);
    return <span>-</span>;
  }

  try {
    // Parse os dados do nicho atual
    const validNicheData = parseNicheValue(value);
    
    // Pega os textos dos nichos que o site possui
    const siteNicheTexts = validNicheData
      .map((niche) => niche.text)
      .filter((text) => text && text.trim() !== "");

    // Renderiza todos os ícones de nicho disponíveis
    return (
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        flexWrap: 'nowrap', 
        width: 'max-content' 
      }}>
        {allNiches.map((niche, index) => {
          const isActive = siteNicheTexts.includes(niche.text);
          
          return (
            <NicheIcon
              key={`${niche.text}-${index}`}
              niche={niche}
              isActive={isActive}
              index={index}
            />
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("[NicheRenderer] Error rendering niche:", error);
    return <span>-</span>;
  }
}
