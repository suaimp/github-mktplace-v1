import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { extractDomain, getFaviconUrl, getFlagUrl } from "./utils/formatters";

interface TableLayoutDisplayProps {
  displayId: string;
}

interface Field {
  id: string;
  label: string;
  field_type: string;
}

interface TableCell {
  id: string;
  fieldId: string | null;
  showLabel: boolean;
}

export default function TableLayoutDisplay({
  displayId
}: TableLayoutDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [layout, setLayout] = useState<TableCell[][]>([]);
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadTableDisplay();
  }, [displayId]);

  async function loadTableDisplay() {
    try {
      setLoading(true);
      setError("");

      // Load table display settings
      const { data: display, error: displayError } = await supabase
        .from("table_displays")
        .select(
          `
          *,
          form:forms (
            id,
            form_fields (*)
          )
        `
        )
        .eq("id", displayId)
        .single();

      if (displayError) throw displayError;

      // Create fields lookup map
      const fieldsMap: Record<string, Field> = {};
      display.form.form_fields.forEach((field: Field) => {
        fieldsMap[field.id] = field;
      });
      setFields(fieldsMap);

      // Set layout
      if (display.settings?.layout) {
        setLayout(display.settings.layout);
      }

      // Load form entries
      const { data: entries, error: entriesError } = await supabase
        .from("form_entries")
        .select(
          `
          *,
          values:form_entry_values (
            field_id,
            value,
            value_json
          )
        `
        )
        .eq("form_id", display.form.id)
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;

      // Process entries
      const processedEntries = entries?.map((entry) => {
        const values: Record<string, any> = {};
        entry.values.forEach((value: any) => {
          values[value.field_id] = value.value_json || value.value;
        });
        return values;
      });

      setEntries(processedEntries || []);
    } catch (err) {
      console.error("Error loading table display:", err);
      setError("Error loading table display");
    } finally {
      setLoading(false);
    }
  }

  // Format cell value based on field type
  const formatCellValue = (value: any, fieldType: string) => {
    if (value === undefined || value === null) return "-";

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

    // Format other field types
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
      default:
        return value.toString();
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-error-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, entryIndex) => (
        <div
          key={entryIndex}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
        >
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid grid-cols-5 gap-4 p-4 ${
                rowIndex === 0
                  ? ""
                  : "border-t border-gray-200 dark:border-gray-800"
              }`}
            >
              {row.map((cell) => {
                if (!cell.fieldId)
                  return (
                    <div
                      key={cell.id}
                      className="text-gray-400 dark:text-gray-600"
                    >
                      -
                    </div>
                  );

                const field = fields[cell.fieldId];
                if (!field) return null;

                return (
                  <div key={cell.id} className="space-y-1">
                    {cell.showLabel && (
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {field.label}
                      </div>
                    )}
                    <div className="text-gray-800 dark:text-white/90">
                      {formatCellValue(entry[cell.fieldId], field.field_type)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {entries.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No entries found
        </div>
      )}
    </div>
  );
}
