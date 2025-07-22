import React from "react";
import { getFaviconUrl, getFlagUrl } from "../form/utils/formatters";
import { supabase } from "../../lib/supabase";
import * as NicheIcons from "../../icons/niche-icons";
import {
  parseNicheData,
  type NicheOption
} from "../../services/db-services/form-services/formFieldNicheService";
import InfoTooltip from "../ui/InfoTooltip/InfoTooltip";

// Cache para armazenar todos os nichos disponíveis
let allAvailableNiches: NicheOption[] = [];
let nichesLoaded = false;

// Função para buscar todos os nichos disponíveis do banco de dados
async function loadAllAvailableNiches(): Promise<NicheOption[]> {
  if (nichesLoaded && allAvailableNiches.length > 0) {
    return allAvailableNiches;
  }

  try {
    console.log("[loadAllAvailableNiches] Fetching niches from database...");

    const { data: nicheFields, error } = await supabase
      .from("form_field_niche")
      .select("options");

    if (error) {
      console.error("[loadAllAvailableNiches] Error fetching niches:", error);
      return [];
    }

    const uniqueNiches = new Map<string, NicheOption>();

    // Processa todos os nichos de todos os campos
    nicheFields?.forEach((field) => {
      if (field.options && Array.isArray(field.options)) {
        const parsedNiches = parseNicheData(field.options);
        parsedNiches.forEach((niche) => {
          if (niche.text && niche.text.trim() !== "") {
            // Usa o texto como chave para evitar duplicatas
            uniqueNiches.set(niche.text, niche);
          }
        });
      }
    });

    allAvailableNiches = Array.from(uniqueNiches.values());
    nichesLoaded = true;

    console.log("[loadAllAvailableNiches] Loaded niches:", allAvailableNiches);
    return allAvailableNiches;
  } catch (error) {
    console.error("[loadAllAvailableNiches] Error:", error);
    return [];
  }
}

// Render URL with favicon
export function renderUrlWithFavicon(url: string) {
  if (!url) return "-";

  // Clean up the URL to remove protocol and trailing slash
  let displayUrl = url;

  // Remove protocol (http:// or https://)
  displayUrl = displayUrl.replace(/^https?:\/\//, "");

  // Remove trailing slash
  displayUrl = displayUrl.replace(/\/$/, "");

  return (
    <div className="url-cell">
      <img
        src={getFaviconUrl(url)}
        alt="Site icon"
        width="20"
        height="20"
        className="flex-shrink-0"
        onError={(e) => {
          // Fallback if favicon fails to load
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gray-800 text-theme-2xs xl:text-theme-sm dark:text-white/90 hover:underline whitespace-nowrap"
      >
        {displayUrl}
      </a>
    </div>
  );
}

// Render brand with logo
export function renderBrandWithLogo(value: any) {
  try {
    // Parse the brand data if it's a string
    const brandData = typeof value === "string" ? JSON.parse(value) : value;

    if (!brandData || !brandData.name) return "-";

    // If there's no logo, just return the name
    if (!brandData.logo) return brandData.name;

    // Get the logo URL from storage
    const logoUrl = getBrandLogoUrl(brandData.logo);

    return (
      <div className="flex items-center gap-2">
        <img
          src={logoUrl}
          alt={`${brandData.name} logo`}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            // Fallback if logo fails to load
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-gray-800 dark:text-white/90 font-medium text-theme-2xs xl:text-sm">
          {brandData.name}
        </span>
      </div>
    );
  } catch (err) {
    console.error("Error rendering brand:", err);
    return value?.toString() || "-";
  }
}

// Get brand logo URL from storage
export function getBrandLogoUrl(logoPath: string): string {
  if (!logoPath) return "";

  try {
    const { data } = supabase.storage
      .from("brand_logos")
      .getPublicUrl(logoPath);

    return data?.publicUrl || "";
  } catch (err) {
    console.error("Error getting brand logo URL:", err);
    return "";
  }
}

// Render country flags with codes
export function renderCountryFlags(
  countries: Record<string, any>,
  showCountryCodes: boolean = false
) {
  if (!countries || Object.keys(countries).length === 0) return "-";

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(countries).map(([countryCode, percentage]) => (
        <div
          key={countryCode}
          className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
        >
          <img
            src={getFlagUrl(countryCode)}
            alt={countryCode}
            width="20"
            height="20"
            className={`rounded-full ${
              countryCode === "ROW" ? "dark:invert" : ""
            }`}
            onError={(e) => {
              // Fallback if flag fails to load
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {showCountryCodes ? (
            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
              {countryCode}
            </span>
          ) : percentage ? (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              ({percentage}%)
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}


// Render niche with icon (agora busca dados do banco)
export function renderNicheWithIcon(value: any) {
  console.log("[renderNicheWithIcon] Raw value received:", value);
  console.log("[renderNicheWithIcon] Value type:", typeof value);
  console.log(
    "[renderNicheWithIcon] Value stringified:",
    JSON.stringify(value)
  );

  // Componente que renderiza os nichos com dados do banco
  const NicheRenderer = () => {
    const [allNiches, setAllNiches] = React.useState<NicheOption[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadAllAvailableNiches().then((niches) => {
        setAllNiches(niches);
        setLoading(false);
      });
    }, []);

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
          console.log("[renderNicheWithIcon] Processing string value:", value);

          // Verifica se parece ser JSON
          if (value.trim().startsWith("[") || value.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(value);
              console.log("[renderNicheWithIcon] Parsed JSON:", parsed);
              nicheData = parseNicheData(
                Array.isArray(parsed) ? parsed : [parsed]
              );
            } catch {
              console.log(
                "[renderNicheWithIcon] Failed to parse JSON, skipping malformed data"
              );
              // Continua sem dados de nicho, vai exibir todos sem destaque
            }
          } else {
            // String simples, trata como texto
            console.log(
              "[renderNicheWithIcon] Simple string, treating as text"
            );
            nicheData = [{ text: value, icon: undefined }];
          }
        } else if (Array.isArray(value)) {
          console.log("[renderNicheWithIcon] Processing array value:", value);
          nicheData = parseNicheData(value);
        } else {
          console.log("[renderNicheWithIcon] Processing object value:", value);
          nicheData = parseNicheData([value]);
        }
      } else {
        console.log(
          "[renderNicheWithIcon] No value provided, showing all niches without highlight"
        );
      }

      // Filtra dados válidos
      const validNicheData = nicheData.filter((niche) => {
        const hasText = niche.text && niche.text.trim() !== "";
        const hasIcon = niche.icon && niche.icon.trim() !== "";
        return hasText || hasIcon;
      });

      console.log("[renderNicheWithIcon] Valid nicheData:", validNicheData);
      console.log("[renderNicheWithIcon] All available niches:", allNiches);

      // Pega os textos dos nichos que o site possui (se houver)
      const siteNicheTexts = validNicheData
        .map((niche) => niche.text)
        .filter((text) => text && text.trim() !== "");

      console.log("[renderNicheWithIcon] Site niche texts:", siteNicheTexts);

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
              <InfoTooltip
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
              </InfoTooltip>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("[renderNicheWithIcon] Error rendering niche:", error);
      return <span>-</span>;
    }
  };

  return <NicheRenderer />;
}

// Format value for display
export function formatMarketplaceValue(
  value: any,
  fieldType: string,
  showCountryCodes: boolean = false
) {
  if (value === null || value === undefined) return "-";

  // Skip button_buy fields
  if (fieldType === "button_buy") {
    return null;
  }

  // Special handling for URL fields
  if (fieldType === "url") {
    return renderUrlWithFavicon(value);
  }

  // Special handling for brand fields
  if (fieldType === "brand") {
    return renderBrandWithLogo(value);
  }

  // Special handling for niche fields
  if (fieldType === "niche") {
    return renderNicheWithIcon(value);
  }

  // Handle country fields
  if (fieldType === "country" && typeof value === "object") {
    return renderCountryFlags(value, showCountryCodes);
  }

  // Handle niche fields
  if (fieldType === "niche") {
    return renderNicheWithIcon(value);
  }

  switch (fieldType) {
    case "file":
      return Array.isArray(value) ? `${value.length} arquivo(s)` : "1 arquivo";

    case "checkbox":
    case "multiselect":
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <span
                key={index}
                className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-theme-2xs xl:text-theme-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }
      return value;

    case "toggle":
      return value ? "Sim" : "Não";

    case "product":
      try {
        const productData =
          typeof value === "string" ? JSON.parse(value) : value;

        // Primeiro verifica se existe promotional_price válido
        let priceToUse: number | null = null;

        if (productData.promotional_price) {
          const promotionalPrice = parseFloat(productData.promotional_price);
          if (!isNaN(promotionalPrice) && promotionalPrice > 0) {
            priceToUse = promotionalPrice;
          }
        }

        // Se não há promotional_price válido, usa o price
        if (priceToUse === null && productData.price) {
          const regularPrice = parseFloat(productData.price);
          if (!isNaN(regularPrice)) {
            priceToUse = regularPrice;
          }
        }

        if (priceToUse !== null) {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(priceToUse);
        }
      } catch (err) {
        console.error("Error formatting price:", err);
        // Se houver erro no parse e o valor for um número, tenta formatar diretamente
        const directPrice = parseFloat(value);
        if (!isNaN(directPrice)) {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(directPrice);
        }
      }
      return value.toString();

    case "commission":
      const commission = parseFloat(value);
      return !isNaN(commission) ? `${commission}%` : value;

    case "brazilian_states":
      if (typeof value === "object") {
        const { state_name, city_names, state, cities } = value;
        if (Array.isArray(city_names) && city_names.length > 0) {
          return (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {state_name} - {city_names.join(", ")}
            </span>
          );
        } else if (Array.isArray(cities) && cities.length > 0) {
          return (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {state_name} - {cities.join(", ")}
            </span>
          );
        }
        return (
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {state_name || state || "-"}
          </span>
        );
      }
      return value.toString();

    default:
      return value.toString();
  }
}
