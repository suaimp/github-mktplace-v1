/**
 * Tipos para exportação de dados em PDF
 */

export interface PdfExportData {
  entries: ExportEntry[];
  fields: ExportField[];
  formTitle: string;
  exportDate: string;
  totalEntries: number;
  logoBase64?: string; // Logo em base64 para o PDF
  // Informações sobre a aba/filtro exportado
  statusFilter?: string;
  statusDisplayName?: string;
  searchTerm?: string;
}

export interface ExportEntry {
  id: string;
  status: string;
  created_at: string;
  values: Record<string, any>;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface ExportField {
  id: string;
  label: string;
  field_type: string;
  position?: number;
}

export interface PdfGenerationOptions {
  title: string;
  subtitle?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  pageOrientation: 'portrait' | 'landscape';
}

export interface PdfExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}
