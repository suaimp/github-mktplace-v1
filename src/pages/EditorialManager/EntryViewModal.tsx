import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Modal } from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge";
import {
  extractDomain,
  getFaviconUrl,
  getFlagUrl
} from "../../components/tables/utils/formatters";

interface EntryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  isAdmin: boolean;
}

export default function EntryViewModal({
  isOpen,
  onClose,
  entry,
  isAdmin
}: EntryViewModalProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry && isOpen) {
      loadFormFields();
    }
  }, [entry, isOpen]);

  async function loadFormFields() {
    if (!entry?.form_id) return;

    try {
      setLoading(true);

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (*)
        `
        )
        .eq("form_id", entry.form_id)
        .order("position", { ascending: true });

      if (fieldsError) throw fieldsError;

      setFields(fieldsData || []);
    } catch (err) {
      console.error("Error loading form fields:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!entry) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verificado":
        return <Badge color="success">Verificado</Badge>;
      case "reprovado":
        return <Badge color="error">Reprovado</Badge>;
      case "em_analise":
      default:
        return <Badge color="warning">Em Análise</Badge>;
    }
  };

  // Render URL with favicon
  const renderUrlWithFavicon = (url: string) => {
    if (!url) return "-";

    return (
      <div className="flex items-center gap-2">
        <img
          src={getFaviconUrl(url)}
          alt="Site icon"
          className="w-4 h-4"
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

  // Render country flags with percentages
  const renderCountryFlags = (countries: Record<string, any>) => {
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
              className={`w-4 h-4 object-cover ${
                countryCode === "ROW" ? "dark:invert" : ""
              }`}
              onError={(e) => {
                // Fallback if flag fails to load
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {percentage && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                ({percentage}%)
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Format value for display
  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return "-";

    // Handle brand fields
    if (fieldType === "brand") {
      return renderBrandWithLogo(value);
    }

    // Handle URL fields
    if (
      fieldType === "url" ||
      (typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://")))
    ) {
      return renderUrlWithFavicon(value);
    }

    // Handle country fields
    if (fieldType === "country" && typeof value === "object") {
      return renderCountryFlags(value);
    }

    switch (fieldType) {
      case "file":
        return Array.isArray(value)
          ? `${value.length} arquivo(s)`
          : "1 arquivo";

      case "checkbox":
      case "multiselect":
        return Array.isArray(value) ? value.join(", ") : value;

      case "toggle":
        return value ? "Sim" : "Não";

      case "product":
        try {
          const productData =
            typeof value === "string" ? JSON.parse(value) : value;

          // Keep the original price string to preserve formatting
          if (typeof productData.price === "string") {
            // Display the price exactly as entered by the user
            const originalPrice = productData.price;
            return originalPrice.startsWith("R$")
              ? originalPrice
              : `R$ ${originalPrice}`;
          } else {
            // Fallback for non-string price values
            const price = parseFloat(productData.price);
            if (!isNaN(price)) {
              return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
              }).format(price);
            }
          }
        } catch (err) {
          console.error("Error formatting price:", err);
        }
        return value.toString();

      case "commission":
        const commission = parseFloat(value);
        return !isNaN(commission) ? `${commission}%` : value;

      case "brazilian_states":
        if (typeof value === "object") {
          const { state_name, city_names, state, cities } = value;

          // Format with consistent text style
          if (Array.isArray(city_names) && city_names.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {state_name} - {city_names.join(", ")}
              </span>
            );
          } else if (Array.isArray(cities) && cities.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {state_name} - {cities.join(", ")}
              </span>
            );
          }

          return (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {state_name || state || "-"}
            </span>
          );
        }
        return value.toString();

      default:
        return value.toString();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
        <div className="space-y-6">
          {/* Form Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {entry.form?.title || "Formulário sem título"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Criado em {formatDate(entry.created_at)}
            </p>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </h4>
            {getStatusBadge(entry.status || "em_analise")}
          </div>

          {/* Publisher Info */}
          {entry.publisher && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publisher
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {entry.publisher.first_name} {entry.publisher.last_name}
                </p>
                <p>{entry.publisher.email}</p>
              </div>
            </div>
          )}

          {/* Form Values */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valores do Formulário
            </h4>

            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-gray-500 dark:text-gray-400">
                  Carregando campos...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => {
                  const value = entry.values[field.id];
                  const settings = field.form_field_settings;

                  // Skip hidden fields unless admin
                  if (settings?.visibility === "hidden" && !isAdmin) {
                    return null;
                  }

                  // Skip admin-only fields unless admin
                  if (settings?.visibility === "admin" && !isAdmin) {
                    return null;
                  }

                  return (
                    <div
                      key={field.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4"
                    >
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {field.label}
                        {settings?.visibility === "admin" && (
                          <span className="ml-2 text-xs text-brand-500 dark:text-brand-400">
                            (Admin Only)
                          </span>
                        )}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatValue(value, field.field_type)}
                      </dd>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {entry.notes && entry.notes.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </h4>
              <div className="space-y-3">
                {entry.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {note.note}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDate(note.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
