import { getFaviconUrl, getFlagUrl } from "../form/utils/formatters";
import { supabase } from "../../lib/supabase";
import { NicheRenderer } from "./niche_rendering";
import { renderUnifiedBadge } from "./services/unifiedBadgeRenderer";

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
            <span className="text-gray-700 dark:text-gray-300 text-[13px] font-medium">
              {countryCode}
            </span>
          ) : percentage ? (
            <span className="text-gray-500 dark:text-gray-400 text-[13px]">
              ({percentage}%)
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}


// Render niche with icon (otimizado com componente dedicado)
export function renderNicheWithIcon(value: any) {
  return <NicheRenderer value={value} />;
}

// Format value for display
export function formatMarketplaceValue(
  value: any,
  fieldType: string,
  showCountryCodes: boolean = false,
  fieldLabel?: string
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
                className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }
      return value;

    case "toggle":
    case "radio":
      // Usar o serviço unificado para consistency
      const radioResult = renderUnifiedBadge(value, fieldType, fieldLabel);
      return radioResult;

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
            <span className="text-gray-500 dark:text-gray-400 text-[13px]">
              {state_name} - {city_names.join(", ")}
            </span>
          );
        } else if (Array.isArray(cities) && cities.length > 0) {
          return (
            <span className="text-gray-500 dark:text-gray-400 text-[13px]">
              {state_name} - {cities.join(", ")}
            </span>
          );
        }
        return (
          <span className="text-gray-500 dark:text-gray-400 text-[13px]">
            {state_name || state || "-"}
          </span>
        );
      }
      return value.toString();

    default:
      // Use unified badge renderer for all other cases
      const unifiedResult = renderUnifiedBadge(value, fieldType, fieldLabel);
      return unifiedResult;
  }
}
