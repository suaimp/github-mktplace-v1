import { useState } from "react";
import { ChevronDownIcon } from "../../icons";
import {
  extractDomain,
  getFaviconUrl,
  getFlagUrl
} from "../form/utils/formatters";
import { supabase } from "../../lib/supabase";

interface ExpandableRowProps {
  title: string;
  data: Record<string, any>;
  columns: Array<{
    id: string;
    label: string;
    field_type?: string;
    showLabel?: boolean;
  }>;
}

export default function ExpandableRow({ data, columns }: ExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get visible columns (those with showLabel true)
  const visibleColumns = columns.filter((col) => col.showLabel);

  // Format cell value based on field type
  const formatCellValue = (value: any, fieldType?: string) => {
    if (value === undefined || value === null) return "-";

    // Handle URL fields
    if (
      fieldType === "url" ||
      (typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://")))
    ) {
      return renderUrlWithFavicon(value);
    }

    // Handle brand fields
    if (fieldType === "brand") {
      return renderBrandWithLogo(value);
    }

    // Handle country fields
    if (fieldType === "country" && typeof value === "object") {
      return renderCountryFlags(value);
    }

    return value;
  };

  // Render URL with favicon
  const renderUrlWithFavicon = (url: string) => {
    if (!url) return "-";

    return (
      <div className="flex items-center gap-2">
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
          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline truncate max-w-[200px]"
        >
          {extractDomain(url)}
        </a>
      </div>
    );
  };

  // Render brand with logo
  const renderBrandWithLogo = (value: any) => {
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
          <span className="text-gray-800 dark:text-white/90 font-medium">
            {brandData.name}
          </span>
        </div>
      );
    } catch (err) {
      console.error("Error rendering brand:", err);
      return value?.toString() || "-";
    }
  };

  // Get brand logo URL from storage
  const getBrandLogoUrl = (logoPath: string): string => {
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
  };

  // Render country flags with codes
  const renderCountryFlags = (countries: Record<string, any>) => {
    if (!countries || Object.keys(countries).length === 0) return "-";

    // Always show country codes in ExpandableRow
    const showCountryCodes = true;

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
  };

  return (
    <div className="table-row-container border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="table-row-header w-full grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        {/* Show only visible columns in header */}
        {visibleColumns.slice(0, 4).map((column, index) => (
          <div
            key={column.id}
            className={`table-row-col ${
              index === 0
                ? "font-medium text-gray-800 dark:text-white/90"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {formatCellValue(data[column.id], column.field_type)}
          </div>
        ))}

        <div className="table-row-col flex items-center justify-end">
          <ChevronDownIcon
            className={`table-row-icon w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <div
        className={`table-row-content transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="table-row-body p-4 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Show all columns in expanded view */}
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {column.label}
                </span>
                <span className="text-gray-800 dark:text-white/90">
                  {formatCellValue(data[column.id], column.field_type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
