export function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getFlagUrl(countryCode: string): string {
  if (countryCode === "ROW") {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzZCN0FCNSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0xIDE3LjkzYy0zLjk1LS40OS03LTMuODUtNy03LjkzIDAtLjYyLjA4LTEuMjEuMjEtMS43OUw5IDEzdjFjMCAxLjEuOSAyIDIgMnYzLjkzem02LjktMi41NGMtLjI2LS44MS0xLTEuMzktMS45LTEuMzloLTF2LTNjMC0uNTUtLjQ1LTEtMS0xaC02di0yaDJjLjU1IDAgMS0uNDUgMS0xVjdoMmMxLjEgMCAyLS45IDItMnYtLjQxYzIuOTMgMS4xOSA1IDQuMDYgNSA3LjQxIDAgMi4wOC0uOCAzLjk3LTIuMSA1LjM5eiIvPjwvc3ZnPg==";
  }
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}

export function formatValue(value: any, fieldType: string) {
  if (!value) return "-";

  switch (fieldType) {
    case "file":
      return Array.isArray(value) ? `${value.length} arquivo(s)` : "1 arquivo";

    case "checkbox":
    case "multiselect":
      return Array.isArray(value) ? value.join(", ") : value;

    case "toggle":
      return value ? "Sim" : "Não";

    case "product":
      try {
        const productData =
          typeof value === "string" ? JSON.parse(value) : value;
        const price = parseFloat(productData.price);

        if (!isNaN(price)) {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(price);
        }
      } catch (err) {
        console.error("Error formatting price:", err);
      }
      return value.toString();

    case "commission":
      const commission = parseFloat(value);
      return !isNaN(commission) ? `${commission}%` : value;

    case "country":
      if (typeof value === "object") {
        return Object.keys(value).join(", ");
      }
      return value.toString();

    case "brazilian_states":
      if (typeof value === "object") {
        const { state_name, city_names, state, cities } = value;

        // Format with consistent text style
        if (Array.isArray(city_names) && city_names.length > 0) {
          return `${state_name} - ${city_names.join(", ")}`;
        } else if (Array.isArray(cities) && cities.length > 0) {
          return `${state_name} - ${cities.join(", ")}`;
        }

        return state_name || state || "-";
      }
      return value.toString();

    case "brand":
      try {
        const brandData = typeof value === "string" ? JSON.parse(value) : value;
        return brandData?.name || value.toString();
      } catch (err) {
        console.error("Error parsing brand data:", err);
        return value.toString();
      }

    default:
      return value.toString();
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (e) {
    return url;
  }
}

// Get favicon URL for a domain
export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

// Get brand logo URL from storage path
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

// Render URL with favicon (returns HTML string for non-React contexts)
export function getUrlWithFaviconHtml(url: string): string {
  if (!url) return "-";

  const faviconUrl = getFaviconUrl(url);

  return `
    <div class="flex items-center gap-2">
      <img src="${faviconUrl}" alt="Site icon" class="w-4 h-4" onerror="this.style.display='none';" />
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline">
        ${url}
      </a>
    </div>
  `;
}

// Import supabase client
import { supabase } from "../../../lib/supabase";
