import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { getFlagUrl, getFaviconUrl, extractDomain } from '../form/utils/formatters';
import { supabase } from "../../lib/supabase";

interface FormEntry {
  id: string;
  created_at: string;
  status: string;
  created_by?: string | null;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  values: Record<string, any>;
}

interface FormEntriesTableProps {
  entries: FormEntry[];
  fields: any[];
  urlFields?: string[];
  onEdit?: (entry: FormEntry) => void;
  onDelete?: (entryId: string) => void;
}

export default function FormEntriesTable({ entries, fields, urlFields = [], onEdit, onDelete }: FormEntriesTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: any, fieldType: string, fieldId: string) => {
    if (!value) return '-';

    // Special handling for URL fields
    if (fieldType === 'url' || urlFields.includes(fieldId)) {
      return renderUrlWithFavicon(value);
    }
    
    // Special handling for brand fields
    if (fieldType === 'brand') {
      return renderBrandWithLogo(value);
    }
    
    // Handle country fields
    if (fieldType === 'country' && typeof value === 'object') {
      return renderCountryFlags(value, fieldId);
    }
    
    switch (fieldType) {
      case 'file':
        return Array.isArray(value) 
          ? `${value.length} arquivo(s)` 
          : '1 arquivo';
      
      case 'checkbox':
      case 'multiselect':
        return Array.isArray(value) 
          ? value.join(', ') 
          : value;
      
      case 'toggle':
        return value ? 'Sim' : 'Não';
      
      case 'product':
        try {
          const productData = typeof value === 'string' ? JSON.parse(value) : value;
          const price = parseFloat(productData.price);
          
          if (!isNaN(price)) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(price);
          }
        } catch (err) {
          console.error('Error formatting price:', err);
        }
        return value.toString();

      case 'commission':
        const commission = parseFloat(value);
        return !isNaN(commission) ? `${commission}%` : value;

      case 'brazilian_states':
        if (typeof value === 'object') {
          const { state_name, city_names, state, cities } = value;
          if (Array.isArray(city_names) && city_names.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                {state_name} - {city_names.join(', ')}
              </span>
            );
          } else if (Array.isArray(cities) && cities.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                {state_name} - {cities.join(', ')}
              </span>
            );
          }
          return (
            <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
              {state_name || state || '-'}
            </span>
          );
        }
        return value.toString();
      
      default:
        return value.toString();
    }
  };

  // Render URL with favicon - without truncation
  const renderUrlWithFavicon = (url: string) => {
    if (!url) return '-';
    
    // Clean up the URL to remove protocol and trailing slash
    let displayUrl = url;
    
    // Remove protocol (http:// or https://)
    displayUrl = displayUrl.replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    displayUrl = displayUrl.replace(/\/$/, '');
    
    return (
      <div className="flex items-center gap-2">
        <img 
          src={getFaviconUrl(url)} 
          alt="Site icon" 
          width="24"
          height="24"
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
          className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 hover:underline"
        >
          {displayUrl}
        </a>
      </div>
    );
  };

  // Render brand with logo
  const renderBrandWithLogo = (value: any) => {
    try {
      // Parse the brand data if it's a string
      const brandData = typeof value === 'string' ? JSON.parse(value) : value;
      
      if (!brandData || !brandData.name) return '-';
      
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
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-gray-800 dark:text-white/90 font-medium">
            {brandData.name}
          </span>
        </div>
      );
    } catch (err) {
      console.error('Error rendering brand:', err);
      return value?.toString() || '-';
    }
  };

  // Get brand logo URL from storage
  const getBrandLogoUrl = (logoPath: string): string => {
    if (!logoPath) return '';
    
    try {
      const { data } = supabase.storage
        .from('brand_logos')
        .getPublicUrl(logoPath);
        
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Error getting brand logo URL:', err);
      return '';
    }
  };

  // Find field settings by field ID
  const getFieldSettings = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return null;
    return field.form_field_settings;
  };

  // Render country flags with codes or percentages
  const renderCountryFlags = (countries: Record<string, any>, fieldId: string) => {
    if (!countries || Object.keys(countries).length === 0) return '-';
    
    // Check if we should show country codes instead of percentages
    const fieldSettings = getFieldSettings(fieldId);
    const showCountryCodes = fieldSettings?.show_percentage === true;
    
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(countries).map(([countryCode, percentage]) => (
          <div key={countryCode} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
            <img 
              src={getFlagUrl(countryCode)}
              alt={countryCode}
              width="24"
              height="24"
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Data
                </TableCell>
                {fields.map((field) => (
                  <TableCell
                    key={field.id}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {field.label}
                  </TableCell>
                ))}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Publisher
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.created_at)}
                    </span>
                  </TableCell>
                  
                  {fields.map((field) => (
                    <TableCell 
                      key={field.id}
                      className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      {formatValue(entry.values[field.id], field.field_type, field.id)}
                    </TableCell>
                  ))}
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {entry.publisher ? (
                      <div>
                        <div className="font-medium">{entry.publisher.first_name} {entry.publisher.last_name}</div>
                        <div className="text-xs">{entry.publisher.email}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      color={
                        entry.status === "verificado"
                          ? "success"
                          : entry.status === "reprovado"
                          ? "error"
                          : "warning"
                      }
                    >
                      {entry.status === "verificado"
                        ? "Verificado"
                        : entry.status === "reprovado"
                        ? "Reprovado"
                        : "Em Análise"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este registro?')) {
                              onDelete(entry.id);
                            }
                          }}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {entries.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={fields.length + 4} 
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}