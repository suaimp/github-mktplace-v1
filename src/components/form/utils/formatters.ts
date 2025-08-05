export function formatDate(date: string) {
  if (!date) return '-';
  // Corrige formato do banco: '2025-07-28 18:00:15.231841+00' => '2025-07-28T18:00:15.231841+00:00'
  let fixed = date.trim();
  // Se vier com espaço, troca por T
  if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(fixed)) {
    fixed = fixed.replace(' ', 'T');
  }
  // Se termina com +00 ou +0000, normaliza para +00:00
  fixed = fixed.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  // Se termina só com +00, adiciona :00
  if (/([+-]\d{2})$/.test(fixed)) {
    fixed = fixed + ':00';
  }
  const d = new Date(fixed);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFlagUrl(countryCode: string): string {
  if (countryCode === 'ROW') {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzZCN0FCNSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0xIDE3LjkzYy0zLjk1LS40OS03LTMuODUtNy03LjkzIDAtLjYyLjA4LTEuMjEuMjEtMS43OUw5IDEzdjFjMCAxLjEuOSAyIDIgMnYzLjkzem02LjktMi41NGMtLjI2LS44MS0xLTEuMzktMS45LTEuMzloLTF2LTNjMC0uNTUtLjQ1LTEtMS0xaC02di0yaDJjLjU1IDAgMS0uNDUgMS0xVjdoMmMxLjEgMCAyLS45IDItMnYtLjQxYzIuOTMgMS4xOSA1IDQuMDYgNSA3LjQxIDAgMi4wOC0uOCAzLjk3LTIuMSA1LjM5eiIvPjwvc3ZnPg==";
  }
  return `https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`;
}

export function formatValue(value: any, fieldType: string) {
  if (!value) return '-';

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

    case 'country':
      if (typeof value === 'object') {
        return Object.keys(value).join(', ');
      }
      return value.toString();

    case 'brazilian_states':
      if (typeof value === 'object') {
        const { state_name, city_names, state, cities } = value;
        
        // Format with consistent text style
        if (Array.isArray(city_names) && city_names.length > 0) {
          return `${state_name} - ${city_names.join(', ')}`;
        } else if (Array.isArray(cities) && cities.length > 0) {
          return `${state_name} - ${cities.join(', ')}`;
        }
        
        return state_name || state || '-';
      }
      return value.toString();
    
    case 'brand':
      try {
        const brandData = typeof value === 'string' ? JSON.parse(value) : value;
        return brandData?.name || value.toString();
      } catch (err) {
        console.error('Error parsing brand data:', err);
        return value.toString();
      }
    
    default:
      return value.toString();
  }
}

// Extract domain from URL (original domain for favicons)
export function extractDomain(url: string): string {
  try {
    // Remove protocol (http:// or https://)
    let domain = url.replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    domain = domain.replace(/\/$/, '');
    
    // Remove www. prefix
    domain = domain.replace(/^www\./, '');
    
    // Get only the domain (first part before any path)
    domain = domain.split('/')[0];
    
    return domain;
  } catch (e) {
    return url;
  }
}

// Extract clean domain for display (removes country extensions)
export function extractCleanDomain(url: string): string {
  try {
    let domain = extractDomain(url);
    
    // Remove country extensions (.br, .uk, .au, etc) - keep only main domain + extension
    // Example: site.com.br -> site.com, site.org.uk -> site.org
    domain = domain.replace(/\.(br|uk|au|ca|de|fr|es|it|nl|se|no|dk|fi|pl|ru|jp|cn|in|mx|ar|cl|co|pe|ve|ec|uy|py|bo|cr|gt|hn|ni|pa|sv|do|cu|jm|ht|tt|bb|gd|lc|vc|ag|dm|kn|ms|ai|vg|vi|pr|bz|gf|sr|gy|fk|gs|sh|ac|tc|ky|bm|gl|fo|is|ie|mt|cy|bg|ro|hr|si|sk|cz|hu|at|ch|li|ad|mc|sm|va|lu|be|dk|se|no|fi|ee|lv|lt|by|ua|md|mk|al|ba|me|rs|xk|si|hr|bg|ro|tr|gr|ge|am|az|kz|kg|tj|tm|uz|af|pk|bd|bt|np|lk|mv|io|cc|cx|nf|pn|tk|nu|ck|as|fm|gu|ki|mh|mp|nr|pw|pg|ws|sb|to|tv|vu|wf|nz|fj|nc|pf|tf|yt|re|mu|sc|mg|mz|za|zw|zm|mw|ls|sz|bw|na|ao|st|gq|ga|cg|cd|cf|cm|td|ne|ng|bj|tg|gh|ci|lr|sl|gn|gw|cv|sn|gm|ml|bf|mr|dz|tn|ly|eg|sd|ss|et|er|dj|so|ke|ug|tz|rw|bi|mz|mg|km|sc|mu|re|yt|tf|mq|gp|bl|mf|pm|aw|an|cw|sx|bq|vc|lc|gd|dm|ag|ms|kn|ai|vg|vi|pr|do|ht|jm|cu|bs|tc|ky|bm|gl|fo|is|ie|gb|im|je|gg)$/i, '');
    
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
}

// Render URL with favicon (returns HTML string for non-React contexts)
export function getUrlWithFaviconHtml(url: string): string {
  if (!url) return '-';
  
  // Clean up the URL to remove protocol and trailing slash for display
  const displayUrl = extractCleanDomain(url);
  
  const faviconUrl = getFaviconUrl(url);
  
  return `
    <div class="flex items-center gap-2">
      <img src="${faviconUrl}" alt="Site icon" class="w-5 h-5" onerror="this.style.display='none';" />
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="font-semibold text-gray-800 text-theme-sm dark:text-white/90 hover:underline">
        ${displayUrl}
      </a>
    </div>
  `;
}

// Import supabase client
import { supabase } from '../../../lib/supabase';