import ExpandableRow from "./ExpandableRow";

interface TablePreviewProps {
  selectedColumns: string[];
  formFields: any[];
}

export default function TablePreview({
  selectedColumns,
  formFields = []
}: TablePreviewProps) {
  // Get selected field data - Add null check with default empty array
  const selectedFields = (formFields || [])
    .filter((field) => selectedColumns.includes(field.id))
    .map((field) => ({
      id: field.id,
      label: field.label,
      field_type: field.field_type,
      showLabel: true // Default to showing label
    }));

  // Generate sample data
  const sampleData = [1, 2, 3].map(() => {
    const data: Record<string, any> = {};
    selectedFields.forEach((field) => {
      data[field.id] = getSampleData(field.field_type);
    });
    return data;
  });

  return (
    <div className="table-preview-container w-full">
      <div className="table-preview-content space-y-4 w-full">
        {/* Sample rows */}
        {sampleData.map((data) => (
          <ExpandableRow
            key={data.id}
            title={`Sample Row ${data.id}`}
            data={data}
            columns={selectedFields}
          />
        ))}

        {selectedColumns.length === 0 && (
          <div className="table-preview-empty text-center text-gray-500 dark:text-gray-400 w-full">
            Select columns above to preview the table layout
          </div>
        )}
      </div>
    </div>
  );
}

function getSampleData(fieldType: string): any {
  // Generate URL for URL fields
  if (fieldType === "url") {
    const domains = [
      "https://example.com",
      "https://google.com",
      "https://github.com",
      "https://microsoft.com",
      "https://apple.com"
    ];
    return domains[Math.floor(Math.random() * domains.length)];
  }

  // Generate country data for country fields
  if (fieldType === "country") {
    const countryCodes = [
      "US",
      "GB",
      "BR",
      "DE",
      "FR",
      "JP",
      "AU",
      "CA",
      "IT",
      "ES"
    ];
    const sampleCountries: Record<string, number> = {};

    // Add 1-3 random countries with percentages
    const numCountries = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCountries; i++) {
      const randomCountry =
        countryCodes[Math.floor(Math.random() * countryCodes.length)];
      sampleCountries[randomCountry] = Math.floor(Math.random() * 100);
    }

    return sampleCountries;
  }

  switch (fieldType) {
    case "text":
      return "Sample Text";
    case "textarea":
      return "This is a longer sample text that could span multiple lines...";
    case "number":
      return Math.floor(Math.random() * 1000).toString();
    case "email":
      return "sample@example.com";
    case "phone":
      return "+1 (555) 123-4567";
    case "date":
      return "2025-03-15";
    case "time":
      return "14:30";
    case "select":
    case "radio":
      return "Option 1";
    case "multiselect":
    case "checkbox":
      return "Option 1, Option 2";
    case "file":
      return "document.pdf";
    case "toggle":
      return "Yes";
    case "product":
      return "R$ 199,90";
    case "commission":
      return "15%";
    case "brazilian_states":
      return "São Paulo - SP";
    case "moz_da":
    case "semrush_as":
    case "ahrefs_dr":
      return "45";
    case "ahrefs_traffic":
    case "similarweb_traffic":
    case "google_traffic":
      return "12,345";
    default:
      return "Sample Data";
  }
}
