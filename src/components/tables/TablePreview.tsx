import ExpandableRow from './ExpandableRow';
import { extractDomain, getFaviconUrl, getFlagUrl } from '../form/utils/formatters';

interface TablePreviewProps {
  selectedColumns: string[];
  formFields: any[];
}

export default function TablePreview({ selectedColumns, formFields = [] }: TablePreviewProps) {
  // Get selected field data - Add null check with default empty array
  const selectedFields = (formFields || [])
    .filter(field => selectedColumns.includes(field.id))
    .map(field => ({
      id: field.id,
      label: field.label,
      field_type: field.field_type,
      showLabel: true // Default to showing label
    }));

  // Generate sample data
  const sampleData = [1, 2, 3].map(index => {
    const data: Record<string, any> = {};
    selectedFields.forEach(field => {
      data[field.id] = getSampleData(field.field_type, field.id);
    });
    return data;
  });

  // Render URL with favicon
  const renderUrlWithFavicon = (url: string) => {
    if (!url) return '-';
    
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
            (e.target as HTMLImageElement).style.display = 'none';
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

  // Render country flags with codes
  const renderCountryFlags = (countries: Record<string, any>) => {
    if (!countries || Object.keys(countries).length === 0) return '-';
    
    // Always show country codes in preview
    const showCountryCodes = true;
    
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(countries).map(([countryCode, percentage]) => (
          <div key={countryCode} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
            <img 
              src={getFlagUrl(countryCode)}
              alt={countryCode}
              width="20"
              height="20"
              className={`rounded-full ${countryCode === 'ROW' ? 'dark:invert' : ''}`}
              onError={(e) => {
                // Fallback if flag fails to load
                (e.target as HTMLImageElement).style.display = 'none';
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

  // Format cell value based on field type
  const formatCellValue = (value: any, fieldType: string) => {
    if (value === undefined || value === null) return '-';
    
    // Handle URL fields
    if (fieldType === 'url' || 
        (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')))) {
      return renderUrlWithFavicon(value);
    }
    
    // Handle country fields
    if (fieldType === 'country' && typeof value === 'object') {
      return renderCountryFlags(value);
    }
    
    return value.toString();
  };

  return (
    <div className="table-preview-container w-full">
      <div className="table-preview-content space-y-4 w-full">
        {/* Sample rows */}
        {sampleData.map((data, index) => (
          <ExpandableRow 
            key={index} 
            title={`Sample Row ${index + 1}`}
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

function getSampleData(fieldType: string, fieldId: string): any {
  // Generate URL for URL fields
  if (fieldType === 'url') {
    const domains = [
      'https://example.com',
      'https://google.com',
      'https://github.com',
      'https://microsoft.com',
      'https://apple.com'
    ];
    return domains[Math.floor(Math.random() * domains.length)];
  }

  // Generate country data for country fields
  if (fieldType === 'country') {
    const countryCodes = ['US', 'GB', 'BR', 'DE', 'FR', 'JP', 'AU', 'CA', 'IT', 'ES'];
    const sampleCountries: Record<string, number> = {};
    
    // Add 1-3 random countries with percentages
    const numCountries = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCountries; i++) {
      const randomCountry = countryCodes[Math.floor(Math.random() * countryCodes.length)];
      sampleCountries[randomCountry] = Math.floor(Math.random() * 100);
    }
    
    return sampleCountries;
  }

  switch (fieldType) {
    case 'text':
      return 'Sample Text';
    case 'textarea':
      return 'This is a longer sample text that could span multiple lines...';
    case 'number':
      return Math.floor(Math.random() * 1000).toString();
    case 'email':
      return 'sample@example.com';
    case 'phone':
      return '+1 (555) 123-4567';
    case 'date':
      return '2025-03-15';
    case 'time':
      return '14:30';
    case 'select':
    case 'radio':
      return 'Option 1';
    case 'multiselect':
    case 'checkbox':
      return 'Option 1, Option 2';
    case 'file':
      return 'document.pdf';
    case 'toggle':
      return 'Yes';
    case 'product':
      return 'R$ 199,90';
    case 'commission':
      return '15%';
    case 'brazilian_states':
      return 'São Paulo - SP';
    case 'moz_da':
    case 'semrush_as':
    case 'ahrefs_dr':
      return '45';
    case 'ahrefs_traffic':
    case 'similarweb_traffic':
    case 'google_traffic':
      return '12,345';
    default:
      return 'Sample Data';
  }
}